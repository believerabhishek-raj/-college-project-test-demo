let currentLang = 'en';

const greetingsDB = {
    morning: ["A fresh morning to save energy", "Rise and shine, saver", "Wake up to savings", "Let's make today energy efficient"],
    afternoon: ["Hope your day is going green", "Mid-day energy check", "Keep saving this afternoon", "Turn off those extra lights"],
    evening: ["Wind down and power down", "Time to switch off extra lights", "Great evening to you", "A cozy and green evening"]
};

let barChartInstance;
let pieChartInstance;
let userAppliances = [];
let chartType = 'line'; 

// Safe DOM initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = localStorage.getItem('ecoTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('ecoLang') || 'en';
        const langSelect = document.getElementById('languageSelect');
        const langSelectMob = document.getElementById('languageSelectMobile');
        if(langSelect) langSelect.value = savedLang;
        if(langSelectMob) langSelectMob.value = savedLang;

        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser) {
            showMainApp(activeUser);
            loadAppliances();
        }
        calculateSimulator(); 
    } catch(err) {
        console.error("Init Error:", err);
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
    currentLang = langCode || 'en';
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

function switchAuthTab(tab, btnElement) {
    try {
        document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        if(btnElement) btnElement.classList.add('active');
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
    showError("Account created! Please login.");
    
    switchAuthTab('login', document.querySelector('.auth-tabs button'));
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
        showMainApp(users[id]);
        loadAppliances();
    } else {
        showError("Invalid Consumer Number or PIN");
    }
}

// ------------------------------------
// FULL ADMIN CONTROL LOGIC
// ------------------------------------
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
            
            const sb = document.querySelector('.sidebar');
            if(sb) sb.classList.add('hidden');
            const mn = document.getElementById('mobileNav');
            if(mn) mn.classList.add('hidden');

            loadAdminData(); // New full control function
            
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            populateAdminTable(statsData.analytics);

        } else {
            showError("Invalid Admin Password");
        }
    } catch (err) { showError("Server Error"); } 
    finally { btnEl.innerText = "Access Admin Panel"; }
}

function loadAdminData() {
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    let totalUsers = Object.keys(users).length;
    document.getElementById('adminUserCount').innerText = totalUsers;
    
    const tbody = document.getElementById('adminUserListBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    if(totalUsers === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users registered yet.</td></tr>';
        return;
    }

    // Populate user stats for Admin
    Object.keys(users).forEach(id => {
        const u = users[id];
        let tLoad = 0;
        let tCost = 0;
        let numApps = u.appliances ? u.appliances.length : 0;
        
        if(u.appliances) {
            u.appliances.forEach(a => {
                tLoad += parseFloat(a.monthlyKwh || 0);
                tCost += parseFloat(a.monthlyCost || 0);
            });
        }
        
        tbody.innerHTML += `<tr>
            <td><strong>${u.id}</strong></td>
            <td>${u.name}</td>
            <td>${numApps} devices</td>
            <td>${tLoad.toFixed(2)} kWh</td>
            <td class="text-orange">₹${tCost.toFixed(2)}</td>
            <td>
                <button type="button" class="sm-btn" onclick="adminDeleteUser('${u.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>`;
    });
}

function adminDeleteUser(userId) {
    if(confirm("Are you sure you want to delete this user? This cannot be undone.")) {
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        delete users[userId];
        localStorage.setItem('ecoUsers', JSON.stringify(users));
        loadAdminData(); // Refresh table
    }
}

function adminAddNewUser() {
    const name = document.getElementById('adminNewName').value.trim();
    const id = document.getElementById('adminNewId').value.trim();
    const pin = document.getElementById('adminNewPin').value.trim();
    
    if(!name || !id || pin.length !== 4) return alert("Fill all fields properly (PIN must be 4 digits).");
    
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[id]) return alert("Consumer ID already exists!");
    
    users[id] = { name, id, pin, appliances: [] };
    localStorage.setItem('ecoUsers', JSON.stringify(users));
    
    document.getElementById('adminNewName').value = '';
    document.getElementById('adminNewId').value = '';
    document.getElementById('adminNewPin').value = '';
    
    alert("User successfully added by Admin.");
    loadAdminData(); // Refresh table
}

