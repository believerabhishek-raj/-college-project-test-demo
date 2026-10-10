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

// Ultra-Safe Utility Functions
const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const safeSetHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const safeGetVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
const safeSetVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

// Safe DOM initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = localStorage.getItem('ecoTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('ecoLang') || 'en';
        safeSetVal('languageSelect', savedLang);
        safeSetVal('languageSelectMobile', savedLang);

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
    try {
        const body = document.body;
        const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('ecoTheme', newTheme);
        updateChartColors();
    } catch (e) { console.error(e); }
}

function changeLanguage(langCode) {
    try {
        currentLang = langCode || safeGetVal('languageSelect') || 'en';
        localStorage.setItem('ecoLang', currentLang);
        
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser) updateGreeting(activeUser.name);
    } catch (e) { console.error(e); }
}

function switchAuthTab(tab, btnElement) {
    try {
        document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        if(btnElement) btnElement.classList.add('active');
        const formEl = document.getElementById(tab + 'Form');
        if(formEl) formEl.classList.add('active');
        
        safeSetText('authError', '');
    } catch(e) { console.error(e); }
}

function showError(msg) { safeSetText('authError', msg); }

function handleRegister(e) {
    e.preventDefault();
    try {
        const name = safeGetVal('regName').trim();
        const id = safeGetVal('regId').trim();
        const pin = safeGetVal('regPin');
        
        if(!name || !id || !pin) return;
        
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        if(users[id]) return showError("Consumer Number already registered!");
        
        users[id] = { name, id, pin, appliances: [] };
        localStorage.setItem('ecoUsers', JSON.stringify(users));
        showError("Account created! Please login.");
        
        switchAuthTab('login', document.querySelector('.auth-tabs button'));
    } catch (e) { console.error(e); }
}

function handleLogin(e) {
    e.preventDefault();
    try {
        const id = safeGetVal('loginId').trim();
        const pin = safeGetVal('loginPin');
        
        if(!id || !pin) return;
        
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        if(users[id] && users[id].pin === pin) {
            localStorage.setItem('ecoActiveUser', JSON.stringify(users[id]));
            showMainApp(users[id]);
            loadAppliances();
        } else {
            showError("Invalid Consumer Number or PIN");
        }
    } catch (e) { console.error(e); }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    try {
        const pwd = safeGetVal('adminPassword');
        const btnEl = document.getElementById('adminLoginSubmitBtn');
        if(!pwd || !btnEl) return;

        btnEl.innerText = "Verifying...";
        const res = await fetch('/api/admin/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
            const authSec = document.getElementById('authSection');
            if(authSec) authSec.classList.add('hidden');
            
            const mainAppSec = document.getElementById('mainAppSection');
            if(mainAppSec) mainAppSec.classList.add('hidden');
            
            const adminSec = document.getElementById('adminSection');
            if(adminSec) adminSec.classList.remove('hidden');
            
            const sb = document.querySelector('.sidebar');
            if(sb) sb.classList.add('hidden');
            const mn = document.getElementById('mobileNav');
            if(mn) mn.classList.add('hidden');

            loadAdminData(); 
            
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            populateAdminTable(statsData.analytics);
        } else {
            showError("Invalid Admin Password");
        }
        btnEl.innerText = "Access Admin Panel";
    } catch (err) { 
        showError("Server Connection Error"); 
        const btnEl = document.getElementById('adminLoginSubmitBtn');
        if(btnEl) btnEl.innerText = "Access Admin Panel";
    }
}

