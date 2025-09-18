# Testing with TestSprite - Fibero AI

This document explains how to test the Fibero AI application using TestSprite, an AI-driven testing platform.

## Prerequisites

- Node.js >= 22 (✅ You have v22.18.0)
- TestSprite account and API key
- TestSprite MCP package (✅ Installed)

## Setup Instructions

### 1. Get Your TestSprite API Key

1. Visit [TestSprite Dashboard](https://www.testsprite.com/auth/cognito/sign-in)
2. Sign up for a free account if needed
3. Navigate to **Settings > API Keys**
4. Click **"New API Key"** and copy it
5. Replace `your-api-key-here` in `.testsprite-config.json` with your actual API key

### 2. Configure Your IDE

For Windsurf/Cursor/VSCode, add the TestSprite MCP configuration:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-actual-api-key"
      }
    }
  }
}
```

### 3. Start Your Development Server

Before testing, ensure your Fibero AI application is running:

```bash
npm run dev
```

The app should be accessible at `http://localhost:3000`

## What TestSprite Will Test

TestSprite will automatically analyze and test:

### Frontend Testing
- **React Components**: ModelComparison, LoginPage, SignupPage, SettingsPage
- **User Authentication**: Firebase auth flow, email verification
- **Credit System**: Credit purchase, deduction, validation
- **UI/UX**: Dark mode toggle, responsive design, navigation
- **Model Integration**: OpenRouter API calls, response handling

### Backend Testing
- **API Routes**: `/api/chat` endpoint functionality
- **Authentication**: User session validation
- **Credit Management**: Credit deduction and validation
- **Error Handling**: Invalid requests, insufficient credits
- **Security**: Input validation, authorization checks

### Comprehensive Test Coverage
- **Functional Testing**: Core features work as expected
- **Error Handling**: Graceful failure scenarios
- **Security Testing**: Authentication and authorization
- **Boundary Testing**: Edge cases and limits
- **Concurrency Testing**: Multiple simultaneous requests
- **UI Testing**: User interface interactions

## How to Run Tests

### Option 1: Through IDE (Recommended)
1. Open your IDE with TestSprite MCP configured
2. Simply ask your AI assistant: "Help me test this project with TestSprite"
3. TestSprite will automatically:
   - Read your project structure
   - Analyze your code
   - Generate comprehensive test plans
   - Execute tests
   - Provide detailed results and fixes

### Option 2: Direct Command
```bash
npx @testsprite/testsprite-mcp@latest
```

## Project Structure for Testing

```
fibero-ai/
├── app/
│   ├── api/chat/          # API endpoint testing
│   ├── components/        # React component testing
│   │   ├── ModelComparison.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ...
│   └── ...
├── contexts/
│   └── AuthContext.tsx    # Authentication testing
├── lib/
│   └── firebase.ts        # Firebase integration testing
└── ...
```

## Key Features to Test

### 1. Authentication Flow
- User registration and login
- Email verification process
- Password reset functionality
- Google OAuth integration

### 2. Credit System
- Initial 10 free credits for new users
- Credit deduction (2 credits per prompt)
- Credit purchase flow
- Insufficient credit handling

### 3. AI Model Comparison
- Multiple model selection
- Prompt submission and processing
- Response comparison and rating
- Best response selection

### 4. UI Components
- Dark/light mode toggle
- Responsive design across devices
- Navigation and user interactions
- Error states and loading indicators

## Expected Test Results

TestSprite will provide:
- **90%+ Code Quality** assessment
- **Detailed Bug Reports** with automatic fixes
- **Security Vulnerability** identification
- **Performance Optimization** suggestions
- **UI/UX Improvement** recommendations

## Troubleshooting

### Common Issues
1. **API Key Not Working**: Ensure you've copied the correct key from TestSprite dashboard
2. **MCP Server Not Starting**: Check Node.js version (must be >= 22)
3. **Tests Not Running**: Verify your app is running on localhost:3000

### Support
- [TestSprite Documentation](https://docs.testsprite.com/)
- [TestSprite Community Discord](https://discord.gg/QQB9tJ973e)
- [Contact TestSprite Support](https://calendly.com/contact-hmul/schedule)

## Integration with Existing Memories

Based on your previous work:
- ✅ Firebase authentication system is implemented
- ✅ Credit system with Firestore integration is ready
- ✅ Email verification flow is configured
- ✅ Model comparison with OpenRouter API is functional

TestSprite will validate all these systems work correctly together and identify any integration issues.