function saveAdminProfile() {
    alert("Admin Profile updated successfully!");
}

function populateAdminTable(logs) {
    const tbody = document.getElementById('adminLogsBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(!logs || logs.length === 0) return tbody.innerHTML = '<tr><td colspan="5">No live network activity recorded yet.</td></tr>';
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

// ------------------------------------
// USER PROFILE & MAIN APP
// ------------------------------------
function loadProfileFields(user) {
    const nameEl = document.getElementById('profileName');
    const idEl = document.getElementById('profileId');
    if(nameEl) nameEl.value = user.name || '';
    if(idEl) idEl.value = user.id || '';
    
    const avatarEl = document.getElementById('userAvatarInitials');
    if(avatarEl && user.name) {
        avatarEl.innerText = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    }
}

function saveUserProfile() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(!activeUser) return;
    
    const name = document.getElementById('profileName').value.trim();
    const pin = document.getElementById('profilePin').value.trim();
    
    if(!name || pin.length !== 4) return alert("Please provide valid Name and 4-digit PIN.");
    
    activeUser.name = name;
    activeUser.pin = pin;
    localStorage.setItem('ecoActiveUser', JSON.stringify(activeUser));
    
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[activeUser.id]) {
        users[activeUser.id].name = name;
        users[activeUser.id].pin = pin;
        localStorage.setItem('ecoUsers', JSON.stringify(users));
    }
    
    alert("Profile updated successfully!");
    updateGreeting(name);
    loadProfileFields(activeUser);
}

function logout() {
    localStorage.removeItem('ecoActiveUser');
    location.reload();
}

function showMainApp(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainAppSection').classList.remove('hidden');
    
    if(window.innerWidth <= 768) {
        document.querySelector('.features-nav').style.display = 'flex';
    } else {
        document.getElementById('logoutBox').classList.remove('hidden');
    }

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
    
    const greetEl = document.getElementById('userGreeting');
    if(greetEl) greetEl.innerHTML = `${timeG}, ${name}! <span id="timeIcon">${icon}</span>`;
    
    const motEl = document.getElementById('dailyMotivation');
    if(motEl) motEl.innerHTML = randomMotivation;
}