function loadAdminData() {
    try {
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        let totalUsers = Object.keys(users).length;
        safeSetText('adminUserCount', totalUsers);
        
        const tbody = document.getElementById('adminUserListBody');
        if(!tbody) return;
        tbody.innerHTML = '';
        
        if(totalUsers === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users registered yet.</td></tr>';
            return;
        }

        Object.keys(users).forEach(id => {
            const u = users[id];
            let tLoad = 0; let tCost = 0;
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
                <td><button type="button" class="sm-btn" onclick="adminDeleteUser('${u.id}')"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>`;
        });
    } catch(e) { console.error(e); }
}

function adminDeleteUser(userId) {
    try {
        if(confirm("Are you sure you want to delete this user?")) {
            let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
            delete users[userId];
            localStorage.setItem('ecoUsers', JSON.stringify(users));
            loadAdminData(); 
        }
    } catch(e) { console.error(e); }
}

function adminAddNewUser() {
    try {
        const name = safeGetVal('adminNewName').trim();
        const id = safeGetVal('adminNewId').trim();
        const pin = safeGetVal('adminNewPin').trim();
        
        if(!name || !id || pin.length !== 4) return alert("Fill all fields properly (PIN 4 digits).");
        
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        if(users[id]) return alert("Consumer ID already exists!");
        
        users[id] = { name, id, pin, appliances: [] };
        localStorage.setItem('ecoUsers', JSON.stringify(users));
        
        safeSetVal('adminNewName', ''); safeSetVal('adminNewId', ''); safeSetVal('adminNewPin', '');
        alert("User successfully added by Admin.");
        loadAdminData();
    } catch(e) { console.error(e); }
}

function saveAdminProfile() { alert("Admin Profile updated successfully!"); }

function populateAdminTable(logs) {
    try {
        const tbody = document.getElementById('adminLogsBody');
        if(!tbody) return;
        tbody.innerHTML = '';
        if(!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No live network activity recorded yet.</td></tr>';
            return;
        }
        logs.forEach(log => {
            tbody.innerHTML += `<tr>
                <td><small>${log.time}</small></td>
                <td><strong>${log.name}</strong><br><small>${log.userId}</small></td>
                <td><span class="badge" style="background:#2980B9;color:white;padding:3px 8px;border-radius:4px;font-size:0.8rem">${log.action}</span></td>
                <td><code>${log.ip}</code></td>
                <td><small>${log.device}</small></td>
            </tr>`;
        });
    } catch(e) { console.error(e); }
}

function loadProfileFields(user) {
    try {
        safeSetVal('profileName', user.name || '');
        safeSetVal('profileId', user.id || '');
        const avatarEl = document.getElementById('userAvatarInitials');
        if(avatarEl && user.name) {
            avatarEl.innerText = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        }
    } catch(e) { console.error(e); }
}

function saveUserProfile() {
    try {
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(!activeUser) return;
        
        const name = safeGetVal('profileName').trim();
        const pin = safeGetVal('profilePin').trim();
        
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
        
        const msgEl = document.getElementById('profileMsg');
        if(msgEl) {
            msgEl.classList.remove('hidden');
            msgEl.innerText = "Profile updated successfully!";
        }
        updateGreeting(name);
        setTimeout(() => { if(msgEl) msgEl.innerText = ''; }, 3000);
    } catch(e) { console.error(e); }
}

function logout() {
    try {
        localStorage.removeItem('ecoActiveUser');
        location.reload();
    } catch(e) { console.error(e); }
}

function showMainApp(user) {
    try {
        const authSec = document.getElementById('authSection');
        if(authSec) authSec.classList.add('hidden');
        
        const mainAppSec = document.getElementById('mainAppSection');
        if(mainAppSec) mainAppSec.classList.remove('hidden');
        
        if(window.innerWidth <= 768) {
            const nav = document.querySelector('.features-nav');
            if(nav) nav.style.display = 'flex';
        } else {
            const logoutBox = document.getElementById('logoutBox');
            if(logoutBox) logoutBox.classList.remove('hidden');
        }

        updateGreeting(user.name);
        loadProfileFields(user);
        initCharts();
    } catch(e) { console.error(e); }
}

function updateGreeting(name) {
    try {
        const hour = new Date().getHours();
        let category = 'morning', timeG = 'Good Morning', icon = '☀️';
        if(hour >= 12 && hour < 17) { category = 'afternoon'; timeG = 'Good Afternoon'; icon = '🌤️'; }
        else if(hour >= 17) { category = 'evening'; timeG = 'Good Evening'; icon = '🌙'; }
        
        const pool = greetingsDB[category];
        const randomMotivation = pool[Math.floor(Math.random() * pool.length)];
        
        safeSetHTML('userGreeting', `${timeG}, ${name}! <span id="timeIcon">${icon}</span>`);
        safeSetHTML('dailyMotivation', randomMotivation);
    } catch(e) { console.error(e); }
}

function showFeature(featureId, btnElement) {
    try {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        if(btnElement) btnElement.classList.add('active');
        
        document.querySelectorAll('.feature-content').forEach(fc => {
            fc.classList.add('hidden');
            fc.classList.remove('active-feature');
        });
        
        const targetSection = document.getElementById(featureId);
        if(targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active-feature');
        }
        
        if(featureId === 'appliances' && pieChartInstance) pieChartInstance.update();
        if(featureId === 'dashboard' && barChartInstance) barChartInstance.update();
    } catch(e) { console.error("Navigation error:", e); }
}

// ------------------------------------
// PROPER AI POPUP MODAL BEHAVIOR
// ------------------------------------
function toggleAIPopup() {
    try {
        const popup = document.getElementById('aiChatPopup');
        const overlay = document.getElementById('popupOverlay');
        
        if(popup && overlay) {
            if(popup.classList.contains('hidden')) {
                // Open Popup
                popup.classList.remove('hidden');
                overlay.classList.remove('hidden');
                
                // Add pop animation classes explicitly
                popup.classList.add('scale-in-center');
            } else {
                // Close Popup
                popup.classList.add('hidden');
                overlay.classList.add('hidden');
                popup.classList.remove('scale-in-center');
            }
        }
    } catch(e) { console.error(e); }
}

function fillAndSend(text) {
    try {
        safeSetVal('aiInput', text);
        const suggs = document.getElementById('chatSuggestions');
        if(suggs) suggs.style.display = 'none';
        sendChatMessage();
    } catch(e) { console.error(e); }
}

function compareUsage() {
    try {
        const prevStr = safeGetVal('prevKwh');
        const latestStr = safeGetVal('latestKwh');
        if(!prevStr || !latestStr) return alert("Enter both month values to compare.");
        
        const prev = parseFloat(prevStr);
        const latest = parseFloat(latestStr);
        
        const diff = latest - prev;
        const pct = ((diff / prev) * 100).toFixed(1);
        
        if(diff > 0) {
            safeSetHTML('compareResult', `<span class="danger-text">Your usage increased by ${pct}% (+${diff} kWh). Check appliances!</span>`);
        } else if (diff < 0) {
            safeSetHTML('compareResult', `<span class="green-text">Great job! Usage decreased by ${Math.abs(pct)}% (${Math.abs(diff)} kWh).</span>`);
        } else {
            safeSetHTML('compareResult', "Your usage is exactly the same.");
        }
    } catch(e) { console.error(e); }
}

function calculateSimulator() {
    try {
        const units = parseFloat(safeGetVal('simUserUnits')) || 300;
        const rate = parseFloat(safeGetVal('simUserRate')) || 8;
        const pct = parseFloat(safeGetVal('simSlider')) || 15;
        
        safeSetText('simPctVal', pct);

        const savedUnits = (units * (pct / 100));
        const savedMoney = (savedUnits * rate).toFixed(0); 
        
        safeSetText('simUnitsResult', `${savedUnits.toFixed(1)} kWh`);
        safeSetText('simSavingsResult', `₹ ${savedMoney}`);
    } catch(e) { console.error(e); }
}

function updateSim() { calculateSimulator(); }

// --- APPLIANCES ---
function loadAppliances() {
    try {
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser && activeUser.appliances) {
            userAppliances = activeUser.appliances;
            renderAppliances();
        }
    } catch(e) { console.error(e); }
}

function saveAppliances() {
    try {
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser) {
            activeUser.appliances = userAppliances;
            localStorage.setItem('ecoActiveUser', JSON.stringify(activeUser));
            let users = JSON.parse(localStorage.getItem('ecoUsers'));
            users[activeUser.id] = activeUser;
            localStorage.setItem('ecoUsers', JSON.stringify(users));
        }
    } catch(e) { console.error(e); }
}

function addAppliance() {
    try {
        const name = safeGetVal('appName').trim();
        const power = parseFloat(safeGetVal('appPower'));
        const hours = parseFloat(safeGetVal('appHours'));
        
        if(!name || !power || !hours) return alert("Please fill all appliance fields.");
        
        const monthlyKwh = ((power * hours * 30) / 1000).toFixed(2);
        const monthlyCost = (monthlyKwh * 8).toFixed(2); 
        
        userAppliances.push({ id: Date.now(), name, power, hours, monthlyKwh, monthlyCost });
        safeSetVal('appName', ''); safeSetVal('appPower', ''); safeSetVal('appHours', '');
        
        saveAppliances();
        renderAppliances();
    } catch(e) { console.error(e); }
}

function deleteAppliance(id) {
    try {
        userAppliances = userAppliances.filter(app => app.id !== id);
        saveAppliances();
        renderAppliances();
    } catch(e) { console.error(e); }
}

function renderAppliances() {
    try {
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
        
        safeSetText('totalAppLoad', totalLoad.toFixed(2));
        safeSetText('dashLoadDisplay', `${totalLoad.toFixed(1)}`);
        
        const estBill = (totalLoad * 8).toFixed(0);
        safeSetText('dashBillDisplay', `₹${estBill}`);

        const vampireLoss = (estBill * 0.10).toFixed(0);
        safeSetText('vampireDisplay', `₹${vampireLoss}`);
        
        let ecoScore = 100 - (totalLoad / 10);
        if(ecoScore > 100) ecoScore = 100; if(ecoScore < 10) ecoScore = 10;
        if(totalLoad === 0) ecoScore = 85;
        safeSetText('ecoScoreDisplay', `${Math.floor(ecoScore)}%`);

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
    } catch(e) { console.error(e); }
}

function runCalculator() {
    try {
        const w = parseFloat(safeGetVal('calcWatts'));
        const h = parseFloat(safeGetVal('calcHours'));
        const r = parseFloat(safeGetVal('calcRate'));
        if(!w || !h || !r) return;
        
        const d = (w * h) / 1000;
        const m = d * 30;
        const c = m * r;
        
        safeSetText('resDailyKwh', `${d.toFixed(2)} kWh`);
        safeSetText('resMonthlyKwh', `${m.toFixed(2)} kWh`);
        safeSetText('resMonthlyCost', `₹${c.toFixed(2)}`);
    } catch(e) { console.error(e); }
}

function runOhmCalculator() {
    try {
        const vStr = safeGetVal('ohmVoltage');
        const iStr = safeGetVal('ohmCurrent');
        const rStr = safeGetVal('ohmResistance');
        
        const v = parseFloat(vStr);
        const i = parseFloat(iStr);
        const r = parseFloat(rStr);
        
        if(vStr && rStr && !iStr) { safeSetText('ohmResult', `Current (I) = ${(v/r).toFixed(2)} A`); }
        else if(vStr && iStr && !rStr) { safeSetText('ohmResult', `Resistance (R) = ${(v/i).toFixed(2)} Ω`); }
        else if(iStr && rStr && !vStr) { safeSetText('ohmResult', `Voltage (V) = ${(i*r).toFixed(2)} V`); }
        else { safeSetText('ohmResult', "Leave exactly ONE field empty!"); }
    } catch(e) { console.error(e); }
}

// --- Visual Energy Flowchart/Trend ---
function switchGraphType(type, btnEl) {
    try {
        document.querySelectorAll('.graph-toggles .toggle-btn').forEach(b => b.classList.remove('active'));
        if(btnEl) btnEl.classList.add('active');
        chartType = type;
        initCharts();
        updateManualChart();
    } catch(e) { console.error(e); }
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
    try {
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
    } catch(e) { console.error(e); }
}

function updateManualChart() {
    try {
        const w1 = parseFloat(safeGetVal('graphW1')) || 0;
        const w2 = parseFloat(safeGetVal('graphW2')) || 0;
        const w3 = parseFloat(safeGetVal('graphW3')) || 0;
        const w4 = parseFloat(safeGetVal('graphW4')) || 0;

        if(barChartInstance) {
            barChartInstance.data.datasets[0].data = [w1, w2, w3, w4, 45, 70, 50, 40, 65, 35, 50, 45];
            barChartInstance.update();
        }
    } catch(e) { console.error(e); }
}

// --- Text to Speech ---
function speakText(text) {
    try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
            const msg = new SpeechSynthesisUtterance(text);
            
            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi-IN') || v.name.includes('Hindi'));
            if(hindiVoice) msg.voice = hindiVoice;
            
            msg.rate = 1.0; msg.pitch = 1.0;
            window.speechSynthesis.speak(msg);
        } else {
            alert("Text-to-speech is not supported in this browser.");
        }
    } catch(e) { console.error(e); }
}

function stopSpeak() {
    try {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch(e) { console.error(e); }
}

// --- AI Chat Logic ---
async function sendChatMessage() {
    try {
        const msg = safeGetVal('aiInput').trim();
        if(!msg) return;
        
        addMessageToChat('chatBox', 'user', msg);
        safeSetVal('aiInput', '');
        const loadingId = addMessageToChat('chatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
        
        await processAIRequest(msg, loadingId);
    } catch(e) { console.error(e); }
}

async function processAIRequest(msg, loadingId) {
    try {
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        const userId = activeUser ? activeUser.id : 'guest_' + Math.random();
        
        const payload = { prompt: msg, language: currentLang, userId: userId };
        
        const response = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if(response.ok && data.response) {
            const rawText = data.response;
            const htmlText = renderMarkdownToHTML(rawText);
            
            const ttsHtml = `<div class="tts-controls mt-1">
                <button type="button" class="tts-btn" onclick="speakText(\`${rawText.replace(/"/g, "'").replace(/\n/g, ' ')}\`)"><i class="fa-solid fa-volume-high"></i> Listen</button>
                <button type="button" class="tts-btn" onclick="stopSpeak()"><i class="fa-solid fa-stop"></i></button>
            </div>`;
            
            safeSetHTML(loadingId, htmlText + ttsHtml);
        } else {
            safeSetHTML(loadingId, `<span class="error-text">⚠️ Connection failed.</span>`);
        }
    } catch(err) {
        safeSetHTML(loadingId, `<span class="error-text">⚠️ Network Error. Cannot reach AI server.</span>`);
    }
}

