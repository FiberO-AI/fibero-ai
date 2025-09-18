# Fibero AI - Multi-Model Comparison Platform

A Next.js application that allows users to compare responses from multiple AI models simultaneously using OpenRouter.

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🚀 Quick Start](#-quick-start)
- [🎨 UI/Frontend Documentation](#-uifrontend-documentation)
- [⚙️ Backend Documentation](#️-backend-documentation)
- [🔧 Technical Documentation](#-technical-documentation)
- [📝 Change Log](#-change-log)

---

## 🎯 Overview

### Core Features
- **Multi-Model Comparison**: Compare responses from 5 leading AI models simultaneously
- **Dynamic Layout**: Responsive grid that adapts from 1-5 columns based on selected models
- **Real-time Processing**: Send messages to all selected models concurrently
- **Response Management**: Copy responses and mark the best one with visual indicators
- **Dark Mode**: Toggle between light and dark themes with smooth animations
- **Modern UI**: Glass-morphism design with gradients and smooth transitions

### Supported AI Models
- **GPT-4o** (OpenAI) - `openai/gpt-4o`
- **Claude 3.5 Sonnet** (Anthropic) - `anthropic/claude-3.5-sonnet`
- **Gemini 2.0 Flash** (Google) - `google/gemini-2.0-flash-exp`
- **DeepSeek V3** (DeepSeek) - `deepseek/deepseek-chat`
- **Perplexity Sonar** (Perplexity) - `perplexity/llama-3.1-sonar-large-128k-online`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API account

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd fibero-ai
npm install
```

2. **Environment Setup**
Create `.env.local` in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Get OpenRouter API Key**
- Visit [OpenRouter.ai](https://openrouter.ai/)
- Sign up for an account
- Generate an API key from your dashboard
- Add credits to your account

4. **Run Development Server**
```bash
npm run dev
```

5. **Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎨 UI/Frontend Documentation

### Design System

#### Color Palette
- **Primary Gradients**: Blue to Purple (`from-blue-600 to-purple-600`)
- **Model Colors**: 
  - GPT-4o: Emerald (`from-emerald-400 to-emerald-600`)
  - Claude: Orange to Red (`from-orange-400 to-red-500`)
  - Gemini: Blue (`from-blue-400 to-blue-600`)
  - DeepSeek: Purple (`from-purple-400 to-purple-600`)
  - Perplexity: Teal to Cyan (`from-teal-400 to-cyan-500`)

#### Typography
- **Headers**: Bold, gradient text with `bg-clip-text`
- **Body**: Tailwind's default font stack
- **Code**: Monospace for keyboard shortcuts

#### Layout Structure
```
Header (Branding + Dark Mode Toggle)
├── Model Selection Cards (Responsive Grid)
├── Message Input Area (Large Textarea)
└── Response Grid (Dynamic Columns)
    ├── Model Response Cards
    └── Action Buttons (Copy, Mark Best)
```

### Component Architecture

#### Main Component: `ModelComparison.tsx`
- **State Management**: React hooks for models, messages, responses, dark mode
- **Responsive Design**: CSS Grid with breakpoints
- **Animations**: Tailwind transitions with custom durations

#### Key UI Features
- **Glass-morphism**: `backdrop-blur-sm` with semi-transparent backgrounds
- **Hover Effects**: Scale transforms and shadow changes
- **Loading States**: Animated spinners and pulse effects
- **Dark Mode**: Complete theme switching with localStorage persistence

### Responsive Breakpoints
- **Mobile**: 1 column (default)
- **Tablet**: 2 columns (`md:grid-cols-2`)
- **Desktop**: 3-4 columns (`lg:grid-cols-3`, `xl:grid-cols-4`)
- **Large Desktop**: 5 columns (`2xl:grid-cols-5`)

---

## ⚙️ Backend Documentation

### API Architecture

#### Endpoint: `/api/chat`
- **Method**: POST
- **Purpose**: Handle simultaneous requests to multiple AI models via OpenRouter

#### Request Format
```typescript
{
  message: string,           // User's prompt
  models: string[]          // Array of model keys
}
```

#### Response Format
```typescript
{
  success: boolean,
  results: ModelResponse[]
}

interface ModelResponse {
  model: string,            // Model key
  modelName: string,        // Display name
  response: string | null,  // AI response
  error: string | null,     // Error message if failed
  usage?: any              // Token usage data
}
```

### OpenRouter Integration

#### Model Configuration
```typescript
const MODEL_CONFIGS = {
  'gpt-4o': {
    name: 'GPT-4o',
    model: 'openai/gpt-4o',
    maxTokens: 4000
  },
  // ... other models
}
```

#### Request Headers
- `Authorization`: Bearer token with OpenRouter API key
- `Content-Type`: application/json
- `HTTP-Referer`: Site URL for OpenRouter tracking
- `X-Title`: Application identifier

#### Concurrent Processing
- Uses `Promise.all()` to send requests simultaneously
- Individual error handling per model
- Maintains response order matching input models

### Error Handling
- **API Key Missing**: Returns 500 with configuration error
- **Invalid Request**: Returns 400 with validation error
- **Model Errors**: Individual model failures don't affect others
- **Network Errors**: Graceful degradation with error messages

---

## 🔧 Technical Documentation

### Project Structure
```
fibero-ai/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # OpenRouter API integration
│   ├── components/
│   │   └── ModelComparison.tsx  # Main UI component
│   ├── globals.css              # Global styles & Tailwind
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

### Dependencies

#### Core Dependencies
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0", 
  "next": "15.5.2",
  "clsx": "^2.0.0"
}
```

#### Development Dependencies
```json
{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^19", 
  "@types/react-dom": "^19",
  "tailwindcss": "^4",
  "eslint": "^9",
  "eslint-config-next": "15.5.2"
}
```

### Build Configuration
- **Next.js 15**: App Router with Turbopack
- **TypeScript**: Strict mode enabled
- **Tailwind CSS v4**: Latest version with PostCSS
- **ESLint**: Next.js recommended configuration

### Performance Optimizations
- **Concurrent API Calls**: All models called simultaneously
- **React State Management**: Efficient re-renders with proper dependencies
- **CSS Transitions**: Hardware-accelerated animations
- **Responsive Images**: Next.js Image component (if used)

---

## 📝 Change Log

### Version 1.2.0 - Dark Mode Implementation (Latest)
**Date**: 2025-08-30

#### ✨ New Features
- **Dark Mode Toggle**: Animated toggle switch in top-right corner
- **Theme Persistence**: Dark mode preference saved to localStorage
- **Smooth Transitions**: 500ms duration transitions between themes

#### 🎨 UI Improvements
- **Dark Theme Colors**: 
  - Background: `from-gray-900 via-blue-900 to-indigo-900`
  - Cards: `bg-gray-800/80` with `border-gray-700/30`
  - Text: White and gray variants for proper contrast
- **Enhanced Animations**: Toggle switch with sliding animation
- **Improved Accessibility**: Proper focus states and color contrast

#### 🔧 Technical Changes
- **State Management**: Added `darkMode` state with useEffect for initialization
- **CSS Classes**: Dynamic class application using `clsx` utility
- **DOM Manipulation**: Direct `document.documentElement.classList` updates

### Version 1.1.0 - UI Enhancement
**Date**: 2025-08-30

#### 🎨 Major UI Redesign
- **Glass-morphism Design**: Backdrop blur effects throughout
- **Gradient Backgrounds**: Beautiful color transitions
- **Model Cards**: Individual branding with icons and colors
- **Improved Typography**: Better hierarchy and spacing
- **Hover Animations**: Scale transforms and shadow effects

#### ✨ Enhanced Features
- **Model Icons**: Unique emojis for each AI model
- **Company Branding**: Display company names with models
- **Visual Feedback**: Better loading states and error handling
- **Responsive Grid**: Improved breakpoints for all screen sizes

### Version 1.0.0 - Initial Release
**Date**: 2025-08-30

#### 🚀 Core Features
- **Multi-Model Comparison**: Support for 5 AI models
- **OpenRouter Integration**: Complete API implementation
- **Dynamic Layout**: Responsive column system
- **Response Management**: Copy and "best response" features
- **Modern UI**: Tailwind CSS with responsive design

#### 🔧 Technical Foundation
- **Next.js 15**: App Router architecture
- **TypeScript**: Full type safety
- **API Routes**: Server-side OpenRouter integration
- **Error Handling**: Comprehensive error management

---

### Future Development Guidelines

#### When Making Changes:
1. **Update this README**: Document all new features and changes
2. **Version Bumping**: Follow semantic versioning (MAJOR.MINOR.PATCH)
3. **Change Log**: Add detailed entries with dates and descriptions
4. **Testing**: Ensure all features work in both light and dark modes
5. **Performance**: Monitor API response times and optimize if needed

#### Code Standards:
- **TypeScript**: Maintain strict typing
- **Component Structure**: Keep components focused and reusable
- **CSS Classes**: Use Tailwind utilities with clsx for dynamic classes
- **Error Handling**: Provide meaningful error messages
- **Accessibility**: Ensure proper ARIA labels and keyboard navigation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Update this README with your changes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
