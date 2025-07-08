# Neural Synth Modeler Frontend

A modern, minimalist React frontend for the Neural Synth Modeler service. This application allows users to upload audio files and receive AI-generated synthesizer presets.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist design with muted pastel color scheme
- **File Upload**: Drag-and-drop or click-to-browse file upload functionality
- **Real-time Status**: Track upload progress and processing status
- **Vital Compatibility**: Generated presets are compatible with Vital synthesizer

## Design System

### Color Palette
- **Primary Background**: Soft cream (#F8F7F4)
- **Secondary Background**: Very light mint green (#F0F7F4)
- **Accent Colors**: 
  - Muted lavender (#E8E4F0)
  - Soft butter yellow (#F7F4E8)
  - Gentle sage green (#E8F0E8)
- **Text**: Dark charcoal (#2C3E50)
- **Borders**: Light gray (#E5E7EB)

### Typography
- **Headings**: Inter or SF Pro Display (Light 300)
- **Body Text**: Inter or system font (Regular 400)

## Project Structure

```
src/
├── components/
│   └── Navbar/
│       ├── Navbar.tsx
│       ├── Navbar.css
│       └── index.ts
├── pages/
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── Home.css
│   │   └── index.ts
│   └── Convert/
│       ├── Convert.tsx
│       ├── Convert.css
│       └── index.ts
├── services/
│   └── api.ts
├── App.tsx
├── App.css
└── index.tsx
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Backend Integration

The frontend expects the Java Spring Boot backend to be running on `http://localhost:8080`. Make sure the backend is running before testing the upload functionality.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## API Endpoints

The frontend communicates with the following backend endpoints:

- `POST /v1/models/vital/infer` - Upload audio file for processing
- `GET /v1/infer-audio/status/{id}` - Check processing status
- `GET /v1/infer-audio/download/{id}` - Download generated preset

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and structure
2. Ensure all components are responsive
3. Test on multiple screen sizes
4. Maintain the established color scheme and typography

## License

This project is part of the Neural Synth Modeler system.
