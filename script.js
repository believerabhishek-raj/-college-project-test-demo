let currentLang = 'en';

const greetingsDB = {
    morning: [
        "A fresh morning to save energy", "Rise and shine, saver", "Wake up to savings", "Let's make today energy efficient", "Top of the morning",
        "Morning energy boost", "Sun is up, time to save", "Great morning to you", "Keep the watts low today", "Start the day green"
    ],
    afternoon: [
        "Hope your day is going green", "Mid-day energy check", "Keep saving this afternoon", "Turn off those extra lights",
        "Hello there, stay cool", "Afternoon boost", "Great afternoon", "Saving energy today?", "Sun is high, AC on low?"
    ],
    evening: [
        "Wind down and power down", "Time to switch off extra lights", "Great evening to you", "A cozy and green evening",
        "Evening energy check", "Relax and save", "Starry night, lower watts", "A peaceful evening", "Hope you had a green day"
    ]
};

let barChartInstance;
let pieChartInstance;
let userAppliances = [];

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ecoTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    const savedLang = localStorage.getItem('ecoLang') || 'en';
    document.getElementById('languageSelect').value = savedLang;
    changeLanguage(savedLang);

    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) {
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

function changeLanguage(langCode) {
    currentLang = langCode || document.getElementById('languageSelect').value;
    localStorage.setItem('ecoLang', currentLang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) updateGreeting(activeUser.name);
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    document.getElementById('authError').innerText = '';
}
function showError(msg) { document.getElementById('authError').innerText = msg; }

async function trackUserAction(userId, name, action, details) {
    try {
        await fetch('/api/track', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name, action, details })
        });
    } catch(err) {}
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pin = document.getElementById('regPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id]) return showError("Consumer Number already registered!");
    users[id] = { name, id, pin, appliances: [] };
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    trackUserAction(id, name, 'Registered', 'New Signup');
    showError("Account created! Please login.");
    switchAuthTab('login');
}

