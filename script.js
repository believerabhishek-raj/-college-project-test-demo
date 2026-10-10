let currentLang = 'en';
let barChartInstance;
let pieChartInstance;
let userAppliances = [];

// Gamification Badges
const getEcoBadge = (score) => {
    if(score >= 90) return { icon: '🌳', text: 'Eco Forest (Expert)' };
    if(score >= 70) return { icon: '🪴', text: 'Eco Plant (Saver)' };
    if(score >= 50) return { icon: '🌱', text: 'Eco Sprout (Beginner)' };
    return { icon: '🌰', text: 'Eco Seed (Learning)' };
};

const greetingsDB = [
    "A fresh morning to save energy", "Rise and shine, saver", "Let's make today energy efficient", 
    "Hope your day is going green", "Saving energy today?", "A cozy and green evening"
];

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ecoTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    checkPeakHours();

    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) {
        // Migration safeguard for new tariff field
        if(!activeUser.tariffRate) activeUser.tariffRate = 8;
        localStorage.setItem('ecoActiveUser', JSON.stringify(activeUser));
        
        showDashboard(activeUser);
        loadAppliances();
    }
});

function toggleTheme() {
    const body = document.body;
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('ecoTheme', newTheme);
    updateChartColors();
}

function checkPeakHours() {
    const hour = new Date().getHours();
    // Assuming peak hours are 6 PM to 10 PM (18 to 22)
    if(hour >= 18 && hour <= 22) {
        document.getElementById('peakAlert').classList.remove('hidden');
    }
}

function switchAuthTab(tab, btnElement) {
    document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    document.getElementById('authError').innerText = '';
}
function showError(msg) { document.getElementById('authError').innerText = msg; }

async function trackUserAction(userId, name, action, details) {
    try {
        await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name, action, details }) });
    } catch(err) {}
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pin = document.getElementById('regPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id]) return showError("Consumer Number already registered!");
    
    users[id] = { name, id, pin, appliances: [], tariffRate: 8 };
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    trackUserAction(id, name, 'Registered', 'New Signup');
    showError("Account created! Please login.");
}

function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pin = document.getElementById('loginPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    
    if(users[id] && users[id].pin === pin) {
        if(!users[id].tariffRate) users[id].tariffRate = 8;
        localStorage.setItem('ecoActiveUser', JSON.stringify(users[id]));
        trackUserAction(id, users[id].name, 'Logged In', 'Standard Login');
        showDashboard(users[id]);
        loadAppliances();
    } else {
        showError("Invalid Consumer Number or PIN");
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const pwd = document.getElementById('adminPassword').value;
    const btn = document.getElementById('adminLoginSubmitBtn');
    btn.innerText = "Verifying...";
    try {
        const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('adminSection').classList.remove('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
            let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
            document.getElementById('adminUserCount').innerText = Object.keys(users).length;
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            populateAdminTable(statsData.analytics);
        } else {
            showError("Invalid Admin Password");
        }
    } catch (err) { showError("Server Error"); } 
    finally { btn.innerText = "Access Admin Panel"; }
}

function populateAdminTable(logs) {
    const tbody = document.getElementById('adminLogsBody');
    tbody.innerHTML = '';
    if(!logs || logs.length === 0) return tbody.innerHTML = '<tr><td colspan="5">No live activity recorded yet.</td></tr>';
    logs.forEach(log => {
        tbody.innerHTML += `<tr><td><small>${log.time}</small></td><td><strong>${log.name}</strong><br><small>${log.userId}</small></td><td><span class="badge" style="background:#2980B9;color:white;padding:3px 8px;border-radius:4px;font-size:0.8rem">${log.action}</span></td><td><code>${log.ip}</code></td><td><small>${log.device}</small></td></tr>`;
    });
}

function logout() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) trackUserAction(activeUser.id, activeUser.name, 'Logged Out', 'User Exit');
    localStorage.removeItem('ecoActiveUser');
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('profileNavBtn').classList.add('hidden');
}

function showDashboard(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('profileNavBtn').classList.remove('hidden');
    
    document.getElementById('profName').value = user.name;
    document.getElementById('profId').value = user.id;
    document.getElementById('profPin').value = user.pin;
    document.getElementById('profTariff').value = user.tariffRate || 8;
    document.getElementById('sumTariff').innerText = `₹${user.tariffRate || 8}`;

    updateGreeting(user.name);
    initCharts();
}

function saveProfile() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(!activeUser) return;
    
    activeUser.name = document.getElementById('profName').value.trim();
    activeUser.pin = document.getElementById('profPin').value;
    activeUser.tariffRate = parseFloat(document.getElementById('profTariff').value) || 8;
    
    localStorage.setItem('ecoActiveUser', JSON.stringify(activeUser));
    let users = JSON.parse(localStorage.getItem('ecoUsers'));
    users[activeUser.id] = activeUser;
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    
    document.getElementById('profileMsg').innerHTML = "<span class='green-text'>Profile Saved Successfully!</span>";
    document.getElementById('sumTariff').innerText = `₹${activeUser.tariffRate}`;
    updateGreeting(activeUser.name);
    loadAppliances(); // Recalculate costs based on new tariff
    updateSim(); // Recalculate simulator
    
    setTimeout(() => { document.getElementById('profileMsg').innerHTML = ""; }, 3000);
}

