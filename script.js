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

// Safe DOM initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = localStorage.getItem('ecoTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('ecoLang') || 'en';
        const langSelect = document.getElementById('languageSelect');
        if(langSelect) langSelect.value = savedLang;
        changeLanguage(savedLang);

        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser) {
            showMainApp(activeUser);
            loadAppliances();
        }
    } catch(err) {
        console.error("Initialization Error:", err);
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
    currentLang = langCode || (document.getElementById('languageSelect') ? document.getElementById('languageSelect').value : 'en');
    localStorage.setItem('ecoLang', currentLang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations && translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(activeUser) updateGreeting(activeUser.name);
}

// 100% Robust Tab Switcher
function switchAuthTab(tab, btnElement) {
    try {
        document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            // Fallback
            const targetBtn = document.querySelector(`.auth-tabs button[onclick*="${tab}"]`);
            if(targetBtn) targetBtn.classList.add('active');
        }
        
        const formEl = document.getElementById(tab + 'Form');
        if(formEl) formEl.classList.add('active');
        
        const errEl = document.getElementById('authError');
        if(errEl) errEl.innerText = '';
    } catch(e) { console.error(e); }
}

function showError(msg) { 
    const el = document.getElementById('authError');
    if(el) el.innerText = msg; 
}

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
    const nameEl = document.getElementById('regName');
    const idEl = document.getElementById('regId');
    const pinEl = document.getElementById('regPin');
    if(!nameEl || !idEl || !pinEl) return;

    const name = nameEl.value.trim();
    const id = idEl.value.trim();
    const pin = pinEl.value;
    
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id]) return showError("Consumer Number already registered!");
    
    users[id] = { name, id, pin, appliances: [] };
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    trackUserAction(id, name, 'Registered', 'New Signup');
    showError("Account created! Please login.");
    
    switchAuthTab('login', null);
}

function handleLogin(e) {
    e.preventDefault();
    const idEl = document.getElementById('loginId');
    const pinEl = document.getElementById('loginPin');
    if(!idEl || !pinEl) return;

    const id = idEl.value.trim();
    const pin = pinEl.value;
    
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id] && users[id].pin === pin) {
        localStorage.setItem('ecoActiveUser', JSON.stringify(users[id]));
        trackUserAction(id, users[id].name, 'Logged In', 'Standard Login');
        showMainApp(users[id]);
        loadAppliances();
    } else {
        showError("Invalid Consumer Number or PIN");
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const pwdEl = document.getElementById('adminPassword');
    const btnEl = document.getElementById('adminLoginSubmitBtn');
    if(!pwdEl || !btnEl) return;

    const pwd = pwdEl.value;
    btnEl.innerText = "Verifying...";
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('mainAppSection').classList.add('hidden');
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
    finally { btnEl.innerText = "Access Admin Panel"; }
}

