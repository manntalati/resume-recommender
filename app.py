from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from main import job_posting, extract_resume_info, analyze_resume_and_job, chat_with_ai

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
app.secret_key = 'resume-recommender-secret-key'
CORS(app)

UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/analyze', methods=['POST'])
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
            
            session['resume_content'] = resume_info
            session['job_info'] = job_info
            session['analysis_result'] = analysis_result['analysis']
            
            if analysis_result['success']:
                ai_response = analysis_result['analysis']
                recommendations = [
                    {
                        'id': '1',
                        'type': 'rating',
                        'title': 'Resume Analysis Complete',
                        'content': 'Your resume has been analyzed against the job requirements. Review the detailed recommendations below.',
                        'icon': 'star',
                        'color': 'text-accent-400'
                    }
                ]
                
                return jsonify({
                    'score': 75,
                    'recommendations': recommendations,
                    'message': ai_response,
                    'status': 'success'
                })
            else:
                return jsonify({
                    'error': analysis_result['error']
                }), 500
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/debug/resume', methods=['GET'])
def debug_resume():
    """Debug endpoint to check resume content in session"""
    resume_content = session.get('resume_content')
    job_info = session.get('job_info')
    
    if resume_content:
        return jsonify({
            'has_resume': True,
            'content_length': len(resume_content),
            'content_preview': resume_content[:500] + '...' if len(resume_content) > 500 else resume_content,
            'has_job_info': bool(job_info),
            'job_info_length': len(job_info) if job_info else 0,
            'job_info_preview': job_info[:500] + '...' if job_info and len(job_info) > 500 else job_info
        })
    else:
        return jsonify({
            'has_resume': False,
            'message': 'No resume content in session'
        })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        resume_content = session.get('resume_content')
        job_info = session.get('job_info')
        analysis_result = session.get('analysis_result')
        
        if not resume_content:
            return jsonify({'error': 'No resume uploaded. Please upload a resume first.'}), 400
    
        chat_result = chat_with_ai(resume_content, message, analysis_result, job_info)
        
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
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3050) 