function updateGreeting(name) {
    const randomMotivation = greetingsDB[Math.floor(Math.random() * greetingsDB.length)];
    document.getElementById('userGreeting').innerHTML = `Hi, ${name}! <span id="timeIcon">👋</span>`;
    document.getElementById('dailyMotivation').innerHTML = randomMotivation;
}

function showFeature(featureId, btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement && btnElement.classList.contains('nav-btn')) btnElement.classList.add('active');
    
    document.querySelectorAll('.feature-content').forEach(fc => fc.classList.add('hidden'));
    document.getElementById(featureId).classList.remove('hidden');
    document.getElementById(featureId).classList.add('active-feature');
}

function switchAdminTab(tabId, btnElement) {
    document.querySelectorAll('#adminSection .nav-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    document.querySelectorAll('.admin-tab-content').forEach(fc => fc.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
}

// --- APPLIANCE & SIMULATOR LOGIC ---
function loadAppliances() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser && activeUser.appliances) {
        userAppliances = activeUser.appliances;
        renderAppliances();
    }
}

function saveAppliances() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) {
        activeUser.appliances = userAppliances;
        localStorage.setItem('ecoActiveUser', JSON.stringify(activeUser));
        let users = JSON.parse(localStorage.getItem('ecoUsers'));
        users[activeUser.id] = activeUser;
        localStorage.setItem('ecoUsers', JSON.stringify(users));
    }
}

function addAppliance() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const tRate = activeUser ? activeUser.tariffRate : 8;

    const name = document.getElementById('appName').value.trim();
    const power = parseFloat(document.getElementById('appPower').value);
    const hours = parseFloat(document.getElementById('appHours').value);
    if(!name || !power || !hours) return alert("Please fill all appliance fields.");
    
    const monthlyKwh = ((power * hours * 30) / 1000).toFixed(2);
    const monthlyCost = (monthlyKwh * tRate).toFixed(2);
    
    userAppliances.push({ id: Date.now(), name, power, hours, monthlyKwh, monthlyCost });
    document.getElementById('appName').value = ''; document.getElementById('appPower').value = ''; document.getElementById('appHours').value = '';
    
    saveAppliances();
    renderAppliances();
}

function deleteAppliance(id) {
    userAppliances = userAppliances.filter(app => app.id !== id);
    saveAppliances();
    renderAppliances();
}

