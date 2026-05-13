SmartTeaCare 🍃

An AI-Powered Tea Leaf Disease Detection and Treatment Recommendation System for Smart Tea Plantation Management in Sri Lanka.

---

🎯 Project Overview

SmartTeaCare is a comprehensive Artificial Intelligence-powered web application developed to support the Sri Lankan tea cultivation industry through automated tea leaf disease detection and intelligent treatment recommendations.

This final year university project combines:

Deep Learning
Computer Vision
Modern Web Technologies
Cloud Computing
Smart Agriculture Concepts

to provide a localized, multilingual, and user-friendly disease management platform for tea farmers and plantation stakeholders.

The system is capable of analyzing uploaded tea leaf images using a ResNet50 transfer learning model and generating:

disease predictions,
confidence scores,
severity analysis,
and treatment recommendations.

---

🌟 Key Features

🍃 AI-Powered Tea Leaf Disease Detection

* Upload tea leaf images for instant disease analysis
* Deep Learning-based classification using ResNet50
* Real-time prediction results
* Confidence percentage analysis
* Severity level detection

---

💊 Treatment Recommendation System

* Disease-specific treatment guidance
* Organic and chemical treatment suggestions
* Early disease management support
* Practical agricultural recommendations

---

🌐 Multilingual Support

The platform supports:

* English
* Sinhala
* Tamil

to improve accessibility for Sri Lankan tea farmers.

---

📊 Detection History Management

* Store previous analyses
* View historical disease records
* Monitor plantation health trends
* Track disease occurrences over time

---

👤 User Management

* Secure authentication system
* User profile management
* Profile image uploading
* Cloud-based user data storage

---

🛡️ Admin Dashboard

* System statistics monitoring
* User activity management
* Disease detection analytics

---

🤖 AI Features

* Deep Learning-based image classification
* Transfer Learning using ResNet50
* PyTorch AI integration
* Image preprocessing pipeline
* Confidence score generation
* Multi-class disease classification

---

🍂 Supported Disease Categories

The current system supports detection of:

* Algal Leaf Spot
* Brown Blight
* Gray Blight
* Red Leaf Spot
* Helopeltis
* Healthy Tea Leaves

---

🛠️ Technical Architecture

Frontend Stack

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router

---

Backend Stack

* FastAPI
* Python
* Uvicorn

---

AI & Machine Learning

* PyTorch
* ResNet50 Transfer Learning
* TorchVision
* PIL
* NumPy

---

Database & Cloud Services

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage

---

🚀 Getting Started

📋 Prerequisites

Before running the project, ensure the following are installed:

* Node.js v18+
* Python v3.10+
* npm
* Git

---

⚙️ Clone Repository

```bash
git clone https://github.com/Liyanagelsa/Smart-Tea-Care.git
cd Smart-Tea-Care
```

---

🖥️ Frontend Setup

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

⚙️ Backend Setup

Open another terminal and navigate to backend:

```bash
cd backend
```

Create virtual environment:

## Windows

```bash
python -m venv venv
venv\Scripts\activate
```

## Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

---

🔐 Environment Variables

Create a `.env` file inside backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

▶️ Run Backend Server

```bash
uvicorn app:app --reload
```

Backend API runs on:

```bash
http://127.0.0.1:8000
```

---

📚 API Endpoints

Disease Detection

```http
POST /predict
```

Upload tea leaf images for disease detection.

---

Authentication

```http
POST /auth/register
POST /auth/login
```

---

Detection History

```http
GET /history
```

Retrieve previous disease analyses.

---

👨‍💻 System Workflow

1. User uploads tea leaf image
2. Image preprocessing is performed
3. AI model analyzes the image
4. Disease prediction is generated
5. Confidence score is calculated
6. Severity level is determined
7. Treatment recommendation is displayed
8. Detection history is stored in database

---

🔬 Research Context

This project was developed based on research areas including:

* Deep Learning for Plant Disease Detection
* Computer Vision in Agriculture
* Smart Farming Technologies
* Transfer Learning Applications
* AI-based Agricultural Decision Support Systems

Key research influences include:

* Mohanty et al. (2016)
* Ferentinos (2018)
* Too et al. (2019)
* He et al. (2016)

---

👨‍🎓 Academic Information

This project was developed by Sandali Ashinsana as a Final Year Research Project for the:

**BSc (Hons) Software Engineering Degree Programme**
**Plymouth University**

Supervisor:
**Ms. Dulanjali Wijesekara**

---

📄 License

This project was developed for academic and research purposes.
All rights reserved.

---

🙏 Acknowledgments

Special thanks to:

* Project supervisor and academic staff
* Tea farming communities
* Open-source contributors
* PyTorch, React, FastAPI, and Supabase communities

---

# 🔗 GitHub Repository

Repository Link:

https://github.com/Liyanagelsa/Smart-Tea-Care

---
