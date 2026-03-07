# BATT IQ v2.0 - Deployment and Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Firebase Project Setup](#firebase-project-setup)
4. [ML Service Deployment](#ml-service-deployment)
5. [Backend API Deployment](#backend-api-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Production Deployment](#production-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ ([Included with Node.js](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- Python 3.9+ (for ML service) ([Download](https://www.python.org/))
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (optional, for containerized deployment)

### Required Accounts
- Google Account (for Firebase)
- GitHub Account (for repository)
- SendGrid Account (for email notifications, optional)
- Cloud hosting account (GCP, AWS, or Azure)

### Required Services
- Firebase Project (Firestore + Authentication + Hosting + Cloud Functions)
- ML Model API (Cloud Run, Azure ML, or self-hosted)
- Email Service (SendGrid, AWS SES, or Gmail)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/batt-iq.git
cd batt-iq
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
# or
code .env.local
```

**Required Variables**:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ML_API_URL=http://localhost:5000/api/ml
VITE_NOTIFICATION_API_URL=http://localhost:5001/api/notifications
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Run Type Checking

```bash
# Validate TypeScript types
npm run lint
```

---

## Firebase Project Setup

### 1. Create Firebase Project

```bash
firebase init
```

Select these features:
- ✅ Authentication
- ✅ Firestore Database
- ✅ Storage
- ✅ Cloud Functions
- ✅ Hosting
- ✅ Emulators

### 2. Configure Authentication

**Firebase Console → Authentication → Sign-in method**:

1. **Email/Password**
   - Enable Email/Password authentication
   - Enable Email link sign-in (optional)

2. **Google OAuth**
   - Add Google OAuth provider
   - Configure consent screen
   - Set authorized JavaScript origins: `http://localhost:5173`, `https://yourdomain.com`

3. **Multi-Factor Authentication**
   - Enable SMS provider
   - Enable Authenticator app provider

### 3. Configure Firestore Database

**Create Collections**:

```javascript
// Run in Firebase Console > Firestore
// Or use Firebase Admin SDK to create the following structure:

// users collection
// batteries collection
// assessments collection
// notifications collection
// reports collection
// chatbot/intents subcollection
// chatbot/faq subcollection
// analytics collection
```

**Set Security Rules**:

```javascript
// Copy the following to Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }

    match /batteries/{batteryId} {
      allow read, create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    match /assessments/{assessmentId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId;
    }

    match /notifications/{notificationId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    match /reports/{reportId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
    }

    // Admin access
    match /{document=**} {
      allow read, write: if request.auth.token.firebaseRole == 'admin';
    }
  }
}
```

### 4. Configure Cloud Storage

**Create Storage Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{userId}/{document} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

---

## ML Service Deployment

### 1. Create ML Service Project

```bash
# Create project directory
mkdir batiq-ml-service
cd batiq-ml-service

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
numpy==1.24.3
pandas==1.5.3
python-dotenv==1.0.0
pydantic==2.4.2
EOF

pip install -r requirements.txt
```

### 2. Create ML Service Code

**File: `main.py`**

```python
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="BATIQ ML Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained model
try:
    model = joblib.load('battery_health_model.pkl')
    scaler = joblib.load('feature_scaler.pkl')
except FileNotFoundError:
    print("Warning: Model files not found. Using mock model.")
    model = None

# API Key validation
API_KEY = os.getenv("ML_API_KEY", "default-key")

def verify_api_key(x_api_key: str = Header(...)) -> bool:
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return True

class PredictionInput(BaseModel):
    voltage: float
    temperature: float
    chargeCycles: int
    capacity: float
    usageDurationDays: Optional[int] = 0

class PredictionOutput(BaseModel):
    prediction: str
    confidence: float
    probabilities: dict
    featureImportance: dict
    modelVersion: str

@app.post("/api/ml/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput, api_key_valid: bool = Header(None)):
    verify_api_key(api_key_valid)
    
    # Feature normalization
    voltage_norm = (input_data.voltage - 2.8) / (4.2 - 2.8)
    temp_norm = (input_data.temperature + 20) / 90
    cycles_norm = min(input_data.chargeCycles / 1000, 1.0)
    capacity_norm = input_data.capacity / 100
    
    # Prepare features
    features = np.array([[
        voltage_norm,
        temp_norm,
        cycles_norm,
        capacity_norm
    ]])
    
    # Scale features
    if scaler:
        features_scaled = scaler.transform(features)
    else:
        features_scaled = features
    
    # Make prediction
    if model:
        probabilities = model.predict_proba(features_scaled)[0]
        prediction_idx = np.argmax(probabilities)
        predictions = ['good', 'moderate', 'poor']
        prediction = predictions[prediction_idx]
        confidence = float(probabilities[prediction_idx])
    else:
        # Mock prediction
        prediction = 'good'
        confidence = 0.85
        probabilities = [0.85, 0.10, 0.05]
    
    # Feature importance (mock)
    feature_importance = {
        "voltage": 0.25,
        "temperature": 0.30,
        "chargeCycles": 0.25,
        "capacity": 0.20
    }
    
    return PredictionOutput(
        prediction=prediction,
        confidence=confidence,
        probabilities={
            "good": float(probabilities[0]),
            "moderate": float(probabilities[1]),
            "poor": float(probabilities[2])
        },
        featureImportance=feature_importance,
        modelVersion="1.0.0"
    )

@app.get("/api/ml/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

### 3. Deploy ML Service to Cloud Run

```bash
# Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
EOF

# Build and push to Google Cloud
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/batiq-ml-service

# Deploy to Cloud Run
gcloud run deploy batiq-ml-service \
  --image gcr.io/YOUR-PROJECT-ID/batiq-ml-service \
  --region us-central1 \
  --memory 512 \
  --cpu 1 \
  --set-env-vars ML_API_KEY=your_api_key
```

---

## Backend API Deployment

### 1. Create Backend Functions

**File: `functions/src/index.ts`**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

// Triggered after assessment
export const onAssessmentCreated = functions.firestore
  .document('assessments/{assessmentId}')
  .onCreate(async (snap) => {
    const assessment = snap.data();
    const userId = assessment.userId;

    // Generate report
    const report = {
      userId,
      assessmentId: snap.id,
      content: `Battery Health Report for ${assessment.batteryId}`,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('reports').add(report);

    // Send notification
    await admin.firestore().collection('notifications').add({
      userId,
      type: 'assessment_complete',
      message: 'Your battery assessment is complete!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// Scheduled function - daily analytics aggregation
export const aggregateAnalytics = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const date = new Date().toISOString().split('T')[0];
    
    const assessments = await db.collection('assessments')
      .where('assessmentDate', '>=', new Date(date))
      .get();

    const stats = {
      totalAssessments: assessments.size,
      date,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('analytics').add(stats);
  });
```

### 2. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## Frontend Deployment

### 1. Build Frontend

```bash
npm run build
```

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

###3. Custom Domain Setup

```bash
# In Firebase Console:
# 1. Go to Hosting
# 2. Click "Connect domain"
# 3. Follow instructions for DNS configuration
```

---

## Production Deployment

### Deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase Security Rules tested
- [ ] ML model trained and validated
- [ ] Backend APIs tested
- [ ] Frontend built and optimized
- [ ] SSL certificates configured
- [ ] Database backups enabled
- [ ] Monitoring alerts configured
- [ ] Error tracking enabled
- [ ] Analytics configured

### Deployment Script

```bash
#!/bin/bash

echo "Building BATIQ Production..."

# Build frontend
npm run build

# Create Firebase deployment config
firebase deploy --only \
  firestore:rules \
  firestore:indexes \
  storage:rules \
  functions \
  hosting

# Verify deployment
firebase functions:list
firebase hosting:channel:list

echo "Deployment complete!"
```

---

## Monitoring and Maintenance

### Monitor Cloud Functions

```bash
firebase functions:log --limit 50
```

### Monitor Firestore

- Firebase Console → Firestore Storage Usage
- Monitor read/write operations
- Check index usage

### Backup Strategy

```bash
# Weekly backup script
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y%m%d)
```

---

## Troubleshooting

### Common Issues

**Problem**: ML Service returning timeout
```bash
# Solution: Check Cloud Run logs
gcloud run logs read batiq-ml-service --limit 50 --region us-central1
```

**Problem**: Firebase Authentication not working
```bash
# Solution: Verify project credentials and security rules
firebase deploy --only firestore:rules
```

**Problem**: Emails not being sent
```bash
# Solution: Check SendGrid API key and verify sender
firebase functions:log | grep email
```

---

## Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev)
- [BATIQ Architecture](./ARCHITECTURE.md)

**Version**: 2.0  
**Last Updated**: January 2026  
**Next Review**: April 2026
