#!/usr/bin/env python3

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from backend.main import job_posting, extract_resume_info, analyze_resume_and_job, chat_with_ai
    print("✅ All imports successful!")
    print("✅ Functions available:")
    print("  - job_posting")
    print("  - extract_resume_info") 
    print("  - analyze_resume_and_job")
    print("  - chat_with_ai")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1) 