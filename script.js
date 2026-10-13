// FULL TRANSLATIONS INTEGRATED
const translations = {
    en: {
        welcomeAuth: "Welcome to EMCS",
        authSubtitle: "Log in or create an account to start saving energy.",
        loginTab: "User Login", registerTab: "Create Account", adminTab: "Admin",
        loginBtn: "Secure Login", createAccBtn: "Create Account", adminLoginBtn: "Access Admin Panel",
        dashboardTab: "Dashboard", applianceTab: "Appliances", calcTool: "Calculators",
        auditTool: "Insights", simulator: "Simulator", communityTab: "Community",
        powerCutTab: "Outages", paymentTab: "Bill Payment", profileTab: "Profile", aboutUs: "About",
        ecoScore: "Eco Score", dashLoad: "Total Appliance Load", dashBill: "Est. Monthly Bill",
        vampirePower: "Vampire Power Loss", trendChart: "Appliance Usage Analysis",
        appTitle: "Appliance Load Calculator", appDesc: "Add your home appliances to build your energy profile.",
        addApp: "Add Appliance", calcEstimator: "Generic Estimator", calcOhm: "Ohm's Law Helper",
        auditTitle: "Live Energy Audit", auditDesc: "Proof of Impact: Real-time analysis based on your active appliances.",
        generateAudit: "Generate Audit Report", downloadReport: "Download Audit PDF",
        simTitle: "Live Savings Simulator", simDesc: "Adjust your appliance daily usage to see live impact on units and cost.",
        communityTitle: "Monthly Energy-Saving Challenge", communityDesc: "Compete with neighbors to save the most energy and earn badges!",
        logout: "Logout"
    },
    hi: {
        welcomeAuth: "EMCS में आपका स्वागत है",
        authSubtitle: "बिजली बचाने के लिए लॉगिन करें या अकाउंट बनाएं।",
        loginTab: "लॉगिन", registerTab: "अकाउंट बनाएं", adminTab: "एडमिन",
        loginBtn: "सुरक्षित लॉगिन", createAccBtn: "अकाउंट बनाएं", adminLoginBtn: "एडमिन पैनल खोलें",
        dashboardTab: "डैशबोर्ड", applianceTab: "उपकरण", calcTool: "कैलकुलेटर",
        auditTool: "इनसाइट्स", simulator: "सिम्युलेटर", communityTab: "कम्युनिटी",
        powerCutTab: "पावर कट", paymentTab: "बिल भुगतान", profileTab: "प्रोफ़ाइल", aboutUs: "हमारे बारे में",
        ecoScore: "इको स्कोर", dashLoad: "कुल उपकरण लोड", dashBill: "अनुमानित मासिक बिल",
        vampirePower: "वैम्पायर पावर लॉस", trendChart: "उपकरण उपयोग विश्लेषण",
        appTitle: "उपकरण लोड कैलकुलेटर", appDesc: "जानें कि आपके घर की बिजली कहाँ खर्च हो रही है।",
        addApp: "उपकरण जोड़ें", calcEstimator: "सामान्य अनुमानक", calcOhm: "ओम का नियम हेल्पर",
        auditTitle: "लाइव एनर्जी ऑडिट", auditDesc: "आपके सक्रिय उपकरणों के आधार पर रीयल-टाइम विश्लेषण।",
        generateAudit: "ऑडिट रिपोर्ट जनरेट करें", downloadReport: "ऑडिट PDF डाउनलोड करें",
        simTitle: "लाइव सेविंग्स सिम्युलेटर", simDesc: "इकाईयों और लागत पर लाइव प्रभाव देखने के लिए उपयोग को समायोजित करें।",
        communityTitle: "मासिक ऊर्जा-बचत चुनौती", communityDesc: "ऊर्जा बचाने और बैज अर्जित करने के लिए पड़ोसियों के साथ प्रतिस्पर्धा करें!",
        logout: "लॉग आउट"
    },
    hinglish: {
        welcomeAuth: "EMCS me Swagat Hai",
        authSubtitle: "Login karein ya naya account banayein energy save karne ke liye.",
        loginTab: "User Login", registerTab: "Naya Account", adminTab: "Admin",
        loginBtn: "Secure Login", createAccBtn: "Account Banayein", adminLoginBtn: "Admin Panel Kholein",
        dashboardTab: "Dashboard", applianceTab: "Appliances", calcTool: "Calculators",
        auditTool: "Insights", simulator: "Simulator", communityTab: "Community",
        powerCutTab: "Outages", paymentTab: "Bill Payment", profileTab: "Profile", aboutUs: "About Us",
        ecoScore: "Eco Score", dashLoad: "Total Load", dashBill: "Est. Monthly Bill",
        vampirePower: "Vampire Power Loss", trendChart: "Appliance Usage Analysis",
        appTitle: "Appliance Load Calculator", appDesc: "Add karein apne appliances aur dekhein energy kahan use ho rahi hai.",
        addApp: "Add Appliance", calcEstimator: "Generic Estimator", calcOhm: "Ohm's Law Helper",
        auditTitle: "Live Energy Audit", auditDesc: "Real-time analysis aapke active appliances ke basis par.",
        generateAudit: "Audit Report Generate Karein", downloadReport: "Audit PDF Download Karein",
        simTitle: "Live Savings Simulator", simDesc: "Appliance daily usage adjust karein aur live impact dekhein.",
        communityTitle: "Monthly Energy-Saving Challenge", communityDesc: "Apne dosto ke sath energy save karne ka challenge aur badges jeetein!",
        logout: "Logout"
    }
};

