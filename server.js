require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Flat structure static files
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- IN-MEMORY DATABASE FOR HACKATHON ---
const aiMemory = new Map();

setInterval(() => {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (const [userId, session] of aiMemory.entries()) {
        if (session.lastActive < twoHoursAgo) {
            aiMemory.delete(userId);
            console.log(`[AI Memory] Cleared old context for user: ${userId}`);
        }
    }
}, 30 * 60 * 1000);

const adminAnalytics = [];
app.post('/api/track', (req, res) => {
    const { userId, name, action, details } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    adminAnalytics.unshift({
        time: new Date().toLocaleString(),
        userId: userId || 'Guest',
        name: name || 'Anonymous',
        action,
        ip,
        device: userAgent.split(') ')[0] + ')',
        details
    });
    
    if(adminAnalytics.length > 100) adminAnalytics.pop();
    res.json({ success: true });
});

// --- API ENDPOINTS ---
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === actualPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: "Invalid password" });
    }
});

app.get('/api/admin/stats', (req, res) => {
    res.json({ analytics: adminAnalytics });
});

app.post('/api/chat', async (req, res) => {
    const { prompt, language, userId, customContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) return res.status(500).json({ error: "API key is missing on the server." });

    const activeUserId = userId || 'anonymous';
    if (!aiMemory.has(activeUserId)) {
        aiMemory.set(activeUserId, { history: [], lastActive: Date.now() });
    }
    const userSession = aiMemory.get(activeUserId);
    userSession.lastActive = Date.now();
    
    let historyContext = userSession.history.map(msg => `User: ${msg.user}\nAI: ${msg.ai}`).join('\n\n');
    let extraContext = customContext ? `\n\n[SYSTEM NOTE: The user is asking about the following data from their dashboard:\n${customContext}]` : '';

    const systemInstruction = `You are 'Eco Sparks AI', a friendly, human-like energy-saving assistant. 
    Rule 1: Answer in ${language} strictly. 
    Rule 2: Never mention Google, Gemini, or being an AI.
    Rule 3: Keep answers medium length: Direct answer, short explanation, bullet points, brief conclusion.
    Rule 4: Do not give dangerous electrical wiring instructions.
    Rule 5: You have memory of the conversation. Use it to keep context.
    
    Previous Conversation History:
    ${historyContext ? historyContext : 'No previous history.'}
    ${extraContext}
    `;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\nNew User question: " + prompt }] }]
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
            
            userSession.history.push({ user: prompt, ai: aiText });
            if(userSession.history.length > 5) userSession.history.shift();
            
            return res.json({ response: aiText });

        } catch (error) {
            retries--;
            if (retries < 0) {
                return res.status(503).json({ error: "Eco Sparks AI is experiencing high traffic. Please try again." });
            }
            await new Promise(res => setTimeout(res, 1500));
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eco Sparks server running perfectly on port ${PORT}`);
});
