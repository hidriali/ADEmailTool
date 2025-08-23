# EmailTool - AI-Powered Email Assistant

A modern, React-based email management tool with intelligent classification, AI-powered drafting, grammar checking, and polishing capabilities.

## 🌟 Features

### Core Functionality
- **Smart Email Classification**: Machine learning-powered categorization (Business, Personal, Promotional, Support, Other)
- **AI Email Drafting**: Generate professional email responses with context awareness
- **Grammar & Style Checking**: Real-time grammar correction and style improvements
- **Email Polishing**: Enhance tone, clarity, and professionalism of existing emails
- **Interactive UI**: Clean, modern interface with intuitive user experience

### Advanced Features
- **Real-time Loading Indicators**: Beautiful blue spinner animations for all AI operations
- **Request Cancellation**: Cancel long-running AI requests with dedicated cancel buttons
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ with pip
- Modern web browser

### Installation & Setup

1. **Clone and Setup Frontend**:
   ```bash
   cd emailtool-ui
   npm install
   npm run dev
   ```

2. **Setup Backend Services**:
   ```bash
   cd ../emailtool-new
   pip install -r requirements.txt
   
   # Start email classifier service
   python email_classifier_service.py &
   
   # Start AI service
   python advanced_ai_service.py &
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Email Classifier API: http://localhost:5001
   - AI Services API: http://localhost:5002

## 🏗️ Project Structure

```
emailtool-ui/                   # React Frontend Application
├── src/
│   ├── App.jsx                # Main application component
│   ├── EmailModal.jsx         # Email composition and editing modal
│   ├── PromptBox.jsx          # AI prompt input component
│   ├── BlueSpinner.jsx        # Loading animation components
│   ├── api.js                 # API communication layer
│   └── main.jsx               # Application entry point
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation

emailtool-new/                 # Backend Services
├── advanced_ai_service.py     # AI services (drafting, grammar, polishing)
├── fast_ai_service.py         # Alternative lightweight AI service
├── email_classifier_service.py # Email classification API
├── email_classifier.joblib    # Trained ML model
├── generate_email_dataset.py  # Dataset generation script
├── train_improved_classifier.py # Model training script
├── comprehensive_email_dataset.csv # Training data (51K+ emails)
└── requirements.txt           # Python dependencies
```

## 🧠 AI & Machine Learning

### Email Classification
- **Model**: Logistic Regression with TF-IDF vectorization
- **Training Data**: 51,000+ synthetic emails across 5 categories
- **Accuracy**: High precision classification for business use cases
- **Features**: Subject line analysis, content categorization, confidence scoring

### AI Text Services
- **Grammar Checking**: Advanced grammar and style correction
- **Email Polishing**: Professional tone enhancement and clarity improvement
- **Draft Generation**: Context-aware email composition
- **Real-time Processing**: Fast response times with streaming support

## 🎨 UI/UX Features

### Loading States
- **Blue Spinner Animation**: Elegant loading indicators for all AI operations
- **Multiple Variants**: Dots, pulse, and spin animations
- **Cancel Integration**: Built-in cancellation controls

### Interactive Elements
- **Modal System**: Full-screen email composition and editing
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Keyboard Shortcuts**: Efficient navigation and control
- **Error Feedback**: Clear error messages and recovery options

## 🛠️ Technical Implementation

### Frontend Stack
- **React 18**: Modern component-based architecture
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first styling framework
- **Axios**: HTTP client for API communication

### Backend Stack
- **Flask**: Lightweight Python web framework
- **scikit-learn**: Machine learning and classification
- **CORS**: Cross-origin resource sharing support
- **Logging**: Comprehensive request/response logging

### API Architecture
- **RESTful Design**: Clean, predictable API endpoints
- **Error Handling**: Standardized error responses
- **Request Cancellation**: AbortController support
- **JSON Communication**: Structured data exchange
- **Gmail Integration**: Google Gmail API for email fetching

## 📋 Prerequisites

Before running the system, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Java** (JDK 11 or higher)
- **Maven** (for Java dependency management)
- **Python** (3.8 or higher)
- **PostgreSQL** (running on port 5432)
- **Git**

## 🚀 Quick Start

### 1. Database Setup

First, ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE emailtool;
```

The tables will be created automatically when you run the application for the first time.

### 2. Gmail API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API and Google Calendar API
4. Create OAuth 2.0 credentials
5. Download the credentials file and save it as `credentials/oauth-client.json` in the `emailtool-new` directory

### 3. Start All Services

The easiest way to start all services is using the provided script:

```bash
./start-services.sh
```

This script will:
- Check if PostgreSQL is running
- Start the Python NLP service on port 5001
- Start the Java backend on port 8080
- Start the React frontend on port 5173

### 4. Manual Setup (Alternative)

If you prefer to start services manually:

#### Python NLP Service
```bash
cd emailnlp-env
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Java Backend
```bash
cd emailtool-new
mvn clean install
mvn spring-boot:run
```

#### React Frontend
```bash
cd emailtool-ui
npm install
npm run dev
```

## 🎯 Features

### Email Management
- **Gmail Integration**: Fetch and sync emails from Gmail
- **AI Categorization**: Automatically categorize emails using NLP
- **Smart Filtering**: Filter emails by categories
- **Full-screen View**: Detailed email viewing experience

### AI-Powered Features
- **Email Categorization**: Automatically categorize emails into predefined categories
- **Scheduling Intent Detection**: Detect when emails contain scheduling requests
- **AI Draft Generation**: Generate email drafts using prompts
- **Email Polishing**: Improve email content with AI assistance

### Categories
- Urgent / Action Required
- Work / Professional
- Personal
- Finance
- Newsletters & Subscriptions
- Social & Notifications
- Shopping & Orders
- Travel & Bookings
- Reference / Archives
- Low Priority / Maybe Later

## 🔧 Configuration

### Database Configuration
Edit `emailtool-new/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/emailtool
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### API Endpoints
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **NLP Service**: http://localhost:5001

## 📁 Project Structure

```
emailtool-ui/          # React frontend
├── src/
│   ├── App.jsx        # Main application component
│   ├── EmailModal.jsx # Email composition modal
│   ├── PromptBox.jsx  # AI prompt interface
│   └── api.js         # API service layer

emailtool-new/         # Java backend
├── src/main/java/com/idris/emailtool/
│   ├── EmailToolApplication.java  # Spring Boot main class
│   ├── EmailController.java       # REST API controller
│   └── GmailConnector.java        # Gmail integration

emailnlp-env/          # Python NLP service
├── app.py             # Flask NLP service
└── requirements.txt   # Python dependencies
```

## 🐛 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**
   - Ensure PostgreSQL is running: `brew services start postgresql`
   - Check database credentials in `application.properties`

2. **Gmail API Authentication Error**
   - Verify `credentials/oauth-client.json` exists
   - Check OAuth 2.0 credentials in Google Cloud Console

3. **Port Already in Use**
   - Check if services are already running: `lsof -i :PORT`
   - Kill existing processes: `kill -9 PID`

4. **Python Dependencies Error**
   - Recreate virtual environment: `rm -rf venv && python3 -m venv venv`
   - Reinstall dependencies: `pip install -r requirements.txt`

### Logs
- **Frontend**: Check browser console
- **Backend**: Check terminal where Spring Boot is running
- **NLP Service**: Check terminal where Python service is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify all services are running on the correct ports