function populateAdminTable(logs) {
    const tbody = document.getElementById('adminLogsBody');
    if(!tbody) return;
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
    document.getElementById('mainAppSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
}

function showMainApp(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainAppSection').classList.remove('hidden');
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
    
    const greetEl = document.getElementById('userGreeting');
    if(greetEl) greetEl.innerHTML = `${displayTimeG}, ${name}! <span id="timeIcon">${icon}</span>`;
    
    const motEl = document.getElementById('dailyMotivation');
    if(motEl) motEl.innerHTML = randomMotivation;
}

function showFeature(featureId, btnElement) {
    try {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        if(btnElement) {
            btnElement.classList.add('active');
        } else {
            const targetBtn = document.querySelector(`.nav-btn[onclick*="${featureId}"]`);
            if(targetBtn) targetBtn.classList.add('active');
        }
        document.querySelectorAll('.feature-content').forEach(fc => fc.classList.add('hidden'));
        
        const targetSection = document.getElementById(featureId);
        if(targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active-feature');
        }
        
        if(featureId === 'appliances' && pieChartInstance) pieChartInstance.update();
        if(featureId === 'dashboard' && barChartInstance) barChartInstance.update();
    } catch(e) { console.error("Navigation error:", e); }
}

function toggleAIPopup() {
    const popup = document.getElementById('aiChatPopup');
    if(popup) popup.classList.toggle('hidden');
}

function fillAndSend(text) {
    const input = document.getElementById('aiInput');
    const suggs = document.getElementById('chatSuggestions');
    if(!input) return;
    input.value = text;
    if(suggs) suggs.style.display = 'none';
    sendChatMessage();
}

function compareUsage() {
    const prevEl = document.getElementById('prevKwh');
    const latestEl = document.getElementById('latestKwh');
    const resEl = document.getElementById('compareResult');
    if(!prevEl || !latestEl || !resEl) return;
    
    const prev = parseFloat(prevEl.value);
    const latest = parseFloat(latestEl.value);
    
    if(!prev || !latest) return alert("Enter both month values to compare.");
    
    const diff = latest - prev;
    const pct = ((diff / prev) * 100).toFixed(1);
    
    if(diff > 0) {
        resEl.innerHTML = `<span class="danger-text">Your usage increased by ${pct}% (+${diff} kWh). Check appliances!</span>`;
    } else if (diff < 0) {
        resEl.innerHTML = `<span class="green-text">Great job! Usage decreased by ${Math.abs(pct)}% (${Math.abs(diff)} kWh).</span>`;
    } else {
        resEl.innerHTML = "Your usage is exactly the same.";
    }
}

// --- APPLIANCES ---
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
    const nameEl = document.getElementById('appName');
    const powerEl = document.getElementById('appPower');
    const hoursEl = document.getElementById('appHours');
    if(!nameEl || !powerEl || !hoursEl) return;

    const name = nameEl.value.trim();
    const power = parseFloat(powerEl.value);
    const hours = parseFloat(hoursEl.value);
    
    if(!name || !power || !hours) return alert("Please fill all appliance fields.");
    
    const monthlyKwh = ((power * hours * 30) / 1000).toFixed(2);
    const monthlyCost = (monthlyKwh * 8).toFixed(2); 
    
    userAppliances.push({ id: Date.now(), name, power, hours, monthlyKwh, monthlyCost });
    nameEl.value = '';
    powerEl.value = '';
    hoursEl.value = '';
    
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
    if(!tbody) return;
    
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
                <td><button type="button" class="sm-btn" onclick="deleteAppliance(${app.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    
    const totalAppLoadEl = document.getElementById('totalAppLoad');
    if(totalAppLoadEl) totalAppLoadEl.innerText = totalLoad.toFixed(2);
    
    const dashLoadDisplayEl = document.getElementById('dashLoadDisplay');
    if(dashLoadDisplayEl) dashLoadDisplayEl.innerText = `${totalLoad.toFixed(1)} kWh`;
    
    const estBill = (totalLoad * 8).toFixed(0);
    const dashBillDisplayEl = document.getElementById('dashBillDisplay');
    if(dashBillDisplayEl) dashBillDisplayEl.innerText = `₹ ${estBill}`;

    const vampireLoss = (estBill * 0.10).toFixed(0);
    const vampDisp = document.getElementById('vampireDisplay');
    if(vampDisp) vampDisp.innerText = `₹ ${vampireLoss}`;
    
    let ecoScore = 100 - (totalLoad / 10);
    if(ecoScore > 100) ecoScore = 100; if(ecoScore < 10) ecoScore = 10;
    if(totalLoad === 0) ecoScore = 85;
    const ecoScoreEl = document.getElementById('ecoScoreDisplay');
    if(ecoScoreEl) ecoScoreEl.innerText = `${Math.floor(ecoScore)}/100`;

    if(pieChartInstance) {
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
    if(!resEl) return;
    
    if(v && r && !i) { resEl.innerText = `Current (I) = ${(v/r).toFixed(2)} A`; }
    else if(v && i && !r) { resEl.innerText = `Resistance (R) = ${(v/i).toFixed(2)} Ω`; }
    else if(i && r && !v) { resEl.innerText = `Voltage (V) = ${(i*r).toFixed(2)} V`; }
    else { resEl.innerText = "Leave exactly ONE field empty!"; }
}

function updateSim() {
    const slider = document.getElementById('acSlider');
    const valEl = document.getElementById('acHoursVal');
    const savEl = document.getElementById('simSavings');
    if(!slider || !valEl || !savEl) return;
    
    const val = slider.value;
    valEl.innerText = val;
    savEl.innerText = `₹ ${(1.5 * val * 8 * 30).toFixed(0)} / month saved!`;
}

// --- 2D Flat GRAPHS LOGIC ---
function initCharts() {
    try {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#333333';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        const chartEl = document.getElementById('energyChart');
        if(chartEl && typeof Chart !== 'undefined') {
            const ctxBar = chartEl.getContext('2d');
            if(barChartInstance) barChartInstance.destroy();
            barChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Consumption (kWh)',
                        data: [45, 42, 48, 35],
                        backgroundColor: '#27AE60',
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true, grid: {color: gridColor}, ticks: {color: textColor}}, 
                        x: { grid: {display: false}, ticks: {color: textColor}}
                    }, 
                    plugins: { legend: {labels: {color: textColor}}} 
                }
            });
        }

        const pieEl = document.getElementById('pieChart');
        if(pieEl && typeof Chart !== 'undefined') {
            const ctxPie = pieEl.getContext('2d');
            if(pieChartInstance) pieChartInstance.destroy();
            pieChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{ data: [100], backgroundColor: ['#e0e0e0'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: {color: textColor} } } }
            });
        }
    } catch (e) { console.error("Chart Init Error:", e); }
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