let currentLang = 'en';

const greetingsDB = {
    morning: ["A fresh morning to save energy", "Rise and shine, saver", "Wake up to savings", "Let's make today energy efficient"],
    afternoon: ["Hope your day is going green", "Mid-day energy check", "Keep saving this afternoon", "Turn off those extra lights"],
    evening: ["Wind down and power down", "Time to switch off extra lights", "Great evening to you", "A cozy and green evening"]
};

const CHART_COLORS = ['#E67E22', '#27AE60', '#2980B9', '#E74C3C', '#8e44ad', '#16a085', '#f39c12', '#d35400'];

let barChartInstance;
let pieChartInstance;
let auditHistoryChartInstance;
let adminUserChartInstance;
let applianceTrendChartInstance;
let userAppliances = [];
let chartType = 'line'; 
let applianceChartType = 'line';
let auditChartType = 'bar';

const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const safeSetHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const safeGetVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
const safeSetVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

// SEED DUMMY USERS FOR ADMIN PANEL
function seedDummyData() {
    if(!localStorage.getItem('ecoUsers')) {
        const dummies = {
            "1001": { name: "Ramesh Sharma", id: "1001", pin: "1234", appliances: [{id:1, name:"AC 1.5 Ton", power:1500, hours:5, monthlyKwh:225, monthlyCost:1800, state:true}] },
            "1002": { name: "Sunita Verma", id: "1002", pin: "1234", appliances: [{id:2, name:"Refrigerator", power:200, hours:24, monthlyKwh:144, monthlyCost:1152, state:true}] },
            "1003": { name: "Amit Kumar", id: "1003", pin: "1234", appliances: [{id:3, name:"Ceiling Fan", power:75, hours:12, monthlyKwh:27, monthlyCost:216, state:false}, {id:4, name:"TV", power:100, hours:6, monthlyKwh:18, monthlyCost:144, state:true}] },
            "1004": { name: "Priya Singh", id: "1004", pin: "1234", appliances: [] },
            "1005": { name: "Vikash Gupta", id: "1005", pin: "1234", appliances: [{id:5, name:"Water Heater", power:2000, hours:1, monthlyKwh:60, monthlyCost:480, state:false}] }
        };
        localStorage.setItem('ecoUsers', JSON.stringify(dummies));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        seedDummyData();
        const savedTheme = localStorage.getItem('ecoTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('ecoLang') || 'en';
        safeSetVal('languageSelect', savedLang);
        safeSetVal('languageSelectMobile', savedLang);
        changeLanguage(savedLang);

        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        if(activeUser) {
            showMainApp(activeUser);
            loadAppliances();
        }
        calculateSimulator(); 
    } catch(err) { console.error("Init Error:", err); }
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
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(translations[currentLang] && translations[currentLang][key]) {
                el.innerText = translations[currentLang][key];
            }
        });
        
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
    try {
        const name = safeGetVal('regName').trim();
        const id = safeGetVal('regId').trim();
        const pin = safeGetVal('regPin');
        
        if(!name || !id || !pin) return;
        
        let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
        if(users[id]) return showError("Consumer Number already registered!");
        
        users[id] = { name, id, pin, appliances: [] };
        localStorage.setItem('ecoUsers', JSON.stringify(users));
        trackUserAction(id, name, 'Registered', 'New Signup');
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
            trackUserAction(id, users[id].name, 'Logged In', 'Standard Login');
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
            
            // Highlight: onclick triggers admin user details modal
            tbody.innerHTML += `<tr onclick="openAdminUserDetails('${u.id}')" title="Click to view details">
                <td><strong>${u.id}</strong></td>
                <td class="text-primary" style="font-weight:600;">${u.name} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem; margin-left:5px;"></i></td>
                <td>${numApps} devices</td>
                <td>${tLoad.toFixed(2)} kWh</td>
                <td class="text-orange">₹${tCost.toFixed(2)}</td>
                <td onclick="event.stopPropagation();">
                    <button type="button" class="sm-btn danger-bg borderless" onclick="adminDeleteUser('${u.id}')" style="color:white; padding:5px 10px;"><i class="fa-solid fa-trash"></i></button>
                </td>
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

// ------------------------------------
// ADMIN USER DETAILS MODAL
// ------------------------------------
function openAdminUserDetails(userId) {
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    let user = users[userId];
    if(!user) return;

    safeSetText('modalUserName', user.name);
    safeSetText('modalUserId', user.id);

    const tbody = document.getElementById('modalUserAppliances');
    tbody.innerHTML = '';
    let totalLoad = 0;
    
    if(!user.appliances || user.appliances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No appliances registered.</td></tr>';
    } else {
        user.appliances.forEach(app => {
            totalLoad += parseFloat(app.monthlyKwh || 0);
            tbody.innerHTML += `<tr>
                <td><strong>${app.name}</strong></td>
                <td>${app.power}W</td>
                <td>${app.hours} hrs/day</td>
                <td class="text-orange">₹${app.monthlyCost}</td>
            </tr>`;
        });
    }

    const modal = document.getElementById('adminUserDetailsModal');
    const overlay = document.getElementById('popupOverlay');
    if(modal && overlay) {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        modal.classList.add('scale-in-center');
    }

    renderAdminUserChart(totalLoad);
}

function closeAdminUserModal() {
    const modal = document.getElementById('adminUserDetailsModal');
    const overlay = document.getElementById('popupOverlay');
    if(modal) modal.classList.add('hidden');
    if(overlay) overlay.classList.add('hidden');
}

function renderAdminUserChart(totalLoad) {
    try {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#888888';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        let baseKwh = totalLoad > 0 ? totalLoad : 150;
        let histData = [baseKwh*1.1, baseKwh*0.9, baseKwh*1.2, baseKwh*0.85, baseKwh*1.05, totalLoad];

        const ctxHist = document.getElementById('adminUserChart');
        if(ctxHist && typeof Chart !== 'undefined') {
            if(adminUserChartInstance) adminUserChartInstance.destroy();
            adminUserChartInstance = new Chart(ctxHist.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [{ 
                        label: 'Usage (kWh)', 
                        data: histData, 
                        borderColor: '#27AE60',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true, grid: {color: gridColor}, ticks: {color: textColor}}, 
                        x: { grid: {display: false}, ticks: {color: textColor}}
                    },
                    plugins: { legend: { display: false } } 
                }
            });
        }
    } catch (e) { console.error("Admin Chart Error:", e); }
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
        if(featureId === 'audit' && auditHistoryChartInstance) auditHistoryChartInstance.update();
        if(featureId === 'appliances' && applianceTrendChartInstance) applianceTrendChartInstance.update();
    } catch(e) { console.error("Navigation error:", e); }
}

function goToPaymentTab() {
    const items = document.querySelectorAll('.nav-item');
    for(let item of items) {
        if(item.getAttribute('onclick').includes('payment')) {
            showFeature('payment', item);
            break;
        }
    }
}

// ------------------------------------
// SMART IOT DUMMY
// ------------------------------------
async function toggleIoTDevice(deviceName, checkboxEl) {
    const state = checkboxEl.checked;
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(!activeUser) return;
    
    // Sync to memory
    let users = JSON.parse(localStorage.getItem('ecoUsers')) || {};
    if(users[activeUser.id] && users[activeUser.id].appliances) {
        let appIndex = users[activeUser.id].appliances.findIndex(a => a.name === deviceName);
        if(appIndex !== -1) {
            users[activeUser.id].appliances[appIndex].state = state;
            localStorage.setItem('ecoUsers', JSON.stringify(users));
        }
    }
    
    try {
        await fetch('/api/iot/toggle', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUser.id, name: activeUser.name, deviceName, state })
        });
    } catch(e) {}
}

// ------------------------------------
// RAZORPAY-THEMED PAYMENT GATEWAY
// ------------------------------------
let pendingPaymentApp = 'UPI';

function openPaymentModal() {
    const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
    if(!activeUser || !activeUser.appliances) return alert("Add appliances to calculate your load first!");
    
    let totalLoad = 0;
    activeUser.appliances.forEach(a => totalLoad += parseFloat(a.monthlyCost || 0));
    
    if(totalLoad === 0) return alert("Your estimated bill is ₹0. No payment needed at this moment.");
    
    safeSetText('payModalAmount', `₹${totalLoad.toFixed(2)}`);
    
    // Reset view inside modal
    switchRzpTab('upi');
    cancelPinPrompt();
    const statusScreen = document.getElementById('rzpStatusScreen');
    if(statusScreen) statusScreen.classList.add('hidden');
    const invTemplate = document.getElementById('rzpInvoiceTemplate');
    if(invTemplate) invTemplate.classList.add('hidden');
    const invBtns = document.getElementById('invoiceActionButtons');
    if(invBtns) invBtns.classList.add('hidden');

    const popup = document.getElementById('paymentModal');
    const overlay = document.getElementById('popupOverlay');
    if(popup && overlay) {
        popup.classList.remove('hidden');
        popup.style.display = 'flex'; // explicitly show
        overlay.classList.remove('hidden');
        overlay.style.display = 'block'; // explicitly show
        popup.classList.add('scale-in-center');
        
        const aiPopup = document.getElementById('aiChatPopup');
        if(aiPopup) {
            aiPopup.classList.add('hidden');
            aiPopup.style.display = 'none';
        }
    }
}

function closePaymentModal() {
    const popup = document.getElementById('paymentModal');
    const overlay = document.getElementById('popupOverlay');
    if(popup) {
        popup.classList.add('hidden');
        popup.style.display = 'none'; // explicitly hide
    }
    if(overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none'; // explicitly hide
    }
}

function closeAllPopups() {
    closePaymentModal();
    closeAdminUserModal();
    const aiPopup = document.getElementById('aiChatPopup');
    if(aiPopup) {
        aiPopup.classList.add('hidden');
        aiPopup.style.display = 'none';
    }
    const overlay = document.getElementById('popupOverlay');
    if(overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

function switchRzpTab(tabName) {
    document.querySelectorAll('.rzp-nav li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.rzp-tab-pane').forEach(pane => pane.classList.add('hidden'));
    cancelPinPrompt();
    const statusScreen = document.getElementById('rzpStatusScreen');
    if(statusScreen) statusScreen.classList.add('hidden');

    if(tabName === 'upi') {
        const nav = document.getElementById('rzpNavUpi');
        const tab = document.getElementById('rzpTabUpi');
        if(nav) nav.classList.add('active');
        if(tab) tab.classList.remove('hidden');
    } else if(tabName === 'card') {
        const nav = document.getElementById('rzpNavCard');
        const tab = document.getElementById('rzpTabCard');
        if(nav) nav.classList.add('active');
        if(tab) tab.classList.remove('hidden');
    } else if(tabName === 'net') {
        const nav = document.getElementById('rzpNavNet');
        const tab = document.getElementById('rzpTabNet');
        if(nav) nav.classList.add('active');
        if(tab) tab.classList.remove('hidden');
    }
}

function triggerPinPrompt(appName) {
    if(appName === 'UPI ID') {
        const upiVal = safeGetVal('customUpiId');
        if(!upiVal || !upiVal.includes('@')) return alert("Enter valid UPI ID (e.g. name@bank)");
        pendingPaymentApp = upiVal;
    } else {
        pendingPaymentApp = appName;
    }

    document.querySelectorAll('.rzp-tab-pane').forEach(pane => pane.classList.add('hidden'));
    safeSetText('pinPromptTitle', `Authorize via ${pendingPaymentApp}`);
    safeSetVal('rzpPinInput', '');
    const pinBox = document.getElementById('rzpPinPrompt');
    if(pinBox) pinBox.classList.remove('hidden');
}

function triggerCardOtpPrompt() {
    const cardNum = safeGetVal('rzpCardNumber');
    const cvv = safeGetVal('rzpCardCvv');
    if(!cardNum || !cvv) return alert("Please fill Card Number and CVV completely.");

    pendingPaymentApp = 'Card Payment';
    document.querySelectorAll('.rzp-tab-pane').forEach(pane => pane.classList.add('hidden'));
    safeSetText('pinPromptTitle', "Enter 3D-Secure Bank OTP");
    safeSetVal('rzpPinInput', '');
    const pinBox = document.getElementById('rzpPinPrompt');
    if(pinBox) pinBox.classList.remove('hidden');
}

function cancelPinPrompt() {
    const pinBox = document.getElementById('rzpPinPrompt');
    if(pinBox) pinBox.classList.add('hidden');
    const activeTab = document.querySelector('.rzp-nav li.active');
    if(activeTab) {
        if(activeTab.id === 'rzpNavUpi') { const t = document.getElementById('rzpTabUpi'); if(t) t.classList.remove('hidden'); }
        else if(activeTab.id === 'rzpNavCard') { const t = document.getElementById('rzpTabCard'); if(t) t.classList.remove('hidden'); }
        else if(activeTab.id === 'rzpNavNet') { const t = document.getElementById('rzpTabNet'); if(t) t.classList.remove('hidden'); }
    }
}

function executeMockPayment() {
    const pin = safeGetVal('rzpPinInput');
    if(!pin || pin.length < 4) return alert("Please enter valid 4 to 6 digit security PIN / OTP.");

    const pinBox = document.getElementById('rzpPinPrompt');
    if(pinBox) pinBox.classList.add('hidden');
    
    const statusScreen = document.getElementById('rzpStatusScreen');
    if(statusScreen) statusScreen.classList.remove('hidden');

    const icon = document.getElementById('rzpStatusIcon');
    const heading = document.getElementById('rzpStatusHeading');
    const sub = document.getElementById('rzpStatusSub');
    const invoiceTemplate = document.getElementById('rzpInvoiceTemplate');
    const actionBtns = document.getElementById('invoiceActionButtons');

    if(icon) icon.className = "fa-solid fa-circle-notch fa-spin fa-3x text-orange mb-2";
    if(heading) heading.innerText = `Authorizing via ${pendingPaymentApp}...`;
    if(sub) sub.innerText = "Connecting with Bank Server...";
    if(invoiceTemplate) invoiceTemplate.classList.add('hidden');
    if(actionBtns) actionBtns.classList.add('hidden');

    setTimeout(() => {
        if(heading) heading.innerText = "Verifying Credentials...";
        
        setTimeout(() => {
            if(icon) icon.className = "fa-solid fa-circle-check fa-3x green-text mb-2 scale-in";
            if(heading) heading.innerText = "Payment Successful!";
            if(sub) sub.innerText = "Here is your official payment receipt:";
            
            // Populate invoice details dynamically
            const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser')) || { id: "1001", name: "Valued Consumer" };
            const amountVal = safeGetText('payModalAmount');
            const receiptNo = "EMCS-" + Math.floor(100000 + Math.random() * 900000);
            const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

            safeSetText('invReceiptNo', receiptNo);
            safeSetText('invDate', dateStr);
            safeSetText('invConsumerId', activeUser.id);
            safeSetText('invConsumerName', activeUser.name);
            safeSetText('invMode', pendingPaymentApp);
            safeSetText('invBaseAmount', amountVal);
            safeSetText('invTotalAmount', amountVal);

            if(invoiceTemplate) invoiceTemplate.classList.remove('hidden');
            if(actionBtns) {
                actionBtns.classList.remove('hidden');
                actionBtns.style.display = 'flex';
            }
        }, 1500);
    }, 1200);
}

// REAL CLIENT-SIDE INVOICE PDF GENERATION
function downloadInvoicePDF() {
    const invoiceElement = document.getElementById('rzpInvoiceTemplate');
    if(!invoiceElement) return alert("Invoice details not found.");

    const opt = {
        margin:       10,
        filename:     `EMCS_Invoice_${safeGetText('invReceiptNo') || 'Receipt'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(invoiceElement).save();
}

// ------------------------------------
// AI POPUP MODAL BEHAVIOR (CRASH-PROOF)
// ------------------------------------
function toggleAIPopup() {
    try {
        const popup = document.getElementById('aiChatPopup');
        const overlay = document.getElementById('popupOverlay');
        
        if(popup && overlay) {
            const isHidden = popup.classList.contains('hidden') || popup.style.display === 'none';
            if(isHidden) {
                popup.classList.remove('hidden');
                popup.style.display = 'flex';
                overlay.classList.remove('hidden');
                overlay.style.display = 'block';
                popup.classList.add('scale-in-center');
                
                const payModal = document.getElementById('paymentModal');
                if(payModal) {
                    payModal.classList.add('hidden');
                    payModal.style.display = 'none';
                }
            } else {
                popup.classList.add('hidden');
                popup.style.display = 'none';
                overlay.classList.add('hidden');
                overlay.style.display = 'none';
                popup.classList.remove('scale-in-center');
            }
        }
    } catch(e) { console.error("AI Popup Error:", e); }
}

function fillAndSend(text) {
    try {
        safeSetVal('aiInput', text);
        const suggs = document.getElementById('chatSuggestions');
        if(suggs) suggs.style.display = 'none';
        sendPopupChatMessage();
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
        
        userAppliances.push({ id: Date.now(), name, power, hours, monthlyKwh, monthlyCost, state: true });
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
        
        if(userAppliances.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No appliances added yet.</td></tr>';
        } else {
            userAppliances.forEach(app => {
                totalLoad += parseFloat(app.monthlyKwh);
                const checkedAttr = app.state ? 'checked' : '';
                
                tbody.innerHTML += `<tr>
                    <td><strong>${app.name}</strong></td>
                    <td>${app.power}W</td>
                    <td><span class="badge light-green-bg">${app.hours} hrs</span></td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" ${checkedAttr} onchange="toggleIoTDevice('${app.name}', this)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td class="text-orange">₹${app.monthlyCost}</td>
                    <td><button type="button" class="sm-btn danger-bg borderless" onclick="deleteAppliance(${app.id})" style="color:white; padding:5px 10px;"><i class="fa-solid fa-trash"></i></button></td>
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

        updateApplianceGraph();
        updateAutomaticAudit(totalLoad);
    } catch(e) { console.error(e); }
}

// --- Dynamic Appliance Graphs ---
function switchApplianceGraph(type, btnEl) {
    try {
        const parent = btnEl.closest('.graph-toggles');
        if(parent) parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        if(btnEl) btnEl.classList.add('active');
        applianceChartType = type;
        updateApplianceGraph();
    } catch(e) { console.error(e); }
}

function updateApplianceGraph() {
    try {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#888888';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        let labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'];
        
        let datasets = [];
        if(userAppliances.length === 0) {
            datasets.push({ label: 'No Appliances', data: [0,0,0,0,0,0,0], backgroundColor: '#ccc' });
        } else {
            userAppliances.forEach((app, index) => {
                let baseDaily = (parseFloat(app.monthlyKwh) / 30);
                // Creating slight dummy variations for the past 7 days
                let data = [
                    baseDaily * 0.9, baseDaily * 1.1, baseDaily * 0.8, 
                    baseDaily * 1.0, baseDaily * 1.2, baseDaily * 0.95, baseDaily
                ];
                
                let color = CHART_COLORS[index % CHART_COLORS.length];
                
                let dataset = {
                    label: app.name,
                    data: data,
                    borderColor: color,
                    borderWidth: 2,
                    tension: 0.4
                };

                if(applianceChartType === 'bar') {
                    dataset.backgroundColor = color + 'CC';
                    dataset.borderRadius = 4;
                } else {
                    dataset.backgroundColor = color + '33'; // transparent fill
                    dataset.fill = true;
                }
                datasets.push(dataset);
            });
        }

        const chartEl = document.getElementById('applianceHistoryChart');
        if(chartEl && typeof Chart !== 'undefined') {
            if(applianceTrendChartInstance) {
                applianceTrendChartInstance.destroy();
            }
            
            applianceTrendChartInstance = new Chart(chartEl.getContext('2d'), {
                type: applianceChartType,
                data: { labels: labels, datasets: datasets },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true, grid: {color: gridColor}, ticks: {color: textColor}, title: {display:true, text:'kWh / Day'} }, 
                        x: { grid: {display: false}, ticks: {color: textColor}}
                    }, 
                    plugins: { legend: { position: 'bottom', labels: {color: textColor} } } 
                }
            });
        }

        // Keep the Pie chart updated too
        const pieEl = document.getElementById('pieChart');
        if(pieEl && typeof Chart !== 'undefined') {
            let pieLabels = userAppliances.length > 0 ? userAppliances.map(a => a.name) : ['No Data'];
            let pieData = userAppliances.length > 0 ? userAppliances.map(a => a.monthlyKwh) : [100];
            let pieColors = userAppliances.length > 0 ? CHART_COLORS.slice(0, userAppliances.length) : ['#f5f5f5'];

            if(pieChartInstance) pieChartInstance.destroy();
            pieChartInstance = new Chart(pieEl.getContext('2d'), {
                type: 'doughnut',
                data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: pieColors }] },
                options: { 
                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                    plugins: { legend: { position: 'right', labels: {color: textColor, font: {family: 'Poppins', size: 11}, boxWidth: 12} } } 
                }
            });
        }
    } catch (e) { console.error("Graph Update Error:", e); }
}

// --- Automatic Audit Insights & History Graph ---
function switchAuditGraph(type, btnEl) {
    try {
        const parent = btnEl.closest('.graph-toggles');
        if(parent) parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        if(btnEl) btnEl.classList.add('active');
        auditChartType = type;
        if(window.lastTotalLoad) updateAutomaticAudit(window.lastTotalLoad);
    } catch(e) { console.error(e); }
}

function updateAutomaticAudit(totalLoad) {
    try {
        window.lastTotalLoad = totalLoad;
        const rate = 8;
        const bill = totalLoad * rate;
        const savings = bill * 0.18; 
        const carbon = (totalLoad * 0.70).toFixed(1); 

        safeSetText('autoAuditUnits', `${totalLoad.toFixed(2)} kWh`);
        safeSetText('autoAuditBill', `₹${bill.toFixed(2)}`);
        safeSetText('autoAuditSavings', `₹${savings.toFixed(2)}`);
        safeSetText('autoAuditCarbon', `${carbon} kg CO2`);
        safeSetText('paymentTabAmount', `₹${bill.toFixed(2)}`);
        
        window.lastAudit = { units: totalLoad.toFixed(2), rate, bill, savings, carbon };

        // Dummy 6 Month History
        let baseBill = bill > 0 ? bill : 1500;
        let baseKwh = totalLoad > 0 ? totalLoad : 180;
        
        let histBills = [baseBill*1.1, baseBill*0.9, baseBill*1.2, baseBill*0.85, baseBill*1.05, bill];
        let histKwh = [baseKwh*1.1, baseKwh*0.9, baseKwh*1.2, baseKwh*0.85, baseKwh*1.05, totalLoad];
        let months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Now)'];

        const ctxHist = document.getElementById('auditHistoryChart');
        if(ctxHist && typeof Chart !== 'undefined') {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const textColor = isDark ? '#E0E0E0' : '#888888';
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

            if(auditHistoryChartInstance) auditHistoryChartInstance.destroy();
            
            auditHistoryChartInstance = new Chart(ctxHist.getContext('2d'), {
                type: auditChartType,
                data: {
                    labels: months,
                    datasets: [{ 
                        label: 'Paid Bill (₹)', 
                        data: histBills, 
                        backgroundColor: auditChartType === 'bar' ? '#2980B9CC' : 'rgba(41, 128, 185, 0.2)', 
                        borderColor: '#2980B9',
                        borderWidth: 2,
                        fill: auditChartType === 'line',
                        tension: 0.4,
                        borderRadius: auditChartType === 'bar' ? 4 : 0
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true, grid: {color: gridColor}, ticks: {color: textColor} }, 
                        x: { grid: {display: false}, ticks: {color: textColor} }
                    },
                    plugins: { legend: { display: false } } 
                }
            });
        }

        // Populate Table
        const histTable = document.getElementById('sixMonthTableBody');
        if(histTable) {
            histTable.innerHTML = '';
            for(let i=0; i<6; i++) {
                let dateDummy = `${10 + i} ${months[i]} 2026`;
                let statusBadge = i === 5 && bill > 0 ? `<span class="badge light-red-bg">Pending</span>` : `<span class="badge light-green-bg">Paid</span>`;
                
                histTable.innerHTML += `<tr>
                    <td><strong>${months[i]}</strong></td>
                    <td>${histKwh[i].toFixed(1)}</td>
                    <td class="text-orange">₹${histBills[i].toFixed(0)}</td>
                    <td>${dateDummy} <br> ${statusBadge}</td>
                </tr>`;
            }
        }
    } catch (e) { console.error("Auto Audit Error:", e); }
}

function downloadReport() { 
    try {
        if(!window.lastAudit) return alert("Add appliances to generate an audit first!");
        const { units, rate, bill, savings, carbon } = window.lastAudit;
        
        const csvContent = "data:text/csv;charset=utf-8,"
            + "EMCS - AUTOMATED ENERGY AUDIT REPORT

"
            + `Total Active Units Consumed,${units} kWh
`
            + `Estimated Tariff Rate,₹${rate} per unit
`
            + `Total Estimated Bill,₹${bill.toFixed(2)}
`
            + `Estimated Carbon Footprint,${carbon} kg CO2
`
            + `Target Optimized Savings,₹${savings.toFixed(2)}
`;

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `EMCS_Audit_Report.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch(e) { console.error(e); }
}

// --- General Calculators ---
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

// --- Dashboard General Graph ---
function switchGraphType(type, btnEl) {
    try {
        const parent = btnEl.closest('.graph-toggles');
        if(parent) parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        if(btnEl) btnEl.classList.add('active');
        chartType = type;
        updateManualChart();
    } catch(e) { console.error(e); }
}

function initCharts() {
    updateApplianceGraph(); 
    updateManualChart();
}

function updateChartColors() {
    try {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#888888';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        if(barChartInstance) {
            barChartInstance.options.scales.y.grid.color = gridColor;
            barChartInstance.options.scales.y.ticks.color = textColor;
            barChartInstance.options.scales.x.ticks.color = textColor;
            barChartInstance.update();
        }
        if(pieChartInstance) {
            pieChartInstance.options.plugins.legend.labels.color = textColor;
            pieChartInstance.update();
        }
        if(auditHistoryChartInstance) {
            auditHistoryChartInstance.options.scales.y.grid.color = gridColor;
            auditHistoryChartInstance.options.scales.y.ticks.color = textColor;
            auditHistoryChartInstance.options.scales.x.ticks.color = textColor;
            auditHistoryChartInstance.update();
        }
        if(applianceTrendChartInstance) {
            applianceTrendChartInstance.options.scales.y.grid.color = gridColor;
            applianceTrendChartInstance.options.scales.y.ticks.color = textColor;
            applianceTrendChartInstance.options.scales.x.ticks.color = textColor;
            applianceTrendChartInstance.update();
        }
        if(adminUserChartInstance) {
            adminUserChartInstance.options.scales.y.grid.color = gridColor;
            adminUserChartInstance.options.scales.y.ticks.color = textColor;
            adminUserChartInstance.options.scales.x.ticks.color = textColor;
            adminUserChartInstance.update();
        }
    } catch(e) { console.error(e); }
}

function updateManualChart() {
    try {
        const w1 = parseFloat(safeGetVal('graphW1')) || 45;
        const w2 = parseFloat(safeGetVal('graphW2')) || 62;
        const w3 = parseFloat(safeGetVal('graphW3')) || 38;
        const w4 = parseFloat(safeGetVal('graphW4')) || 55;

        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#E0E0E0' : '#888888';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        const chartEl = document.getElementById('energyChart');
        if(!chartEl || typeof Chart === 'undefined') return;

        if(barChartInstance) barChartInstance.destroy();
        
        barChartInstance = new Chart(chartEl.getContext('2d'), {
            type: chartType, 
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'W1', 'W2', 'W3', 'W4'],
                datasets: [{
                    label: 'Overall Trend (kWh)',
                    data: [40, 55, 30, 60, 45, 70, 50, 40, 65, w1, w2, w3, w4], 
                    borderColor: '#E67E22', 
                    backgroundColor: chartType === 'line' ? 'rgba(230, 126, 34, 0.15)' : '#E67E22CC',
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

// --- AI Chat Logic (Crash-Proof) ---
async function sendPopupChatMessage() {
    try {
        const msg = safeGetVal('aiInput').trim();
        if(!msg) return;
        
        addMessageToChat('chatBox', 'user', msg);
        safeSetVal('aiInput', '');
        const loadingId = addMessageToChat('chatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
        
        await processAIRequest(msg, loadingId, 'chatBox');
    } catch(e) { console.error("Popup Chat Error:", e); }
}

async function sendTabChatMessage() {
    try {
        const msg = safeGetVal('tabChatInput').trim();
        if(!msg) return;
        
        addMessageToChat('tabChatBox', 'user', msg);
        safeSetVal('tabChatInput', '');
        const loadingId = addMessageToChat('tabChatBox', 'ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');
        
        await processAIRequest(msg, loadingId, 'tabChatBox');
    } catch(e) { console.error("Tab Chat Error:", e); }
}

async function processAIRequest(msg, loadingId, boxId) {
    try {
        const activeUser = JSON.parse(localStorage.getItem('ecoActiveUser'));
        const userId = activeUser ? activeUser.id : 'guest_' + Math.random();
        
        const payload = { prompt: msg, language: currentLang, userId: userId };
        if(window.tempAiContext) {
            payload.customContext = window.tempAiContext;
            window.tempAiContext = null; 
        }
        
        const response = await fetch('/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if(response.ok && data.response) {
            const rawText = data.response;
            const htmlText = renderMarkdownToHTML(rawText);
            
            const ttsHtml = `<div class="tts-controls mt-1">
                <button type="button" class="tts-btn" onclick="speakText(\`${rawText.replace(/"/g, "'").replace(/
/g, ' ')}\`)"><i class="fa-solid fa-volume-high"></i> Listen</button>
                <button type="button" class="tts-btn" onclick="stopSpeak()"><i class="fa-solid fa-stop"></i></button>
            </div>`;
            
            safeSetHTML(loadingId, htmlText + ttsHtml);
        } else {
            safeSetHTML(loadingId, `<span class="error-text">⚠️ Connection failed: ${data.error || 'Server error'}</span>`);
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

function handleChatEnter(e) { if(e.key === 'Enter') sendPopupChatMessage(); }
function handleTabChatEnter(e) { if(e.key === 'Enter') sendTabChatMessage(); }

function renderMarkdownToHTML(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/
/g, '<br>');
}
