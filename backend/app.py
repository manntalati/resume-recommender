from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from backend.main import job_posting, extract_resume_info, analyze_resume_and_job, chat_with_ai

app = Flask(__name__)
app.secret_key = 'resume-recommender-secret-key'
CORS(app, origins="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def root():
    return jsonify({'message': 'Resume Recommender API is running'})

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        job_link = request.form.get('job_link')
        if not job_link:
            return jsonify({'error': 'No job link provided'}), 400
        
        filename = secure_filename(resume_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(temp_path)
        
        try:
            resume_info = extract_resume_info(temp_path)
            job_info = job_posting(job_link)            
            analysis_result = analyze_resume_and_job(resume_info, job_info)
                
            if analysis_result['success']:
                ai_response = analysis_result['analysis']
                return jsonify({
                    'status': 'success',
                    'message': ai_response,
                    'resume_content': resume_info,
                    'job_content': job_info
                })
            else:
                print(f"Analysis failed: {analysis_result['error']}")
                return jsonify({
                    'error': analysis_result['error']
                }), 500
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    resume_content = data.get('resume_content', '')
    job_content = data.get('job_content', '')
    
    if not resume_content or not job_content:
        return jsonify({'error': 'Missing resume or job data. Please analyze a resume first.'}), 400
    
    chat_result = chat_with_ai(resume_content, message, None, job_content)
    
    if chat_result['success']:
        response = {
            'id': str(len(message) + 1),
            'text': chat_result['response'],
            'sender': 'bot',
            'timestamp': '2024-01-01T00:00:00Z'
        }
        return jsonify(response)
    else:
        return jsonify({'error': chat_result['error']}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3050)