function updateManualChart() {
    const w1 = document.getElementById('graphW1') ? document.getElementById('graphW1').value : 0;
    const w2 = document.getElementById('graphW2') ? document.getElementById('graphW2').value : 0;
    const w3 = document.getElementById('graphW3') ? document.getElementById('graphW3').value : 0;
    const w4 = document.getElementById('graphW4') ? document.getElementById('graphW4').value : 0;

    if(barChartInstance) {
        barChartInstance.data.datasets[0].data = [w1 || 0, w2 || 0, w3 || 0, w4 || 0];
        barChartInstance.update();
    }
}

// --- AI Chat Logic ---
function askAIToOptimize() {
    if(userAppliances.length === 0) return alert("Please add some appliances first!");
    const appData = userAppliances.map(a => `${a.name} (${a.power}W, ${a.hours}hrs)`).join(", ");
    toggleAIPopup();
    const inputEl = document.getElementById('aiInput');
    if(inputEl) inputEl.value = "Analyze my current appliances and give me 3 specific tips to save energy.";
    window.tempAiContext = `User's current appliances: ${appData}`;
    sendChatMessage();
}

async function sendChatMessage() {
    const inputField = document.getElementById('aiInput');
    if(!inputField) return;
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
        window.tempAiContext = null; 
    }
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const loadingEl = document.getElementById(loadingId);
        
        if(response.ok && data.response && loadingEl) {
            loadingEl.innerHTML = renderMarkdownToHTML(data.response);
        } else if (loadingEl) {
            loadingEl.innerHTML = `<span class="error-text">⚠️ ${data.error || 'Connection failed.'}</span>`;
        }
    } catch(err) {
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.innerHTML = `<span class="error-text">⚠️ Network Error.</span>`;
    }
}

function addMessageToChat(sender, text) {
    const chatBox = document.getElementById('chatBox');
    if(!chatBox) return;
    const id = 'msg-' + Date.now();
    chatBox.innerHTML += `<div id="${id}" class="message ${sender}-message fade-in">${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function handleChatEnter(e) { if(e.key === 'Enter') sendChatMessage(); }
function renderMarkdownToHTML(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
}

// --- Audit logic ---
function generateAudit() {
    const unitsEl = document.getElementById('auditUnits');
    const rateEl = document.getElementById('auditRate');
    if(!unitsEl || !rateEl) return;
    
    const units = parseFloat(unitsEl.value);
    const rate = parseFloat(rateEl.value);
    if(!units || !rate) return alert("Please enter both Units and Tariff Rate.");
    
    const bill = units * rate;
    const savings = bill * 0.18; 
    const resEl = document.getElementById('auditResult');
    if(resEl) resEl.classList.remove('hidden');
    
    const billEl = document.getElementById('auditBill');
    if(billEl) billEl.innerHTML = `<strong>Estimated Bill:</strong> ₹${bill.toFixed(2)}`;
    
    const savEl = document.getElementById('auditSavings');
    if(savEl) savEl.innerHTML = `<strong>Possible Savings:</strong> <span class="green-text">₹${savings.toFixed(2)}</span>`;
}

function downloadReport() { 
    alert("Report generation feature is linked to your Appliance Table data."); 
}