function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pin = document.getElementById('loginPin').value;
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id] && users[id].pin === pin) {
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
        const res = await fetch('/api/admin/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
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
        tbody.innerHTML += `<tr>
            <td><small>${log.time}</small></td>
            <td><strong>${log.name}</strong><br><small>${log.userId}</small></td>
            <td><span class="badge" style="background:#2980B9;color:white;padding:3px 8px;border-radius:4px;font-size:0.8rem">${log.action}</span></td>
            <td><code>${log.ip}</code></td>
            <td><small>${log.device}</small></td>
        </tr>`;
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
}

function showDashboard(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    updateGreeting(user.name);
    initCharts();
}

function updateGreeting(name) {
    const hour = new Date().getHours();
    let category = 'morning', timeG = 'Good Morning', icon = '☀️';
    if(hour >= 12 && hour < 17) { category = 'afternoon'; timeG = 'Good Afternoon'; icon = '🌤️'; }
    else if(hour >= 17) { category = 'evening'; timeG = 'Good Evening'; icon = '🌙'; }
    
    const pool = greetingsDB[category];
    const randomMotivation = pool[Math.floor(Math.random() * pool.length)];
    let displayTimeG = translations[currentLang][category === 'morning' ? 'goodMorning' : category === 'afternoon' ? 'goodAfternoon' : 'goodEvening'] || timeG;
    
    document.getElementById('userGreeting').innerHTML = `${displayTimeG}, ${name}! <span id="timeIcon">${icon}</span>`;
    document.getElementById('dailyMotivation').innerHTML = randomMotivation;
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

// --- APPLIANCE & CALCULATOR LOGIC ---
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
    const name = document.getElementById('appName').value.trim();
    const power = parseFloat(document.getElementById('appPower').value);
    const hours = parseFloat(document.getElementById('appHours').value);
    if(!name || !power || !hours) return alert("Please fill all appliance fields.");
    
    const monthlyKwh = ((power * hours * 30) / 1000).toFixed(2);
    const monthlyCost = (monthlyKwh * 8).toFixed(2); // Avg 8 rs per unit
    
    userAppliances.push({ id: Date.now(), name, power, hours, monthlyKwh, monthlyCost });
    document.getElementById('appName').value = '';
    document.getElementById('appPower').value = '';
    document.getElementById('appHours').value = '';
    
    saveAppliances();
    renderAppliances();
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    trackUserAction(activeUser.id, activeUser.name, 'Added Appliance', name);
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
    
    if(userAppliances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No appliances added yet. Start adding!</td></tr>';
    } else {
        userAppliances.forEach(app => {
            totalLoad += parseFloat(app.monthlyKwh);
            appNames.push(app.name);
            appLoads.push(app.monthlyKwh);
            tbody.innerHTML += `<tr>
                <td><strong>${app.name}</strong></td>
                <td>${app.power} W</td>
                <td>${app.hours} hrs</td>
                <td>₹${app.monthlyCost}</td>
                <td><button class="sm-btn" onclick="deleteAppliance(${app.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    
    document.getElementById('totalAppLoad').innerText = totalLoad.toFixed(2);
    
    // Vampire Power (Est 10% of load)
    const vampireLoss = (totalLoad * 8 * 0.10).toFixed(0);
    document.getElementById('vampireDisplay').innerText = `₹ ${vampireLoss}`;
    
    let ecoScore = 100 - (totalLoad / 10);
    if(ecoScore > 100) ecoScore = 100; if(ecoScore < 10) ecoScore = 10;
    if(totalLoad === 0) ecoScore = 85;
    document.getElementById('ecoScoreDisplay').innerText = `${Math.floor(ecoScore)}/100`;

    updateChartData(totalLoad, appNames, appLoads);
}

function runCalculator() {
    const w = parseFloat(document.getElementById('calcWatts').value);
    const h = parseFloat(document.getElementById('calcHours').value);
    const r = parseFloat(document.getElementById('calcRate').value);
    if(!w || !h || !r) return;
    
    const d = (w * h) / 1000;
    const m = d * 30;
    const c = m * r;
    
    document.getElementById('resDailyKwh').innerText = `${d.toFixed(2)} kWh`;
    document.getElementById('resMonthlyKwh').innerText = `${m.toFixed(2)} kWh`;
    document.getElementById('resMonthlyCost').innerText = `₹${c.toFixed(2)}`;
}

function runOhmCalculator() {
    const v = document.getElementById('ohmVoltage').value;
    const i = document.getElementById('ohmCurrent').value;
    const r = document.getElementById('ohmResistance').value;
    const resEl = document.getElementById('ohmResult');
    
    if(v && r && !i) { resEl.innerText = `Current (I) = ${(v/r).toFixed(2)} A`; }
    else if(v && i && !r) { resEl.innerText = `Resistance (R) = ${(v/i).toFixed(2)} Ω`; }
    else if(i && r && !v) { resEl.innerText = `Voltage (V) = ${(i*r).toFixed(2)} V`; }
    else { resEl.innerText = "Leave exactly ONE field empty!"; }
}

function updateSim() {
    const hours = document.getElementById('acHoursVal').innerText = event.target.value;
    document.getElementById('simSavings').innerText = `₹ ${(1.5 * hours * 8 * 30).toFixed(0)} / month saved!`;
}

// --- VISUAL GRAPHS (CHART.JS) LOGIC ---
function initCharts() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const ctxBar = document.getElementById('energyChart').getContext('2d');
    barChartInstance = new Chart(ctxBar, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Consumption (kWh)',
                data: [0, 0, 0, 0],
                borderColor: '#27AE60',
                backgroundColor: 'rgba(39, 174, 96, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: {color: gridColor}, ticks: {color: textColor}}, x: {ticks: {color: textColor}}}, plugins: { legend: {labels: {color: textColor}}} }
    });

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['No Data'],
            datasets: [{
                data: [100],
                backgroundColor: ['#e0e0e0']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: {color: textColor} } } }
    });
}

function updateChartColors() {
    if(!barChartInstance || !pieChartInstance) return;
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    
    barChartInstance.options.scales.y.grid.color = gridColor;
    barChartInstance.options.scales.y.ticks.color = textColor;
    barChartInstance.options.scales.x.ticks.color = textColor;
    barChartInstance.options.plugins.legend.labels.color = textColor;
    barChartInstance.update();

    pieChartInstance.options.plugins.legend.labels.color = textColor;
    pieChartInstance.update();
}

function updateChartData(monthlyTotal, appNames, appLoads) {
    if(!barChartInstance || !pieChartInstance) return;
    
    // Line Chart Update
    if(monthlyTotal > 0) {
        barChartInstance.data.datasets[0].data = [
            (monthlyTotal * 0.28).toFixed(1), 
            (monthlyTotal * 0.25).toFixed(1), 
            (monthlyTotal * 0.27).toFixed(1), 
            (monthlyTotal * 0.20).toFixed(1)
        ];
    } else {
        barChartInstance.data.datasets[0].data = [0,0,0,0];
    }
    barChartInstance.update();

    // Pie Chart Update
    if(appNames.length > 0) {
        pieChartInstance.data.labels = appNames;
        pieChartInstance.data.datasets[0].data = appLoads;
        pieChartInstance.data.datasets[0].backgroundColor = ['#27AE60', '#2980B9', '#f39c12', '#E74C3C', '#8e44ad', '#16a085'];
    } else {
        pieChartInstance.data.labels = ['No Data'];
        pieChartInstance.data.datasets[0].data = [100];
        pieChartInstance.data.datasets[0].backgroundColor = ['#e0e0e0'];
    }
    pieChartInstance.update();
}

// --- AI Chat Logic ---
function askAIToOptimize() {
    if(userAppliances.length === 0) return alert("Please add some appliances first!");
    const appData = userAppliances.map(a => `${a.name} (${a.power}W, ${a.hours}hrs)`).join(", ");
    toggleAIPopup();
    document.getElementById('aiInput').value = "Analyze my current appliances and give me 3 specific tips to save energy.";
    window.tempAiContext = `User's current appliances: ${appData}`;
    sendChatMessage();
}

async function sendChatMessage() {
    const inputField = document.getElementById('aiInput');
    const msg = inputField.value.trim();
    if(!msg) return;
    addMessageToChat('user', msg);
    inputField.value = '';
    const loadingId = addMessageToChat('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
    
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const userId = activeUser ? activeUser.id : 'guest_' + Math.random();
    
    const payload = { prompt: msg, language: currentLang, userId: userId };
    if(window.tempAiContext) {
        payload.customContext = window.tempAiContext;
        window.tempAiContext = null; // Clear after use
    }
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const loadingEl = document.getElementById(loadingId);
        
        if(response.ok && data.response) loadingEl.innerHTML = renderMarkdownToHTML(data.response);
        else loadingEl.innerHTML = `<span class="error-text">⚠️ ${data.error || 'Connection failed.'}</span>`;
    } catch(err) {
        document.getElementById(loadingId).innerHTML = `<span class="error-text">⚠️ Network Error.</span>`;
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
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/
/g, '<br>');
}
