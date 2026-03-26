const API_KEY = "AIzaSyAY-UpRrmxdIIY24ZCS6Kd-Mb1vu_hQu8U"; // Replace with your actual Gemini API key
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const fileInput = document.getElementById('file-input');
const fileDropArea = document.getElementById('file-drop-area');
const fileNameDisplay = document.getElementById('file-name');
const resumeTextarea = document.getElementById('resume-text');
const analyzeBtn = document.getElementById('analyze-btn');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('results-section');
const inputSection = document.querySelector('.input-section');

// Set PDF.js Worker if pdfjsLib is loaded
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let extractedText = "";

// Theme Toggle Initiation
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
}
initTheme();

themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
});

// File Upload Event Handling
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.remove('drag-over'), false);
});

fileDropArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFileSelect, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    fileNameDisplay.textContent = `Selected: ${file.name}`;

    if (file.type === 'application/pdf') {
        if (typeof pdfjsLib === 'undefined') {
            alert("PDF.js library is not loaded. Please make sure the script tag is in index.html.");
            return;
        }
        extractTextFromPDF(file);
    } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        fileNameDisplay.textContent += " (Note: DOC/DOCX parsing requires backend processing. Please paste text directly if text extraction fails.)";
    } else {
        alert("Please upload a supported PDF format, or paste your text.");
    }
}

// PDF Text Extraction using PDF.js
async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        extractedText = fullText;
        resumeTextarea.value = "PDF successfully extracted! You can edit the content below before analysis.\n\n" + fullText.substring(0, 500) + (fullText.length > 500 ? "..." : "");
    } catch (error) {
        console.error("Error extracting PDF:", error);
        alert("Failed to read the PDF document. Please paste your resume text manually.");
    }
}

// Analysis Request Handling
analyzeBtn.addEventListener('click', async () => {
    const textToAnalyze = extractedText || resumeTextarea.value.trim();

    if (!textToAnalyze) {
        alert("Please upload a resume or paste your resume text first.");
        return;
    }

    if (API_KEY === "YOUR_API_KEY") {
        alert("Action Required: Please replace 'YOUR_API_KEY' inside script.js with your actual Google Gemini API key to run analysis.");
        return;
    }

    // Toggle UI State to Loading
    inputSection.style.display = 'none';
    loader.style.display = 'flex';
    resultsSection.style.display = 'none';

    try {
        const responseData = await fetchGeminiAnalysis(textToAnalyze);
        displayResults(responseData);
    } catch (error) {
        console.error("Analysis Error:", error);
        alert("An error occurred during analysis: " + error.message);
        // Revert UI State
        inputSection.style.display = 'block';
        loader.style.display = 'none';
    }
});

