require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// 🚀 ULTIMATE AUTO-SCANNER: Khud dhoondhega index.html kahan hai
let publicPath = __dirname; 
const searchPaths = [
    path.join(__dirname, 'public'),  // Agar public folder me hai
    __dirname,                       // Agar direct bahar hai
    path.join(__dirname, 'src'),     // Agar src folder me hai
    path.join(__dirname, 'src', 'public'), // Agar src/public me hai
    path.join(__dirname, '..')       // Agar server.js khud kisi folder me hai
];

for (const folder of searchPaths) {
    if (fs.existsSync(path.join(folder, 'index.html'))) {
        publicPath = folder;
        break;
    }
}

console.log(`[Auto-Detect] Serving website exactly from: ${publicPath}`);

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === actualPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Invalid password" });
    }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { prompt, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
        return res.status(500).json({ error: "API key is missing on the server." });
    }

    const systemInstruction = `You are 'Eco Sparks AI', a friendly, human-like energy-saving assistant. 
    Rule 1: Answer in ${language} strictly. 
    Rule 2: Never mention Google, Gemini, or being an AI language model.
    Rule 3: Keep answers medium length: Direct answer, short explanation, 3-5 bullet points, brief conclusion.
    Rule 4: Do not give dangerous electrical wiring instructions (like MCB installation); advise a qualified electrician.
    Rule 5: Be warm and conversational, like a helpful friend.`;

    const requestBody = {
        contents: [
            { role: "user", parts: [{ text: systemInstruction + "\n\nUser question: " + prompt }] }
        ]
    };

    let retries = 2;
    while (retries >= 0) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 503) throw new Error("503 Service Unavailable");
            
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const aiText = data.candidates[0].content.parts[0].text;
            return res.json({ response: aiText });

        } catch (error) {
            retries--;
            if (retries < 0) {
                return res.status(503).json({ 
                    error: "Eco Sparks AI is currently experiencing high traffic. Please try again."
                });
            }
            await new Promise(res => setTimeout(res, 1500));
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eco Sparks server running perfectly on port ${PORT}`);
});
