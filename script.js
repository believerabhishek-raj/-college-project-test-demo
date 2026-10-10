let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ecoTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    const savedLang = localStorage.getItem('ecoLang') || 'en';
    document.getElementById('languageSelect').value = savedLang;
    changeLanguage(savedLang);

    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) showDashboard(activeUser);
});

function toggleTheme() {
    const body = document.body;
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('ecoTheme', newTheme);
}

function changeLanguage(langCode) {
    currentLang = langCode || document.getElementById('languageSelect').value;
    localStorage.setItem('ecoLang', currentLang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    updateGreeting();
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    document.getElementById('authError').innerText = '';
}

function showError(msg) { document.getElementById('authError').innerText = msg; }

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pin = document.getElementById('regPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id]) return showError("Consumer Number already registered!");
    
    users[id] = { name, id, pin };
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    showError("Account created! Please login.");
    switchAuthTab('login');
    document.querySelectorAll('.auth-tabs button')[0].classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pin = document.getElementById('loginPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id] && users[id].pin === pin) {
        localStorage.setItem('ecoActiveUser', JSON.stringify(users[id]));
        showDashboard(users[id]);
    } else {
        showError("Invalid Consumer Number or PIN");
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const pwd = document.getElementById('adminPassword').value;
    const btn = document.getElementById('adminLoginSubmitBtn');
    btn.innerText = "Checking...";
    
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('adminSection').classList.remove('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
            let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
            document.getElementById('adminUserCount').innerText = Object.keys(users).length;
        } else {
            showError("Invalid Admin Password");
        }
    } catch (err) {
        showError("Server Connection Error");
    } finally {
        btn.innerText = translations[currentLang]['adminLoginBtn'] || "Access Admin Panel";
    }
}

function logout() {
    localStorage.removeItem('ecoActiveUser');
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
}

function showDashboard(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    updateGreeting(user.name);
}

function updateGreeting(name = null) {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const userName = name || (activeUser ? activeUser.name : 'User');
    const hour = new Date().getHours();
    let key = 'goodMorning', icon = '☀️';
    if(hour >= 12 && hour < 17) { key = 'goodAfternoon'; icon = '🌤️'; }
    else if(hour >= 17) { key = 'goodEvening'; icon = '🌙'; }
    document.getElementById('userGreeting').innerHTML = `${translations[currentLang][key] || 'Hello'}, ${userName}! ${icon}`;
}

function showFeature(featureId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.feature-content').forEach(fc => fc.classList.add('hidden'));
    document.getElementById(featureId).classList.remove('hidden');
    document.getElementById(featureId).classList.add('active-feature');
}

function toggleAIPopup() {
    document.getElementById('aiChatPopup').classList.toggle('hidden');
}

function generateAudit() {
    const units = parseFloat(document.getElementById('auditUnits').value);
    const rate = parseFloat(document.getElementById('auditRate').value);
    if(!units || !rate) return alert("Please enter both Units and Tariff Rate.");
    
    const bill = units * rate;
    const savings = bill * 0.15;
    const carbon = (units * 0.82).toFixed(1);
    document.getElementById('carbonDisplay').innerText = `${carbon} kg CO₂`;
    document.getElementById('auditResult').classList.remove('hidden');
    document.getElementById('auditBill').innerHTML = `<strong>Estimated Bill:</strong> ₹${bill.toFixed(2)}`;
    document.getElementById('auditSavings').innerHTML = `<strong>Possible Savings:</strong> <span class="green-text">₹${savings.toFixed(2)}</span>`;
    window.lastAudit = { units, rate, bill, savings, carbon };
}

function downloadReport() {
    if(!window.lastAudit) return;
    const { units, rate, bill, savings, carbon } = window.lastAudit;
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\n"
        + `Units Consumed,${units} kWh\nTariff Rate,₹${rate}\n`
        + `Estimated Bill,₹${bill.toFixed(2)}\nPossible Savings,₹${savings.toFixed(2)}\nCarbon Footprint,${carbon} kg CO2\n`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Eco_Sparks_Audit_Report.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function updateSim() {
    const hours = document.getElementById('acHoursVal').innerText = event.target.value;
    document.getElementById('simSavings').innerText = `You save ₹${(1.5 * hours * 7 * 30).toFixed(0)} / month!`;
}

async function sendChatMessage() {
    const inputField = document.getElementById('aiInput');
    const msg = inputField.value.trim();
    if(!msg) return;
    addMessageToChat('user', msg);
    inputField.value = '';
    const loadingId = addMessageToChat('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: msg, language: currentLang })
        });
        const data = await response.json();
        const loadingEl = document.getElementById(loadingId);
        
        if(response.ok && data.response) loadingEl.innerHTML = renderMarkdownToHTML(data.response);
        else loadingEl.innerHTML = `<span class="error-text">⚠️ ${data.error || 'Connection failed.'}</span>`;
    } catch(err) {
        document.getElementById(loadingId).innerHTML = `<span class="error-text">⚠️ Network Error. Check backend.</span>`;
    }
}

function addMessageToChat(sender, text) {
    const chatBox = document.getElementById('chatBox');
    const id = 'msg-' + Date.now();
    chatBox.innerHTML += `<div id="${id}" class="message ${sender}-message fade-in">${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function handleChatEnter(e) { if(e.key === 'Enter') sendChatMessage(); }
function renderMarkdownToHTML(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
}