// Fetch configuration for the Gemini API call
async function fetchGeminiAnalysis(resumeText) {
    const systemPrompt = `You are an expert resume analyzer and career coach. Analyze the resume and return ONLY a valid JSON object with absolutely no markdown wrapping or extra text. Use these exact keys and types:
{
    "overall_score": <number out of 100>,
    "strengths": [<array of 3 strings>],
    "weaknesses": [<array of 3 strings>],
    "ats_compatibility": "<string: High/Medium/Low>",
    "best_fit_roles": [<array of 5 strings>],
    "improvement_tips": [<array of 5 strings>],
    "section_scores": {
        "contact": <number out of 10>,
        "experience": <number out of 10>,
        "education": <number out of 10>,
        "skills": <number out of 10>,
        "formatting": <number out of 10>
    }
}

Resume Text:
${resumeText}`;

    const requestBody = {
        contents: [{
            parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
            temperature: 0.2, // Low temperature for more deterministic/structured JSON
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API Request Failed with status: " + response.status);
    }

    const data = await response.json();
    let jsonString = data.candidates[0].content.parts[0].text;

    // In case model ignores responseMimeType and wraps in markdown format
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
}

// Plotting Response Data into the UI
function displayResults(data) {
    loader.style.display = 'none';
    resultsSection.style.display = 'block';

    // 1. Overall Score & Counter Animation
    animateScorecard(data.overall_score || 0);

    const statusText = document.getElementById('score-status-text');
    if (data.overall_score >= 80) statusText.textContent = "Excellent! Your resume is highly competitive.";
    else if (data.overall_score >= 60) statusText.textContent = "Good, but has room for improvement.";
    else statusText.textContent = "Needs significant improvements to stand out.";

    // 2. ATS Compatibility
    const atsBadge = document.getElementById('ats-badge');
    const atsText = document.getElementById('ats-text');
    const atsIcon = document.getElementById('ats-icon');

    const atsRating = data.ats_compatibility || "Medium";
    atsBadge.className = 'ats-badge ' + getATSClass(atsRating);
    atsText.textContent = atsRating + " Match";

    if (atsRating === "High") atsIcon.className = "fa-solid fa-circle-check";
    else if (atsRating === "Medium") atsIcon.className = "fa-solid fa-triangle-exclamation";
    else atsIcon.className = "fa-solid fa-circle-xmark";

    // 3. Strengths
    populateList('strengths-list', data.strengths || ["No strengths detected."]);

    // 4. Weaknesses
    populateList('weaknesses-list', data.weaknesses || ["No weaknesses detected."]);

    // 5. Best Fit Roles
    const rolesList = document.getElementById('roles-list');
    rolesList.innerHTML = '';
    const roles = data.best_fit_roles || ["No specific role determined"];
    roles.forEach(role => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = role;
        rolesList.appendChild(span);
    });

    // 6. Improvement Tips
    const tipsList = document.getElementById('tips-list');
    tipsList.innerHTML = '';
    const tips = data.improvement_tips || ["Please review your format."];
    tips.forEach(tip => {
        const li = document.createElement('li');
        // Format if the tip contains a colon (e.g., "Formatting: Improve margins")
        if (tip.includes(':')) {
            const parts = tip.split(':');
            li.innerHTML = `<strong>${parts[0]}:</strong>${parts.slice(1).join(':')}`;
        } else {
            li.textContent = tip;
        }
        tipsList.appendChild(li);
    });
}

// Helpers
function getATSClass(level) {
    if (level === "High") return "success";
    if (level === "Medium") return "warning";
    return "danger";
}

function populateList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

function animateScorecard(targetScore) {
    const scoreText = document.getElementById('score-text');
    const circle = document.getElementById('score-circle');

    // SVG circle has radius 40 -> circum ≈ 251.2
    const circumference = 251;
    circle.style.strokeDasharray = circumference;

    let currentScore = 0;
    const duration = 1500; // Animation duration in ms
    const intervalTime = 20;
    const step = (targetScore / duration) * intervalTime;

    // Reset transition before animation start to reset visual line
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = circumference;

    // Trigger browser reflow to apply offset instantly
    circle.getBoundingClientRect();

    // Apply smooth CSS transition targeting the final offset
    circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.1, 0.7, 0.1, 1)';
    const targetOffset = circumference - (targetScore / 100) * circumference;
    circle.style.strokeDashoffset = targetOffset;

    // JavaScript Interval for counter incrementing
    const counterInterval = setInterval(() => {
        currentScore += step;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(counterInterval);
        }
        scoreText.textContent = Math.round(currentScore);
    }, intervalTime);
}

// Add Copy & Reset Buttons Dynamically
document.addEventListener('DOMContentLoaded', () => {
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'results-actions';
    actionsWrapper.style.display = 'flex';
    actionsWrapper.style.gap = '1rem';
    actionsWrapper.style.justifyContent = 'center';
    actionsWrapper.style.marginTop = '2rem';

    actionsWrapper.innerHTML = `
        <button id="copy-btn" class="primary-btn" style="background: var(--success); font-size: 1rem; padding: 0.8rem 2rem;">
            <i class="fa-solid fa-copy"></i> Copy Results
        </button>
        <button id="reset-btn" class="primary-btn" style="background: var(--danger); font-size: 1rem; padding: 0.8rem 2rem;">
            <i class="fa-solid fa-rotate-left"></i> Start Over
        </button>
    `;

    resultsSection.appendChild(actionsWrapper);

    // Copy Results Functionality
    document.getElementById('copy-btn').addEventListener('click', () => {
        const resultText = `AI Resume Analysis
Overall Score: ${document.getElementById('score-text').textContent}%

Strengths:
${Array.from(document.getElementById('strengths-list').children).map(li => "- " + li.innerText).join('\n')}

Weaknesses:
${Array.from(document.getElementById('weaknesses-list').children).map(li => "- " + li.innerText).join('\n')}

Best Fit Roles:
${Array.from(document.getElementById('roles-list').children).map(span => span.textContent).join(', ')}`;

        navigator.clipboard.writeText(resultText).then(() => {
            alert('Analysis results copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // Reset Flow
    document.getElementById('reset-btn').addEventListener('click', () => {
        resultsSection.style.display = 'none';
        inputSection.style.display = 'block';
        resumeTextarea.value = '';
        extractedText = '';
        fileNameDisplay.textContent = 'Supported formats: PDF, DOC, DOCX (Max 5MB)';
        fileInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