function addMessageToChat(boxId, sender, text) {
    try {
        const chatBox = document.getElementById(boxId);
        if(!chatBox) return '';
        const id = 'msg-' + Date.now();
        chatBox.innerHTML += `<div id="${id}" class="message ${sender}-message fade-in">${text}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    } catch(e) { console.error(e); return ''; }
}

function handleChatEnter(e) { if(e.key === 'Enter') sendChatMessage(); }

function renderMarkdownToHTML(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
}

// --- Live Energy Audit ---
function generateAudit() {
    try {
        const unitsStr = safeGetVal('auditUnits');
        const rateStr = safeGetVal('auditRate');
        if(!unitsStr || !rateStr) return alert("Please enter both Units and Tariff Rate.");
        
        const units = parseFloat(unitsStr);
        const rate = parseFloat(rateStr);
        
        const bill = units * rate;
        const savings = bill * 0.18; 
        const carbon = (units * 0.70).toFixed(1); 

        const resEl = document.getElementById('auditResult');
        if(resEl) resEl.classList.remove('hidden');
        
        safeSetHTML('auditBill', `Estimated Bill: ₹${bill.toFixed(2)}`);
        safeSetHTML('auditSavings', `Possible Savings: ₹${savings.toFixed(2)}`);
        safeSetText('auditCarbon', `${carbon} kg CO2`);
        
        window.lastAudit = { units, rate, bill, savings, carbon };
    } catch(e) { console.error(e); }
}

function downloadReport() { 
    try {
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
    } catch(e) { console.error(e); }
}