function renderAppliances() {
    const tbody = document.getElementById('applianceList');
    tbody.innerHTML = '';
    let totalLoad = 0;
    let appNames = [];
    let appLoads = [];
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const tRate = activeUser ? activeUser.tariffRate : 8;
    
    if(userAppliances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No appliances added yet. Start adding!</td></tr>';
    } else {
        userAppliances.forEach(app => {
            app.monthlyCost = (parseFloat(app.monthlyKwh) * tRate).toFixed(2); // Dynamic Cost update
            totalLoad += parseFloat(app.monthlyKwh);
            appNames.push(app.name);
            appLoads.push(app.monthlyKwh);
            tbody.innerHTML += `<tr>
                <td><strong>${app.name}</strong></td><td>${app.power} W</td><td>${app.hours} hrs</td>
                <td>₹${app.monthlyCost}</td><td><button class="sm-btn" onclick="deleteAppliance(${app.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    
    document.getElementById('totalAppLoad').innerText = totalLoad.toFixed(2);
    document.getElementById('trackedLoadDisplay').innerText = `${totalLoad.toFixed(1)} kWh`;
    document.getElementById('sumApp').innerText = userAppliances.length;
    
    const vampireLoss = (totalLoad * tRate * 0.10).toFixed(0);
    document.getElementById('vampireDisplay').innerText = `₹ ${vampireLoss}`;
    
    let ecoScore = 100 - (totalLoad / 10);
    if(ecoScore > 100) ecoScore = 100; if(ecoScore < 10) ecoScore = 10;
    if(totalLoad === 0) ecoScore = 85;
    
    document.getElementById('ecoScoreDisplay').innerText = Math.floor(ecoScore);
    const badgeObj = getEcoBadge(ecoScore);
    document.getElementById('ecoBadgeArea').innerHTML = `<span class="eco-badge">${badgeObj.icon} ${badgeObj.text}</span>`;

    // Sync simulator base load
    document.getElementById('simBaseLoad').value = Math.max(250, Math.floor(totalLoad));
    updateSim();

    updateChartData(totalLoad, appNames, appLoads);
}

function updateSim() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const tRate = activeUser ? activeUser.tariffRate : 8;
    document.getElementById('simCurrentTariff').innerText = tRate;

    const baseLoad = parseFloat(document.getElementById('simBaseLoad').value) || 0;
    const pct = document.getElementById('simSlider').value;
    document.getElementById('simPctVal').innerText = pct;
    
    const savedKwh = baseLoad * (pct / 100);
    const savedMoney = (savedKwh * tRate).toFixed(0);
    document.getElementById('simSavings').innerText = `₹ ${savedMoney}`;
}

// --- GRAPHS (CHART.JS) LOGIC ---
function initCharts() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const ctxBar = document.getElementById('energyChart').getContext('2d');
    if(barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(ctxBar, {
        type: 'line',
        data: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], datasets: [{ label: 'kWh', data: [0, 0, 0, 0], borderColor: '#27AE60', backgroundColor: 'rgba(39, 174, 96, 0.2)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: {color: gridColor}, ticks: {color: textColor}}, x: {ticks: {color: textColor}}}, plugins: { legend: {labels: {color: textColor}}} }
    });

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    if(pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: { labels: ['No Data'], datasets: [{ data: [100], backgroundColor: ['#e0e0e0'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: {color: textColor} } } }
    });
}

function updateChartColors() {
    if(!barChartInstance || !pieChartInstance) return;
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    barChartInstance.options.scales.y.grid.color = gridColor; barChartInstance.options.scales.y.ticks.color = textColor; barChartInstance.options.scales.x.ticks.color = textColor; barChartInstance.options.plugins.legend.labels.color = textColor; barChartInstance.update();
    pieChartInstance.options.plugins.legend.labels.color = textColor; pieChartInstance.update();
}

function updateChartData(monthlyTotal, appNames, appLoads) {
    if(!barChartInstance || !pieChartInstance) return;
    if(monthlyTotal > 0) {
        barChartInstance.data.datasets[0].data = [(monthlyTotal * 0.28).toFixed(1), (monthlyTotal * 0.25).toFixed(1), (monthlyTotal * 0.27).toFixed(1), (monthlyTotal * 0.20).toFixed(1)];
    } else {
        barChartInstance.data.datasets[0].data = [0,0,0,0];
    }
    barChartInstance.update();

    if(appNames.length > 0) {
        pieChartInstance.data.labels = appNames; pieChartInstance.data.datasets[0].data = appLoads; pieChartInstance.data.datasets[0].backgroundColor = ['#27AE60', '#2980B9', '#f39c12', '#E74C3C', '#8e44ad', '#16a085'];
    } else {
        pieChartInstance.data.labels = ['No Data']; pieChartInstance.data.datasets[0].data = [100]; pieChartInstance.data.datasets[0].backgroundColor = ['#e0e0e0'];
    }
    pieChartInstance.update();
}

// --- UNIFIED AI CHAT LOGIC ---
function toggleAIPopup() {
    document.getElementById('aiChatPopup').classList.toggle('hidden');
}

async function callCoreAI(promptText, customCtx = null) {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const userId = activeUser ? activeUser.id : 'guest_' + Math.random();
    
    const payload = { prompt: promptText, language: currentLang, userId: userId };
    if(customCtx) payload.customContext = customCtx;

    try {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        return (res.ok && data.response) ? renderMarkdownToHTML(data.response) : `⚠️ ${data.error || 'Connection failed.'}`;
    } catch(err) {
        return `⚠️ Network Error. Server might be sleeping.`;
    }
}

// 1. Popup AI
async function sendPopupAI() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if(!msg) return;
    addMessageToUI('chatBox', 'user', msg);
    input.value = '';
    const loadingId = addMessageToUI('chatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
    
    const responseHtml = await callCoreAI(msg);
    document.getElementById(loadingId).innerHTML = responseHtml;
}

// 2. Full Tab AI
async function sendTabAI() {
    const input = document.getElementById('tabAiInput');
    const msg = input.value.trim();
    if(!msg) return;
    addMessageToUI('tabChatBox', 'user', msg);
    input.value = '';
    const loadingId = addMessageToUI('tabChatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...');
    
    const responseHtml = await callCoreAI(msg);
    document.getElementById(loadingId).innerHTML = responseHtml;
}

// 3. Mini Dashboard AI
async function runMiniAI() {
    const input = document.getElementById('miniAiInput');
    const resultBox = document.getElementById('miniAiResult');
    const msg = input.value.trim();
    if(!msg) return;
    
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Getting quick insight...';
    input.value = '';

    const responseHtml = await callCoreAI(msg);
    resultBox.innerHTML = `<strong>You asked:</strong> ${msg}<br><br>${responseHtml}`;
}

function addMessageToUI(containerId, sender, text) {
    const box = document.getElementById(containerId);
    const id = 'msg-' + Date.now() + Math.floor(Math.random()*1000);
    box.innerHTML += `<div id="${id}" class="message ${sender}-message fade-in">${text}</div>`;
    box.scrollTop = box.scrollHeight;
    return id;
}

function renderMarkdownToHTML(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
}
