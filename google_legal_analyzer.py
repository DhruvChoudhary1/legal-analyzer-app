import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import PyPDF2
import docx
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Google Cloud AI imports
try:
    import google.generativeai as genai
    from google.oauth2 import service_account
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    GOOGLE_AI_AVAILABLE = False
    print("Warning: Google AI libraries not installed. Install with: pip install google-generativeai")

# Load environment variables from backend/.env file
backend_env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=backend_env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleCloudLegalAnalyzer:
    """Legal Document Analysis using Google Cloud Generative AI (Gemini)"""
    
    def __init__(self):
        """Initialize the analyzer with Google Cloud AI configuration"""
        self.model_name = "gemini-1.5-flash"  # You can also use "gemini-1.5-pro" for more complex analysis
        
        # Initialize Google AI
        self._setup_google_ai()
        
        logger.info("Google Cloud Legal Document Analyzer initialized")
        logger.info(f"Using model: {self.model_name}")
    
    def _setup_google_ai(self):
        """Setup Google Cloud AI authentication and model"""
        if not GOOGLE_AI_AVAILABLE:
            raise ImportError("Google AI libraries not available. Install with: pip install google-generativeai")
        
        # Get API key from environment variable
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not api_key:
            raise ValueError(
                "GOOGLE_AI_API_KEY not found in environment variables. "
                "Please set your API key in backend/.env file or environment."
            )
        
        # Configure the API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        try:
            self.model = genai.GenerativeModel(self.model_name)
            logger.info("Google AI model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google AI model: {e}")
            raise
    
    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from document based on file type"""
        file_extension = Path(file_path).suffix.lower()
        
        try:
            if file_extension == '.pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension == '.docx':
                return self._extract_from_docx(file_path)
            elif file_extension == '.txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}. Please use PDF, DOCX, or TXT files.")
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e}")
            raise
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error reading PDF file: {e}")
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error reading DOCX file: {e}")
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            raise Exception(f"Error reading TXT file: {e}")
    
    def analyze_document(self, file_path: str) -> Dict[str, Any]:
        """Analyze a legal document using Google Cloud AI and return structured results"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            logger.info(f"Analyzing document: {Path(file_path).name}")
            
            # Extract text from document
            document_text = self.extract_text_from_file(file_path)
            
            if not document_text.strip():
                raise ValueError("No text could be extracted from the document")
            
            # Detect document type first for logging
            document_type = self._detect_document_type(document_text)
            logger.info(f"Document type detected: {document_type}")
            
            # Truncate if too long (Gemini has token limits)
            max_chars = 30000  # Conservative limit for Gemini
            if len(document_text) > max_chars:
                document_text = document_text[:max_chars] + "\n\n[Document truncated for analysis...]"
                logger.info(f"Document truncated to {max_chars} characters")
            
            # Create analysis prompt based on document type
            prompt = self._create_analysis_prompt(document_text)
            
            # Call Google Cloud AI
            logger.info(f"Sending {document_type} document to Google Cloud AI for analysis...")
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("No response received from Google Cloud AI")
            
            # Parse the response into structured data
            analysis_result = self._parse_ai_response(response.text)
            
            # Add metadata about the analysis
            analysis_result["detectedDocumentType"] = document_type
            analysis_result["analysisMetadata"] = {
                "documentLength": len(document_text),
                "processingTime": "completed",
                "aiModel": self.model_name,
                "analysisType": f"{document_type}_specific"
            }
            
            logger.info(f"{document_type.title()} document analysis completed successfully")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            raise
    
    def _detect_document_type(self, document_text: str) -> str:
        """Detect the type of legal document using Google Generative AI - Pure AI approach"""
        try:
            # Create an enhanced prompt for accurate document type detection
            detection_prompt = f"""You are a specialized legal document classifier. Analyze this legal document and determine its EXACT type.

DOCUMENT TO CLASSIFY:
{document_text[:4000]}

Your task is to classify this document into ONE of these specific categories:

📋 CONTRACT TYPES:
- contract: Business agreements, service contracts, purchase agreements
- nda: Non-disclosure agreements, confidentiality agreements  
- employment: Employment contracts, job agreements, work contracts
- lease: Rental agreements, property lease documents
- partnership: Business partnership agreements, joint ventures
- license: Licensing agreements, software licenses, IP licenses
- settlement: Legal settlement agreements, dispute resolutions
- loan: Loan agreements, promissory notes, credit agreements
- insurance: Insurance policies, insurance agreements

📊 CORPORATE & PROPERTY:
- corporate: Corporate bylaws, articles of incorporation, board resolutions
- real_estate: Property purchase agreements, real estate transactions
- power_of_attorney: Legal power of attorney documents

⚖️ COURT & LEGAL DOCUMENTS:
- judgment: Court judgments, judicial decisions, court rulings with legal reasoning
- court_order: Court orders, directives, injunctions (commands from court)
- affidavit: Sworn statements, affidavits, statutory declarations
- legal_notice: Legal notices, cease and desist letters, demand letters

🔍 CLASSIFICATION INSTRUCTIONS:
1. Read the document carefully and identify its primary legal purpose
2. Look for specific legal language, document structure, and format
3. Pay attention to Indian/international legal terminology
4. Distinguish between court judgments (decisions with reasoning) vs court orders (directives)
5. Consider the document's main function and legal effect

CRITICAL: Return ONLY the exact category name (one word), nothing else.

Document Type:"""

            # Get AI classification
            response = self.model.generate_content(detection_prompt)
            detected_type = response.text.strip().lower()
            
            # Validate against our supported types
            valid_types = [
                "contract", "nda", "will", "lease", "employment", "partnership", 
                "power_of_attorney", "license", "settlement", "corporate", 
                "real_estate", "court_order", "judgment", "affidavit", "legal_notice", 
                "insurance", "loan", "general"
            ]
            
            if detected_type in valid_types:
                logger.info(f"✅ AI successfully detected document type: {detected_type}")
                return detected_type
            else:
                logger.warning(f"⚠️ AI returned unrecognized type '{detected_type}', using 'general'")
                return "general"
                
        except Exception as e:
            logger.error(f"Critical error in AI document type detection: {e}")
            logger.warning("AI detection failed - defaulting to 'general' document type")
            return "general"
    
    def _get_document_template(self, document_type: str) -> Dict[str, Any]:
        """Get analysis template based on document type - matching DOCUMENT_TYPES.md exactly"""
        templates = {
            "contract": {
                "fields": ["documentType", "summary", "parties", "keyTerms", "obligations", "deliverables", "timeline", "paymentTerms", "terminationClauses", "penalties", "disputeResolution", "risks", "recommendations"],
                "focus": "contractual obligations, performance requirements, and legal commitments"
            },
            "nda": {
                "fields": ["documentType", "summary", "parties", "confidentialInfo", "restrictions", "duration", "exceptions", "returnRequirements", "penalties", "risks", "recommendations"],
                "focus": "confidentiality obligations, information protection, and disclosure restrictions"
            },
            "will": {
                "fields": ["documentType", "summary", "testator", "executor", "beneficiaries", "assets", "bequests", "guardianship", "conditions", "witnesses", "risks", "recommendations"],
                "focus": "asset distribution, beneficiary rights, and estate planning"
            },
            "lease": {
                "fields": ["documentType", "summary", "parties", "property", "rentAmount", "leaseTerm", "responsibilities", "restrictions", "renewalOptions", "terminationConditions", "securityDeposit", "risks", "recommendations"],
                "focus": "rental obligations, property usage rights, and tenancy terms"
            },
            "employment": {
                "fields": ["documentType", "summary", "parties", "position", "salary", "benefits", "duties", "workingConditions", "terminationConditions", "confidentiality", "nonCompete", "risks", "recommendations"],
                "focus": "employment terms, job responsibilities, and worker rights"
            },
            "partnership": {
                "fields": ["documentType", "summary", "partners", "businessPurpose", "capitalContributions", "profitSharing", "managementStructure", "decisionMaking", "dissolution", "liabilities", "risks", "recommendations"],
                "focus": "business partnership terms, profit sharing, and management responsibilities"
            },
            "power_of_attorney": {
                "fields": ["documentType", "summary", "principal", "agent", "powers", "limitations", "duration", "conditions", "revocation", "witnessRequirements", "risks", "recommendations"],
                "focus": "delegated authority, agent powers, and principal protection"
            },
            "license": {
                "fields": ["documentType", "summary", "parties", "licensedProperty", "scope", "restrictions", "royalties", "term", "terminationRights", "intellectualProperty", "risks", "recommendations"],
                "focus": "usage rights, licensing terms, and intellectual property protection"
            },
            "settlement": {
                "fields": ["documentType", "summary", "parties", "dispute", "settlementAmount", "paymentTerms", "releases", "conditions", "confidentiality", "enforcement", "risks", "recommendations"],
                "focus": "dispute resolution, settlement terms, and legal releases"
            },
            "corporate": {
                "fields": ["documentType", "summary", "entity", "directors", "shareholders", "governance", "voting", "meetings", "fiduciary", "compliance", "risks", "recommendations"],
                "focus": "corporate governance, shareholder rights, and regulatory compliance"
            },
            "real_estate": {
                "fields": ["documentType", "summary", "parties", "property", "purchasePrice", "financing", "contingencies", "inspections", "closing", "warranties", "risks", "recommendations"],
                "focus": "property transfer, purchase terms, and real estate obligations"
            },
            "court_order": {
                "fields": ["documentType", "summary", "court", "parties", "ruling", "requirements", "deadlines", "penalties", "compliance", "appealRights", "risks", "recommendations"],
                "focus": "court mandates, compliance requirements, and legal obligations"
            },
            "judgment": {
                "fields": ["documentType", "summary", "court", "parties", "caseNumber", "legalIssues", "facts", "legalPrinciples", "ratio", "ruling", "precedents", "implications", "recommendations"],
                "focus": "judicial reasoning, legal precedents, and case implications"
            },
            "affidavit": {
                "fields": ["documentType", "summary", "deponent", "purpose", "facts", "statements", "verification", "notarization", "jurisdiction", "consequences", "risks", "recommendations"],
                "focus": "sworn statements, factual declarations, and legal attestations"
            },
            "legal_notice": {
                "fields": ["documentType", "summary", "sender", "recipient", "issue", "demands", "deadlines", "consequences", "legalBasis", "nextSteps", "risks", "recommendations"],
                "focus": "legal demands, compliance requirements, and potential consequences"
            },
            "insurance": {
                "fields": ["documentType", "summary", "parties", "coverage", "premiums", "deductibles", "exclusions", "claims", "beneficiaries", "renewal", "risks", "recommendations"],
                "focus": "insurance coverage, policy terms, and claim procedures"
            },
            "loan": {
                "fields": ["documentType", "summary", "parties", "loanAmount", "interestRate", "repaymentTerms", "collateral", "defaults", "acceleration", "guarantees", "risks", "recommendations"],
                "focus": "lending terms, repayment obligations, and default consequences"
            },
            "general": {
                "fields": ["documentType", "summary", "keyPoints", "parties", "importantDates", "financialTerms", "obligations", "risks", "recommendations"],
                "focus": "general legal provisions and key obligations"
            }
        }
        
        return templates.get(document_type, templates["general"])

    def _create_analysis_prompt(self, document_text: str) -> str:
        """Create a detailed prompt for legal document analysis based on document type"""
        
        # First, detect document type
        document_type = self._detect_document_type(document_text)
        template = self._get_document_template(document_type)
        
        logger.info(f"Detected document type: {document_type}")
        
        # Create dynamic JSON structure based on template with specific descriptions
        json_fields = {}
        for field in template["fields"]:
            if field == "documentType":
                json_fields[field] = f"Specific type of {document_type} document"
            elif field == "summary":
                json_fields[field] = f"Comprehensive summary focusing on {template['focus']} with plain language explanation"
            elif field == "risks":
                json_fields[field] = [f"Detailed risk analysis with severity levels and mitigation strategies for {document_type}"]
            elif field == "recommendations":
                json_fields[field] = [f"Actionable recommendations with step-by-step guidance for {document_type}"]
        # Add document-specific field descriptions (matching DOCUMENT_TYPES.md exactly)
        enhanced_descriptions = {
            "contract": {
                "keyTerms": "Most important contractual provisions",
                "obligations": "What each party must do ",
                "deliverables": "Specific items/services to be provided",
                "timeline": "Important deadlines and milestones",
                "paymentTerms": "Financial obligations and schedules",
                "terminationClauses": "How the contract can end",
                "penalties": "Consequences for breach",
                "disputeResolution": "How conflicts are resolved"
            },
            "nda": {
                "confidentialInfo": "What information is protected",
                "restrictions": "Limitations on use and disclosure",
                "duration": "How long confidentiality lasts",
                "exceptions": "What information is not protected",
                "returnRequirements": "What must be returned/destroyed",
                "penalties": "Consequences for breach"
            },
            "will": {
                "testator": "Person making the will ",
                "executor": "Person managing the estate ",
                "beneficiaries": "Who receives assets ",
                "assets": "Property and belongings being distributed ",
                "bequests": "Specific gifts and distributions ",
                "guardianship": "Care arrangements for minors "
            },
            "lease": {
                "property": "Description of leased premises",
                "rentAmount": "Monthly/periodic payment",
                "leaseTerm": "Duration of the lease",
                "responsibilities": "Maintenance and care duties",
                "securityDeposit": "Upfront payment requirements",
                "renewalOptions": "Extension possibilities"
            },
            "employment": {
                "position": "Job title and role",
                "salary": "Compensation details",
                "benefits": "Healthcare, vacation, etc.",
                "duties": "Job responsibilities",
                "workingConditions": "Hours, location, etc.",
                "nonCompete": "Post-employment restrictions"
            },
            "partnership": {
                "partners": "Business partners involved",
                "businessPurpose": "What the partnership does",
                "capitalContributions": "Money/assets each partner provides",
                "profitSharing": "How profits are divided",
                "managementStructure": "Who makes decisions",
                "dissolution": "How partnership ends"
            },
            "power_of_attorney": {
                "principal": "Person granting power",
                "agent": "Person receiving power",
                "powers": "What the agent can do",
                "limitations": "Restrictions on authority",
                "duration": "How long powers last",
                "revocation": "How to cancel"
            },
            "license": {
                "licensedProperty": "What's being licensed",
                "scope": "Permitted uses",
                "restrictions": "What's not allowed",
                "royalties": "Payment terms",
                "term": "License duration",
                "intellectualProperty": "IP rights and protections"
            },
            "settlement": {
                "dispute": "What conflict is being resolved",
                "settlementAmount": "Payment details",
                "paymentTerms": "When and how payment is made",
                "releases": "What claims are being dropped",
                "conditions": "Requirements for settlement",
                "confidentiality": "Non-disclosure requirements"
            },
            "corporate": {
                "entity": "Corporation details",
                "directors": "Board members and roles",
                "shareholders": "Ownership structure",
                "governance": "How decisions are made",
                "voting": "Shareholder voting rights",
                "compliance": "Regulatory requirements"
            },
            "real_estate": {
                "property": "Real estate being transferred",
                "purchasePrice": "Sale amount",
                "financing": "Loan and mortgage terms",
                "contingencies": "Conditions for sale",
                "inspections": "Property examination requirements",
                "closing": "Transaction completion details"
            },
            "court_order": {
                "court": "Issuing court information",
                "ruling": "Court's decision",
                "requirements": "What must be done",
                "deadlines": "Time limits for compliance",
                "penalties": "Consequences for non-compliance",
                "appealRights": "Options for challenging"
            },
            "judgment": {
                "court": "Court that delivered the judgment",
                "caseNumber": "Official case reference",
                "legalIssues": "Questions of law addressed",
                "facts": "Key factual findings",
                "legalPrinciples": "Legal doctrines applied",
                "ratio": "The legal reasoning behind the decision (ratio decidendi)",
                "ruling": "The final decision",
                "precedents": "Previous cases cited",
                "implications": "Impact on future cases"
            },
            "affidavit": {
                "deponent": "Person making the sworn statement",
                "purpose": "Reason for the affidavit",
                "facts": "Factual statements being attested",
                "statements": "Important declarations made",
                "verification": "How the statement is verified",
                "notarization": "Notary and witnessing details",
                "jurisdiction": "Legal jurisdiction for the affidavit",
                "consequences": "Implications of false statements"
            },
            "legal_notice": {
                "sender": "Who is sending the notice",
                "recipient": "Who must respond",
                "issue": "Problem being addressed",
                "demands": "What is required",
                "deadlines": "Time limits for response",
                "consequences": "What happens if ignored"
            },
            "insurance": {
                "coverage": "What is protected",
                "premiums": "Payment amounts",
                "deductibles": "Out-of-pocket costs",
                "exclusions": "What's not covered",
                "claims": "How to file claims",
                "beneficiaries": "Who receives payouts"
            },
            "loan": {
                "loanAmount": "How much is borrowed",
                "interestRate": "Cost of borrowing",
                "repaymentTerms": "Payment schedule",
                "collateral": "Security for the loan",
                "defaults": "What happens if payments stop",
                "guarantees": "Additional security"
            }
        }
        
        # Apply enhanced descriptions based on document type
        if document_type in enhanced_descriptions:
            for field, enhanced_desc in enhanced_descriptions[document_type].items():
                json_fields[field] = enhanced_desc
        
        # Ensure all template fields are included with proper descriptions
        for field in template["fields"]:
            if field not in json_fields:
                json_fields[field] = f"Relevant {field} information for this document type"
        
        # Create the prompt with enhanced demystification instructions
        prompt = f"""You are an expert legal document analyzer and translator who specializes in DEMYSTIFYING complex legal language for both legal professionals and non-lawyers. Your mission is to make legal documents completely understandable while maintaining accuracy.

DOCUMENT TO ANALYZE:
{document_text}

DOCUMENT TYPE DETECTED: {document_type.upper()}
ANALYSIS FOCUS: {template['focus']}

DEMYSTIFICATION MISSION:
- Translate legal jargon into plain English while preserving legal accuracy
- Explain WHY each provision matters and its real-world implications
- Identify potential risks, opportunities, and red flags
- Provide actionable insights and recommendations
- Include severity levels for risks (LOW/MEDIUM/HIGH/CRITICAL)
- Explain complex legal concepts with analogies when helpful
- Highlight time-sensitive elements and deadlines
- Warn about potential pitfalls and how to avoid them

COMPREHENSIVE ANALYSIS REQUIREMENTS:
1. Break down complex legal language into simple terms
2. Explain the practical impact of each provision
3. Identify what could go wrong and how to prevent it
4. Provide specific, actionable recommendations
5. Include examples where helpful
6. Highlight urgent or time-sensitive matters
7. Explain legal terminology in parentheses when first used
8. Rate risks with severity levels and mitigation strategies

Please provide your analysis in the following JSON structure. Be thorough, accurate, and focus on COMPLETE DEMYSTIFICATION:

{{"""
        
        # Add each field to the JSON structure with clear, simple format
        for i, field in enumerate(template["fields"]):
            if field in json_fields:
                description = json_fields[field]
            else:
                description = f"Relevant {field} information for this document type"
            
            # Use simple string format for all fields to ensure proper parsing
            if field in ["risks", "recommendations"]:
                prompt += f'\n    "{field}": [\n        "First {field[:-1]} item with clear explanation",\n        "Second {field[:-1]} item with actionable details",\n        "Additional {field[:-1]} items as needed"\n    ]'
            elif field in ["obligations", "keyTerms", "statements", "facts", "precedents", "legalPrinciples"]:
                prompt += f'\n    "{field}": [\n        "First {field[:-1]} item with clear explanation",\n        "Second {field[:-1]} item with practical details",\n        "Additional {field[:-1]} items as needed"\n    ]'
            else:
                prompt += f'\n    "{field}": "Provide detailed information about {description}"'
            
            if i < len(template["fields"]) - 1:
                prompt += ","
        
        prompt += """
}

CRITICAL DEMYSTIFICATION INSTRUCTIONS:
1. MANDATORY: Use ONLY the exact field names specified in the JSON structure above - NO OTHER FIELDS
2. COMPLETE ALL FIELDS: Every field in the JSON structure must be filled with relevant information
3. NO EXTRA FIELDS: Do not add fields like "legalImplications" or any other custom fields
4. PLAIN LANGUAGE: Translate ALL legal jargon into simple, understandable terms
5. PRACTICAL IMPACT: Explain what each provision means in real-world terms
6. SIMPLE FORMAT: Use plain text strings and arrays of strings - no nested objects
7. ACTIONABLE INSIGHTS: Provide specific steps people can take
8. TIME SENSITIVITY: Highlight deadlines, expiry dates, and urgent matters
9. EXAMPLES: Use analogies and examples to clarify complex concepts
10. WARNING SIGNS: Identify red flags and potential problems
11. OPPORTUNITIES: Point out beneficial provisions and advantages
12. CONTEXT: Explain why certain provisions exist and their purpose
13. CONSEQUENCES: Clearly state what happens if terms are violated
14. NEXT STEPS: Recommend immediate and long-term actions
15. COMPREHENSIVE COVERAGE: Leave no stone unturned - analyze every significant aspect

STRICT FORMAT REQUIREMENTS:
- Return ONLY valid JSON with the exact field names shown above
- NO additional fields beyond what's specified
- Use simple strings and arrays of strings only
- NO nested objects or complex structures
- MUST include ALL fields from the template

DEMYSTIFICATION GOALS:
- Make complex legal language accessible to everyone
- Identify hidden risks and opportunities
- Provide actionable guidance for decision-making
- Explain the "so what" factor for every provision
- Transform legal complexity into practical understanding
- Empower users with knowledge to make informed decisions

FINAL VALIDATION: Ensure your analysis would help someone completely unfamiliar with legal terminology understand this document's full implications and make informed decisions."""

        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and return structured data"""
        try:
            # Try to find JSON in the response
            response_text = response_text.strip()
            
            # Remove any markdown code block markers
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                start_idx = 1  # Skip the opening ```
                if lines[1].strip().lower() == 'json':
                    start_idx = 2  # Skip ```json
                end_idx = len(lines) - 1
                for i in range(len(lines) - 1, -1, -1):
                    if lines[i].strip() == '```':
                        end_idx = i
                        break
                response_text = '\n'.join(lines[start_idx:end_idx])
            
            # Parse JSON
            parsed_response = json.loads(response_text)
            
            # Keep the response simple - no additional structuring
            # Just ensure it's valid JSON that matches our expected fields
            return parsed_response
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
            
            # Return a fallback response with enhanced error details
            return {
                "documentType": "Document Analysis",
                "summary": "The document was analyzed but the response could not be parsed into structured format. The AI may have provided analysis in an unexpected format.",
                "error": "JSON parsing failed",
                "errorDetails": str(e),
                "rawResponse": response_text[:1000] + "..." if len(response_text) > 1000 else response_text,
                "recommendations": [{
                    "item": "Manual review recommended",
                    "severity": "HIGH", 
                    "explanation": "The automated analysis encountered formatting issues. Please review the raw response above.",
                    "action": "Contact support or retry the analysis"
                }]
            }

# Flask API for integration with Node.js frontend
app = Flask(__name__)
CORS(app, origins=["http://localhost:5000", "http://127.0.0.1:5000"])

# Initialize the analyzer
try:
    analyzer = GoogleCloudLegalAnalyzer()
    logger.info("Analyzer initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Google Cloud Legal Analyzer: {e}")
    analyzer = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if analyzer else "error",
        "service": "Google Cloud Legal Document Analyzer",
        "google_ai_available": GOOGLE_AI_AVAILABLE,
        "analyzer_initialized": analyzer is not None
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_document():
    """Analyze a document file"""
    if not analyzer:
        return jsonify({
            "error": "Google Cloud AI analyzer not initialized. Check your API key and configuration."
        }), 500
    
    try:
        # Check if file is in request
        if 'document' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['document']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file temporarily
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / file.filename
        file.save(str(file_path))
        
        try:
            # Analyze the document
            analysis_result = analyzer.analyze_document(str(file_path))
            
            return jsonify({
                "message": "Analysis completed successfully",
                "fileName": file.filename,
                "analysis": analysis_result
            })
            
        finally:
            # Clean up temporary file
            if file_path.exists():
                file_path.unlink()
        
    except Exception as e:
        logger.error(f"Error in analyze_document: {e}")
        return jsonify({
            "error": f"Analysis failed: {str(e)}"
        }), 500

@app.route('/api/test-ai', methods=['GET'])
def test_ai():
    """Test Google Cloud AI connection"""
    if not analyzer:
        return jsonify({
            "status": "error",
            "message": "Analyzer not initialized"
        }), 500
    
    try:
        # Test with a simple prompt
        test_response = analyzer.model.generate_content("Hello, please respond with 'AI connection successful'")
        return jsonify({
            "status": "success",
            "message": "Google Cloud AI connection successful",
            "test_response": test_response.text
        })
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"AI connection failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    if analyzer:
        logger.info("Starting Google Cloud Legal Document Analyzer API...")
        logger.info("API will be available at: http://localhost:5001")
        logger.info("Health check: http://localhost:5001/api/health")
        logger.info("Test AI: http://localhost:5001/api/test-ai")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        logger.error("Cannot start server - analyzer initialization failed")
        print("\nSetup Instructions:")
        print("1. Get Google AI API key from: https://makersuite.google.com/app/apikey")
        print("2. Add to backend/.env file: GOOGLE_AI_API_KEY=your_api_key_here")
        print("3. Install dependencies: pip install -r requirements.txt")