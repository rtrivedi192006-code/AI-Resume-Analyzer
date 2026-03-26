# 📄 AI Resume Analyzer

An intelligent, modern web application that leverages the power of the Google Gemini API to analyze resumes. It provides instant, actionable feedback to help candidates improve their ATS compatibility, discover best-fit roles, and highlight their key strengths.

## 📸 Screenshots

<!-- Screenshot Placeholder -->
> *[Add a high-quality screenshot of your application here, e.g., `![App Screenshot](assets/screenshot.png)`]*

## ✨ Features

- **Instant AI Analysis:** Powered by Google's Gemini 1.5 Pro model for deep resume insights.
- **ATS Compatibility Check:** Get a High, Medium, or Low match score mimicking Applicant Tracking Systems.
- **Actionable Feedback:** Generates smart suggestions on how to improve structure, metrics, and content.
- **Role Suggestions:** Automatically recommends the top 5 best fit roles based on your experience.
- **Smooth Glassmorphism UI:** A sleek, modern user interface featuring premium dark and light modes.
- **Seamless Data Extraction:** Native integration with PDF.js for effortless PDF parsing straight into the browser.
- **One-Click Export:** Easily copy the generated analysis to your clipboard.

## 🛠️ Tech Stack

- **HTML:** Semantic structure for optimal accessibility.
- **CSS:** Custom variables, grid layouts, and a responsive glassmorphism design.
- **JavaScript:** Client-side logic handling UI state, PDF parsing, and API interactions.
- **Gemini API:** Core generative AI engine (`gemini-1.5-pro`) for intelligent resume parsing and analysis.

## 🚀 Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/ai-resume-analyzer.git
   cd ai-resume-analyzer
   ```

2. **Get a Gemini API Key:**
   Visit [Google AI Studio](https://aistudio.google.com/) and create a free API Key.

3. **Configure your API Key:**
   Open `script.js` and paste your key at the very top:
   ```javascript
   const API_KEY = "YOUR_API_KEY"; // Replace with your actual Gemini API key
   ```

4. **Run the App:**
   Open `index.html` in your favorite browser. If you prefer using a local dev server, you can run:
   ```bash
   npx live-server .
   ```

## 🖱️ How to Use

1. **Open the App:** Launch the web page in your browser.
2. **Upload your Resume:** Drag and drop a standard PDF document into the upload zone, or click to browse files.
3. **Verify Text:** Review the automatically extracted text displayed in the text area (you can edit anything before moving forward).
4. **Analyze:** Hit the "Analyze Resume" button to send the text to the Gemini API.
5. **Review Results:** Read through the comprehensive generated feedback, including your overall score, key strengths, and areas to improve.
6. **Copy Feedback:** Use the "Copy Results" button to save the text to your clipboard for further reference.

## 📁 File Structure

```text
ai-resume-analyzer/
│
├── index.html       # The main interface and document structure
├── style.css        # Glassmorphism styling, animations, and themes
├── script.js        # Logic handling API interaction and PDF extraction
└── README.md        # Project documentation
```

## 🌐 API Reference

This application communicates directly with the **Google Gemini API**.
- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`
- **Output:** The prompt explicitly requests a `responseMimeType: "application/json"` to enforce structured analysis results.

## 🤝 Contributing

Contributions are always welcome! If you have ideas for improvements:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