function showFeature(featureId, btnElement) {
    try {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        if(btnElement) btnElement.classList.add('active');
        
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

// ------------------------------------
// OFFLINE CALCULATORS
// ------------------------------------
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

function calculateSimulator() {
    const unitsEl = document.getElementById('simUserUnits');
    const rateEl = document.getElementById('simUserRate');
    const sliderEl = document.getElementById('simSlider');
    const pctValEl = document.getElementById('simPctVal');
    const savingsEl = document.getElementById('simSavingsResult');
    const unitsResultEl = document.getElementById('simUnitsResult');
    if(!unitsEl || !sliderEl || !savingsEl || !rateEl) return;

    const units = parseFloat(unitsEl.value) || 300;
    const rate = parseFloat(rateEl.value) || 8;
    const pct = parseFloat(sliderEl.value) || 15;
    
    pctValEl.innerText = pct;

    const savedUnits = (units * (pct / 100));
    const savedMoney = (savedUnits * rate).toFixed(0); 
    
    unitsResultEl.innerText = `${savedUnits.toFixed(1)} kWh`;
    savingsEl.innerText = `₹ ${savedMoney}`;
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
    nameEl.value = ''; powerEl.value = ''; hoursEl.value = '';
    
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
    if(!tbody) return;
    
    tbody.innerHTML = '';
    let totalLoad = 0;
    let appNames = [];
    let appLoads = [];
    
    if(userAppliances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No appliances added yet.</td></tr>';
    } else {
        userAppliances.forEach(app => {
            totalLoad += parseFloat(app.monthlyKwh);
            appNames.push(app.name);
            appLoads.push(app.monthlyKwh);
            tbody.innerHTML += `<tr>
                <td><strong>${app.name}</strong></td>
                <td>${app.power}W</td>
                <td>₹${app.monthlyCost}</td>
                <td><button type="button" class="sm-btn" onclick="deleteAppliance(${app.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    
    const dashLoadDisplayEl = document.getElementById('dashLoadDisplay');
    if(dashLoadDisplayEl) dashLoadDisplayEl.innerText = `${totalLoad.toFixed(1)}`;
    
    const estBill = (totalLoad * 8).toFixed(0);
    const dashBillDisplayEl = document.getElementById('dashBillDisplay');
    if(dashBillDisplayEl) dashBillDisplayEl.innerText = `₹${estBill}`;

    const vampireLoss = (estBill * 0.10).toFixed(0);
    const vampDisp = document.getElementById('vampireDisplay');
    if(vampDisp) vampDisp.innerText = `₹${vampireLoss}`;
    
    let ecoScore = 100 - (totalLoad / 10);
    if(ecoScore > 100) ecoScore = 100; if(ecoScore < 10) ecoScore = 10;
    if(totalLoad === 0) ecoScore = 85;
    const ecoScoreEl = document.getElementById('ecoScoreDisplay');
    if(ecoScoreEl) ecoScoreEl.innerText = `${Math.floor(ecoScore)}%`;

    if(pieChartInstance) {
        if(appNames.length > 0) {
            pieChartInstance.data.labels = appNames;
            pieChartInstance.data.datasets[0].data = appLoads;
            pieChartInstance.data.datasets[0].backgroundColor = ['#E67E22', '#27AE60', '#2980B9', '#E74C3C', '#8e44ad', '#16a085'];
        } else {
            pieChartInstance.data.labels = ['No Data'];
            pieChartInstance.data.datasets[0].data = [100];
            pieChartInstance.data.datasets[0].backgroundColor = ['#f5f5f5'];
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

// --- Visual Energy Flowchart/Trend ---
function switchGraphType(type, btnEl) {
    document.querySelectorAll('.graph-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    chartType = type;
    initCharts();
    updateManualChart();
}

function initCharts() {
    try {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#888888';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        const chartEl = document.getElementById('energyChart');
        if(chartEl && typeof Chart !== 'undefined') {
            const ctxBar = chartEl.getContext('2d');
            if(barChartInstance) barChartInstance.destroy();
            
            barChartInstance = new Chart(ctxBar, {
                type: chartType, 
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Energy Usage (kWh)',
                        data: [40, 55, 30, 60, 45, 70, 50, 40, 65, 35, 50, 45],
                        borderColor: '#E67E22', 
                        backgroundColor: chartType === 'line' ? 'rgba(230, 126, 34, 0.15)' : '#E67E22',
                        borderWidth: 2,
                        borderRadius: chartType === 'bar' ? 4 : 0,
                        fill: chartType === 'line',
                        tension: 0.4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#E67E22',
                        pointRadius: 4
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true, grid: {color: gridColor}, ticks: {color: textColor}}, 
                        x: { grid: {display: false}, ticks: {color: textColor}}
                    }, 
                    plugins: { legend: {display: false} } 
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
                    datasets: [{ data: [100], backgroundColor: ['#f5f5f5'], borderWidth: 0 }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                    plugins: { legend: { position: 'right', labels: {color: textColor, font: {family: 'Poppins', size: 11}, boxWidth: 12} } } 
                }
            });
        }
    } catch (e) { console.error("Chart Init Error:", e); }
}

function updateChartColors() {
    if(!barChartInstance || !pieChartInstance) return;
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E0E0E0' : '#888888';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    
    barChartInstance.options.scales.y.grid.color = gridColor;
    barChartInstance.options.scales.y.ticks.color = textColor;
    barChartInstance.options.scales.x.ticks.color = textColor;
    barChartInstance.update();

    pieChartInstance.options.plugins.legend.labels.color = textColor;
    pieChartInstance.update();
}

function updateManualChart() {
    const w1 = document.getElementById('graphW1') ? parseFloat(document.getElementById('graphW1').value) : 0;
    const w2 = document.getElementById('graphW2') ? parseFloat(document.getElementById('graphW2').value) : 0;
    const w3 = document.getElementById('graphW3') ? parseFloat(document.getElementById('graphW3').value) : 0;
    const w4 = document.getElementById('graphW4') ? parseFloat(document.getElementById('graphW4').value) : 0;

    if(barChartInstance) {
        barChartInstance.data.datasets[0].data = [w1, w2, w3, w4, 45, 70, 50, 40, 65, 35, 50, 45];
        barChartInstance.update();
    }
}

// --- Text to Speech ---
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi-IN') || v.name.includes('Hindi'));
        if(hindiVoice) msg.voice = hindiVoice;
        
        msg.rate = 1.0;
        msg.pitch = 1.0;
        window.speechSynthesis.speak(msg);
    } else {
        alert("Text-to-speech is not supported in this browser.");
    }
}

function stopSpeak() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// --- AI Chat Logic ---
async function sendChatMessage() {
    const inputField = document.getElementById('aiInput');
    if(!inputField) return;
    const msg = inputField.value.trim();
    if(!msg) return;
    
    addMessageToChat('chatBox', 'user', msg);
    inputField.value = '';
    const loadingId = addMessageToChat('chatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
    
    await processAIRequest(msg, loadingId, 'chatBox');
}

async function processAIRequest(msg, loadingId, boxId) {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    const userId = activeUser ? activeUser.id : 'guest_' + Math.random();
    
    const payload = { prompt: msg, language: currentLang, userId: userId };
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const loadingEl = document.getElementById(loadingId);
        
        if(response.ok && data.response && loadingEl) {
            const rawText = data.response;
            const htmlText = renderMarkdownToHTML(rawText);
            
            const ttsHtml = `<div class="tts-controls mt-1">
                <button type="button" class="tts-btn" onclick="speakText(\`${rawText.replace(/"/g, "'").replace(/
/g, ' ')}\`)"><i class="fa-solid fa-volume-high"></i> Listen</button>
                <button type="button" class="tts-btn" onclick="stopSpeak()"><i class="fa-solid fa-stop"></i></button>
            </div>`;
            
            loadingEl.innerHTML = htmlText + ttsHtml;
            
        } else if (loadingEl) {
            loadingEl.innerHTML = `<span class="error-text">⚠️ ${data.error || 'Connection failed.'}</span>`;
        }
    } catch(err) {
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.innerHTML = `<span class="error-text">⚠️ Network Error. Fallback rule applied.</span>`;
    }
}

function addMessageToChat(boxId, sender, text) {
    const chatBox = document.getElementById(boxId);
    if(!chatBox) return;
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

// --- Live Energy Audit ---
function generateAudit() {
    const unitsEl = document.getElementById('auditUnits');
    const rateEl = document.getElementById('auditRate');
    if(!unitsEl || !rateEl) return;
    
    const units = parseFloat(unitsEl.value);
    const rate = parseFloat(rateEl.value);
    if(!units || !rate) return alert("Please enter both Units and Tariff Rate.");
    
    const bill = units * rate;
    const savings = bill * 0.18; 
    const carbon = (units * 0.70).toFixed(1); 

    const resEl = document.getElementById('auditResult');
    if(resEl) resEl.classList.remove('hidden');
    
    const billEl = document.getElementById('auditBill');
    if(billEl) billEl.innerHTML = `Estimated Bill: ₹${bill.toFixed(2)}`;
    
    const savEl = document.getElementById('auditSavings');
    if(savEl) savEl.innerHTML = `Possible Savings: ₹${savings.toFixed(2)}`;
    
    const carEl = document.getElementById('auditCarbon');
    if(carEl) carEl.innerText = `${carbon} kg CO2`;
    
    window.lastAudit = { units, rate, bill, savings, carbon };
}

function downloadReport() { 
    if(!window.lastAudit) return alert("Generate an audit first!");
    const { units, rate, bill, savings, carbon } = window.lastAudit;
    
    const csvContent = "data:text/csv;charset=utf-8,"
        + "ECO SPARKS - PROOF OF IMPACT REPORT\n\n"
        + `Total Units Consumed,${units} kWh\n`
        + `Tariff Rate,₹${rate} per unit\n`
        + `Total Estimated Bill,₹${bill.toFixed(2)}\n`
        + `Estimated Carbon Footprint,${carbon} kg CO2\n`
        + `Target Monthly Savings,₹${savings.toFixed(2)}\n`;

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Eco_Sparks_Audit.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
