const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzB1lhc3I8xaOUkHYXnIL4jFIsqwlVKWSgZVYFPZCWDN4DOvqHDM3dBpprQUhhATelVjw/exec';

let registeredUsers = {
    'mustafa.mahmoud8510@gmail.com': { password: 'mustafa123', specialty: ' Trainer' },
    'nedalehab1282001@gmail.com': { password: 'nedal456', specialty: ' Trainer' },
   
};

async function loadUsersFromSheet() {
    try {
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getUsers', {
                method: 'GET'
            });
            
            if (response.ok) {
                const users = await response.json();
                if (users && typeof users === 'object') {
                    registeredUsers = users;
                    updateUserCards();
                }
            }
        }
    } catch (error) {
        console.log('Using default users:', error);
    }
}

function updateUserCards() {
    const userList = document.querySelector('.user-list');
    userList.innerHTML = '';
    
    Object.keys(registeredUsers).forEach(username => {
        const user = registeredUsers[username];
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.onclick = () => fillLoginForm(username, user.password);
        
        userCard.innerHTML = `
            <h4>${getEmoji(user.specialty)} ${username}</h4>
            <p>${user.specialty}</p>
        `;
        
        userList.appendChild(userCard);
    });
}

function getEmoji(specialty) {
    if (specialty.includes('Technology') || specialty.includes('Programming')) return '';
    if (specialty.includes('Management')) return '';
    if (specialty.includes('Development')) return '';
    if (specialty.includes('Marketing')) return '';
    return '';
}

let currentUser = {
    username: '',
    specialty: '',
    reports: []
};

function fillLoginForm(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('loginError').style.display = 'none';
}

function validateLogin(username, password) {
    // Check pre-registered users
    if (registeredUsers[username] && registeredUsers[username].password === password) {
        return { isValid: true, specialty: registeredUsers[username].specialty };
    }
    
    if (username.trim() && password.trim() && password.length >= 4) {
        return { isValid: true, specialty: 'Trainer' };
    }
    
    return { isValid: false, specialty: '' };
}

function quickLogin(username, password) {
    const validation = validateLogin(username, password);
    if (validation.isValid) {
        login(username, validation.specialty);
    }
}


function login(username, specialty) {
    currentUser.username = username;
    currentUser.specialty = specialty;
    
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('reportPage').style.display = 'block';
    document.querySelector('.logout-btn').style.display = 'block';
    document.getElementById('userInfo').style.display = 'block';
    
   
    document.getElementById('userInfo').textContent = ` ${username}`;
    document.getElementById('headerSubtitle').textContent = `Welcome ${username} - ${specialty}`;
    
    loadUserReports(username);
}


function logout() {
    currentUser = { username: '', specialty: '', reports: [] };
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('reportPage').style.display = 'none';
    document.querySelector('.logout-btn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('headerSubtitle').textContent = 'Welcome to the Training Session Reports Management System';
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('sessionReportForm').reset();
}

// Load user reports from local storage
function loadUserReports(username) {
    const savedReports = JSON.parse(localStorage.getItem(`reports_${username}`)) || [];
    currentUser.reports = savedReports;
    displayUserReports();
}

// Display user reports
function displayUserReports() {
    const historyList = document.getElementById('historyList');
    
    if (currentUser.reports.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666;">No previous reports</p>';
        return;
    }

    historyList.innerHTML = '';
    currentUser.reports.slice(-5).reverse().forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <div>
                <h4>${report.sessionTitle}</h4>
                <p>Session Type: ${report.sessionType} | Participants: ${report.participantCount}</p>
                <div class="report-date">${report.sessionDate} - ${report.sessionTime}</div>
            </div>
            <div class="report-date">${report.timestamp}</div>
        `;
        historyList.appendChild(reportItem);
    });
}


function saveReportLocally(reportData) {
    currentUser.reports.push(reportData);
    localStorage.setItem(`reports_${currentUser.username}`, JSON.stringify(currentUser.reports));
    displayUserReports();
}


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const username = formData.get('username').trim();
    const password = formData.get('password').trim();
    
  
    document.getElementById('loginError').style.display = 'none';
    
    if (!username || !password) {
        document.getElementById('loginError').textContent = '❌ Please enter username and password';
        document.getElementById('loginError').style.display = 'block';
        return;
    }

    const validation = validateLogin(username, password);
    
    if (validation.isValid) {
        login(username, validation.specialty);
    } else {
        document.getElementById('loginError').textContent = '❌ Incorrect username or password';
        document.getElementById('loginError').style.display = 'block';
    }
});


document.getElementById('sessionReportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const loadingDiv = document.getElementById('loading');
    const statusDiv = document.getElementById('statusMessage');
    const submitBtn = document.querySelector('.submit-btn');
    
   
    statusDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    submitBtn.disabled = true;
    
  
    const formData = new FormData(this);
    const reportData = {
        timestamp: new Date().toLocaleString('en-US'),
        instructorName: currentUser.username,
        instructorSpecialty: currentUser.specialty,
        sessionDate: formData.get('sessionDate'),
        sessionTime: formData.get('sessionTime'),
        duration: formData.get('duration'),
        sessionTitle: formData.get('sessionTitle'),
        participantCount: formData.get('participantCount'),
        sessionType: formData.get('sessionType'),
        objectives: formData.get('objectives'),
        content: formData.get('content'),
        activities: formData.get('activities'),
        challenges: formData.get('challenges'),
        feedback: formData.get('feedback'),
        improvements: formData.get('improvements'),
        nextSession: formData.get('nextSession')
    };
    
    try {
       
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData)
            });
            
            showMessage('✅ Report successfully sent to Google Sheets!', 'success');
            saveReportLocally(reportData);
            this.reset();
            setDefaultDateTime();
        } else {
            
            showMessage(' Report saved locally', 'success');
            saveReportLocally(reportData);
            this.reset();
            setDefaultDateTime();
        }
        
    } catch (error) {
        console.error('Sending error:', error);
        showMessage('❌ An error occurred while sending the report. It has been saved locally.', 'error');
        saveReportLocally(reportData);
        this.reset();
        setDefaultDateTime();
    }
    
    loadingDiv.style.display = 'none';
    submitBtn.disabled = false;
});

function showMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
  
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}


function setDefaultDateTime() {
    const today = new Date();
    const dateInput = document.getElementById('sessionDate');
    const timeInput = document.getElementById('sessionTime');
    
    dateInput.value = today.toISOString().split('T')[0];
    timeInput.value = today.toTimeString().split(' ')[0].substring(0, 5);
}


document.addEventListener('DOMContentLoaded', function() {
    setDefaultDateTime();
    loadUsersFromSheet(); // Load users from Google Sheets
});
