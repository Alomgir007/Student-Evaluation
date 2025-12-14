window.currentUser = null;
window.currentUserType = null;
window.currentChatPartner = null;
window.currentTab = null;

function showView(viewId) {
    document.querySelectorAll('[id^="view-"]').forEach(v => v.classList.add('hidden'));
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden');
        view.classList.add('fade-in');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMsg.textContent = message;
    
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle text-red-400';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle text-yellow-400';
    } else {
        toastIcon.className = 'fas fa-check-circle text-green-400';
    }
    
    toast.classList.remove('hidden');
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}
window.showToast = showToast;

function login() {
    const name = document.getElementById('loginName').value.trim();
    const pass = document.getElementById('loginPass').value;
    
    if (!name || !pass) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    let user = window.DB.teachers.find(t => t.name === name && t.password === pass);
    if (user) {
        window.currentUser = user;
        window.currentUserType = 'teacher';
        showTeacherDashboard();
        return;
    }
    
    user = window.DB.students.find(s => s.name === name && s.password === pass);
    if (user) {
        window.currentUser = user;
        window.currentUserType = 'student';
        showStudentDashboard();
        return;
    }
    
    showToast('Invalid credentials', 'error');
}
window.login = login;

function logout() {
    window.currentUser = null;
    window.currentUserType = null;
    window.currentChatPartner = null;
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('loginName').value = '';
    document.getElementById('loginPass').value = '';
    showView('view-login');
}
window.logout = logout;

function signupTeacher() {
    const name = document.getElementById('tName').value.trim();
    const pass = document.getElementById('tPass').value;
    const subject = document.getElementById('tSubj').value.trim();
    const code = document.getElementById('tCode').value.trim().toUpperCase();
    const contact = document.getElementById('tContact').value.trim();
    const availability = document.getElementById('tAvail').value.trim();
    
    if (!name || !pass || !subject || !code) {
        showToast('Please fill required fields', 'error');
        return;
    }
    
    if (window.DB.teachers.find(t => t.name === name)) {
        showToast('Teacher name already exists', 'error');
        return;
    }
    
    window.fbAdd('teachers', {
        name,
        password: pass,
        subject,
        courseCode: code,
        contact,
        availability,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
        problemsSolved: 0
    }).then(success => {
        if (success) {
            showToast('Registration successful! Please login.');
            showView('view-login');
            document.getElementById('tName').value = '';
            document.getElementById('tPass').value = '';
            document.getElementById('tSubj').value = '';
            document.getElementById('tCode').value = '';
            document.getElementById('tContact').value = '';
            document.getElementById('tAvail').value = '';
        }
    });
}
window.signupTeacher = signupTeacher;

function signupStudent() {
    const name = document.getElementById('sName').value.trim();
    const pass = document.getElementById('sPass').value;
    const id = document.getElementById('sId').value.trim();
    const no = document.getElementById('sNo').value.trim();
    const batch = document.getElementById('sBatch').value.trim();
    const cgpas = document.getElementById('sCgpa').value.split(',').map(c => c.trim()).filter(c => c);
    const skills = document.getElementById('sSkills').value.split(',').map(s => s.trim()).filter(s => s);
    const links = document.getElementById('sLinks').value.split(',').map(l => l.trim()).filter(l => l);
    
    if (!name || !pass || !id || !batch) {
        showToast('Please fill required fields', 'error');
        return;
    }
    
    if (window.DB.students.find(s => s.universityID === id)) {
        showToast('University ID already registered', 'error');
        return;
    }
    
    window.fbAdd('students', {
        name,
        password: pass,
        universityID: id,
        studentNo: no,
        batchNo: batch,
        cgpas,
        skills,
        portfolioLinks: links,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
        problemsSolved: 0,
        submittedProblems: 0,
        evaluations: {}
    }).then(success => {
        if (success) {
            showToast('Registration successful! Please login.');
            showView('view-login');
            document.getElementById('sName').value = '';
            document.getElementById('sPass').value = '';
            document.getElementById('sId').value = '';
            document.getElementById('sNo').value = '';
            document.getElementById('sBatch').value = '';
            document.getElementById('sCgpa').value = '';
            document.getElementById('sSkills').value = '';
            document.getElementById('sLinks').value = '';
        }
    });
}
window.signupStudent = signupStudent;

function showTeacherDashboard() {
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('welcomeText').textContent = `Welcome, ${window.currentUser.name}`;
    
    document.getElementById('teacherInitialsDisplay').textContent = window.currentUser.initials || window.currentUser.name[0];
    document.getElementById('teacherNameDisplay').textContent = window.currentUser.name;
    document.getElementById('teacherCodeDisplay').textContent = window.currentUser.courseCode;
    
    showView('view-teacher-dash');
    switchTab('t-profile');
}

function showStudentDashboard() {
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('welcomeText').textContent = `Welcome, ${window.currentUser.name}`;
    
    document.getElementById('studentInitialsDisplay').textContent = window.currentUser.initials || window.currentUser.name[0];
    document.getElementById('studentNameDisplay').textContent = window.currentUser.name;
    document.getElementById('studentIdDisplay').textContent = window.currentUser.universityID;
    
    showView('view-student-dash');
    switchTab('s-profile');
}

function switchTab(tabId) {
    window.currentTab = tabId;
    
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    
    const navItem = document.querySelector(`[data-tab="${tabId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    refreshCurrentTab();
}
window.switchTab = switchTab;

window.refreshCurrentTab = function() {
    if (!window.currentTab) return;
    
    switch(window.currentTab) {
        case 't-profile':
            renderTeacherProfile();
            break;
        case 't-chat':
            renderChatContacts('teacher');
            break;
        case 't-problems':
            renderProblems('teacher');
            break;
        case 't-leaderboard':
            renderLeaderboard('student');
            break;
        case 't-extracare':
            renderExtraCareList();
            break;
        case 's-profile':
            renderStudentProfile();
            break;
        case 's-chat':
            renderChatContacts('student');
            break;
        case 's-problems':
            renderProblems('student');
            break;
        case 's-leaderboard':
            renderBatchLeaderboard();
            break;
    }
};

function renderTeacherProfile() {
    const u = window.currentUser;
    const container = document.getElementById('teacherProfileView');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.problemsSolved || 0}</p>
                <p class="profile-stat-label">Problems Solved</p>
            </div>
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.courseCode}</p>
                <p class="profile-stat-label">Course Code</p>
            </div>
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.subject}</p>
                <p class="profile-stat-label">Subject</p>
            </div>
        </div>
        <div class="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-user text-indigo-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">Name</span>
                <span class="font-bold">${u.name}</span>
            </div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-phone text-indigo-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">Contact</span>
                <span>${u.contact || 'Not provided'}</span>
            </div>
            <div class="flex items-center gap-3">
                <i class="fas fa-clock text-indigo-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">Availability</span>
                <span>${u.availability || 'Not provided'}</span>
            </div>
        </div>
    `;
}

function renderStudentProfile() {
    const u = window.currentUser;
    const container = document.getElementById('studentProfileView');
    
    let totalStars = 0;
    let evalCount = 0;
    for (const evals of Object.values(u.evaluations || {})) {
        evals.forEach(e => {
            totalStars += e.stars;
            evalCount++;
        });
    }
    const avgRating = evalCount > 0 ? (totalStars / evalCount).toFixed(1) : 'N/A';
    
    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.problemsSolved || 0}</p>
                <p class="profile-stat-label">Problems Solved</p>
            </div>
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.submittedProblems || 0}</p>
                <p class="profile-stat-label">Problems Posted</p>
            </div>
            <div class="profile-stat text-center">
                <p class="profile-stat-value text-yellow-500">${avgRating}</p>
                <p class="profile-stat-label">Avg Rating</p>
            </div>
            <div class="profile-stat text-center">
                <p class="profile-stat-value">${u.batchNo}</p>
                <p class="profile-stat-label">Batch</p>
            </div>
        </div>
        <div class="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-user text-emerald-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">Name</span>
                <span class="font-bold">${u.name}</span>
            </div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-id-card text-emerald-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">University ID</span>
                <span>${u.universityID}</span>
            </div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-phone text-emerald-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">Contact</span>
                <span>${u.studentNo || 'Not provided'}</span>
            </div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-chart-line text-emerald-500 w-5"></i>
                <span class="font-medium text-slate-500 w-28">CGPA History</span>
                <span>${u.cgpas?.join(', ') || 'Not provided'}</span>
            </div>
            <div class="flex items-start gap-3 pb-3 border-b border-slate-200">
                <i class="fas fa-tools text-emerald-500 w-5 mt-1"></i>
                <span class="font-medium text-slate-500 w-28">Skills</span>
                <div class="flex flex-wrap gap-1">${u.skills?.map(s => `<span class="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">${s}</span>`).join('') || 'None'}</div>
            </div>
            <div class="flex items-start gap-3">
                <i class="fas fa-link text-emerald-500 w-5 mt-1"></i>
                <span class="font-medium text-slate-500 w-28">Portfolio</span>
                <div class="flex flex-col gap-1">${u.portfolioLinks?.map(l => `<a href="${l}" target="_blank" class="text-indigo-600 hover:underline text-sm">${l}</a>`).join('') || 'None'}</div>
            </div>
        </div>
    `;
}

function enableEditMode(type) {
    if (type === 'teacher') {
        document.getElementById('teacherProfileView').classList.add('hidden');
        document.getElementById('teacherProfileEdit').classList.remove('hidden');
        document.getElementById('editTSubject').value = window.currentUser.subject || '';
        document.getElementById('editTContact').value = window.currentUser.contact || '';
        document.getElementById('editTAvail').value = window.currentUser.availability || '';
    } else {
        document.getElementById('studentProfileView').classList.add('hidden');
        document.getElementById('studentProfileEdit').classList.remove('hidden');
        document.getElementById('editSNo').value = window.currentUser.studentNo || '';
        document.getElementById('editSBatch').value = window.currentUser.batchNo || '';
        document.getElementById('editSCgpa').value = window.currentUser.cgpas?.join(', ') || '';
        document.getElementById('editSSkills').value = window.currentUser.skills?.join(', ') || '';
        document.getElementById('editSLinks').value = window.currentUser.portfolioLinks?.join(', ') || '';
    }
}
window.enableEditMode = enableEditMode;

function cancelEdit(type) {
    if (type === 'teacher') {
        document.getElementById('teacherProfileView').classList.remove('hidden');
        document.getElementById('teacherProfileEdit').classList.add('hidden');
    } else {
        document.getElementById('studentProfileView').classList.remove('hidden');
        document.getElementById('studentProfileEdit').classList.add('hidden');
    }
}
window.cancelEdit = cancelEdit;

function saveProfile(type) {
    if (type === 'teacher') {
        const updates = {
            subject: document.getElementById('editTSubject').value.trim(),
            contact: document.getElementById('editTContact').value.trim(),
            availability: document.getElementById('editTAvail').value.trim()
        };
        const newPass = document.getElementById('editTPass').value;
        if (newPass) updates.password = newPass;
        
        window.fbUpdate('teachers', window.currentUser._docId, updates).then(() => {
            showToast('Profile updated successfully');
            cancelEdit('teacher');
        });
    } else {
        const updates = {
            studentNo: document.getElementById('editSNo').value.trim(),
            batchNo: document.getElementById('editSBatch').value.trim(),
            cgpas: document.getElementById('editSCgpa').value.split(',').map(c => c.trim()).filter(c => c),
            skills: document.getElementById('editSSkills').value.split(',').map(s => s.trim()).filter(s => s),
            portfolioLinks: document.getElementById('editSLinks').value.split(',').map(l => l.trim()).filter(l => l)
        };
        const newPass = document.getElementById('editSPass').value;
        if (newPass) updates.password = newPass;
        
        window.fbUpdate('students', window.currentUser._docId, updates).then(() => {
            showToast('Profile updated successfully');
            cancelEdit('student');
        });
    }
}
window.saveProfile = saveProfile;

function renderChatContacts(userType) {
    const containerId = userType === 'teacher' ? 'tChatContacts' : 'sChatContacts';
    const container = document.getElementById(containerId);
    
    const myName = window.currentUser.name;
    const conversations = {};
    
    window.DB.messages.forEach(msg => {
        if (msg.sender === myName || msg.receiver === myName) {
            const partner = msg.sender === myName ? msg.receiver : msg.sender;
            if (!conversations[partner]) {
                conversations[partner] = { lastMsg: msg, unread: 0 };
            } else if (msg.timestamp > conversations[partner].lastMsg.timestamp) {
                conversations[partner].lastMsg = msg;
            }
        }
    });
    
    const sortedPartners = Object.entries(conversations)
        .sort((a, b) => b[1].lastMsg.timestamp - a[1].lastMsg.timestamp);
    
    if (sortedPartners.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-center">
                <i class="fas fa-inbox text-3xl mb-3 opacity-30"></i>
                <p class="text-sm">No conversations yet</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    sortedPartners.forEach(([partner, data]) => {
        const isActive = window.currentChatPartner === partner;
        const activeClass = isActive ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-white';
        
        html += `
            <div onclick="openChat('${partner}', '${userType}')" class="p-4 cursor-pointer ${activeClass} border-b border-slate-100 transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        ${partner[0]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-slate-800 truncate">${partner}</p>
                        <p class="text-xs text-slate-500 truncate">${data.lastMsg.text}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openChat(partnerName, userType) {
    window.currentChatPartner = partnerName;
    
    const headerEl = document.getElementById(userType === 'teacher' ? 'tChatHeader' : 'sChatHeader');
    headerEl.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
            ${partnerName[0]}
        </div>
        <span class="font-bold text-slate-800">${partnerName}</span>
    `;
    
    document.getElementById(userType === 'teacher' ? 'tChatInputArea' : 'sChatInputArea').classList.remove('hidden');
    
    renderChatMessages(userType);
    renderChatContacts(userType);
}
window.openChat = openChat;

function renderChatMessages(userType) {
    const container = document.getElementById(userType === 'teacher' ? 'tChatMessages' : 'sChatMessages');
    const myName = window.currentUser.name;
    const partner = window.currentChatPartner;
    
    if (!partner) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-400">
                <i class="fas fa-comments text-4xl mb-3 opacity-20"></i>
                <p>Select a conversation to start messaging</p>
            </div>
        `;
        return;
    }
    
    const messages = window.DB.messages
        .filter(m => (m.sender === myName && m.receiver === partner) || (m.sender === partner && m.receiver === myName))
        .sort((a, b) => a.timestamp - b.timestamp);
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-400">
                <i class="fas fa-paper-plane text-4xl mb-3 opacity-20"></i>
                <p>No messages yet. Say hello!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    messages.forEach(msg => {
        const isSent = msg.sender === myName;
        html += `
            <div class="chat-bubble ${isSent ? 'chat-sent' : 'chat-received'}">
                ${msg.text}
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage(event, userType) {
    event.preventDefault();
    
    const inputId = userType === 'teacher' ? 'tMsgInput' : 'sMsgInput';
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    
    if (!text || !window.currentChatPartner) return;
    
    window.fbAdd('messages', {
        sender: window.currentUser.name,
        receiver: window.currentChatPartner,
        text,
        timestamp: Date.now()
    }).then(() => {
        input.value = '';
    });
}
window.sendChatMessage = sendChatMessage;

function startChat(partnerName) {
    window.currentChatPartner = partnerName;
    
    if (window.currentUserType === 'teacher') {
        switchTab('t-chat');
    } else {
        switchTab('s-chat');
    }
    
    setTimeout(() => {
        openChat(partnerName, window.currentUserType);
    }, 100);
}
window.startChat = startChat;

function searchStudent() {
    const id = document.getElementById('searchStudentId').value.trim();
    const container = document.getElementById('studentSearchResult');
    
    if (!id) {
        container.innerHTML = '<p class="text-red-500 mt-2 bg-red-50 p-3 rounded-lg border border-red-100"><i class="fas fa-exclamation-circle mr-2"></i>Please enter an ID</p>';
        return;
    }
    
    const s = window.DB.students.find(st => st.universityID === id);
    if (!s) {
        container.innerHTML = '<div class="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 mt-4"><i class="fas fa-search text-slate-300 text-3xl mb-2"></i><p class="text-slate-500">Student not found.</p></div>';
        return;
    }
    
    let totalStars = 0;
    let count = 0;
    let commentsHtml = '';
    
    for (const [course, evals] of Object.entries(s.evaluations || {})) {
        evals.forEach(e => {
            totalStars += e.stars;
            count++;
            const starsDisplay = '<i class="fas fa-star text-yellow-400"></i>'.repeat(e.stars) + '<i class="far fa-star text-slate-300"></i>'.repeat(5 - e.stars);
            commentsHtml += `
                <div class="bg-white border border-slate-100 p-4 rounded-xl mb-3 shadow-sm hover-card transition-all-300">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                ${e.teacherName[0]}
                            </div>
                            <span class="font-bold text-slate-800 text-sm">${e.teacherName} <span class="font-normal text-xs text-slate-500">(${course})</span></span>
                        </div>
                        <div class="text-xs">${starsDisplay}</div>
                    </div>
                    <p class="text-slate-600 text-sm italic pl-10 border-l-2 border-slate-200">"${e.comment}"</p>
                </div>
            `;
        });
    }
    
    const average = count > 0 ? (totalStars / count).toFixed(1) : 'N/A';
    
    container.innerHTML = `
        <div class="mt-8 border border-slate-200 p-8 rounded-2xl bg-white shadow-sm fade-in">
            <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
                        ${s.name[0]}
                    </div>
                    <div>
                        <h3 class="font-bold text-2xl text-slate-800">${s.name}</h3>
                        <p class="text-sm text-slate-500 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">ID: ${s.universityID} | Batch: ${s.batchNo}</p>
                    </div>
                </div>
                <div class="text-center p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                    <span class="block text-3xl font-bold text-yellow-500">${average}</span>
                    <span class="text-xs font-bold text-yellow-700 uppercase tracking-wide">Avg Rating</span>
                </div>
            </div>
            
            <div class="mb-6">
                 <button onclick="startChat('${s.name}')" class="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
                    <i class="fas fa-comment-dots"></i> Send Message
                 </button>
            </div>

            <div class="grid grid-cols-2 gap-6 text-sm mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div><p class="text-slate-400 text-xs uppercase font-bold mb-1">Contact</p><p class="font-medium text-slate-700">${s.studentNo}</p></div>
                <div><p class="text-slate-400 text-xs uppercase font-bold mb-1">Problems Solved</p><p class="font-medium text-slate-700">${s.problemsSolved}</p></div>
                <div><p class="text-slate-400 text-xs uppercase font-bold mb-1">CGPA History</p><p class="font-medium text-slate-700">${s.cgpas?.join(', ') || 'N/A'}</p></div>
                <div><p class="text-slate-400 text-xs uppercase font-bold mb-1">Skills</p><div class="flex flex-wrap gap-1 mt-1">${s.skills?.map(sk => `<span class="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-600">${sk}</span>`).join('') || 'None'}</div></div>
            </div>

            <div class="border-t border-slate-100 pt-6">
                <h4 class="font-bold mb-4 text-slate-800 flex items-center gap-2"><i class="fas fa-history text-indigo-500"></i> Evaluation History</h4>
                <div class="max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    ${commentsHtml || '<div class="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">No evaluations submitted yet.</div>'}
                </div>
            </div>
        </div>
    `;
}
window.searchStudent = searchStudent;

function searchPeer() {
    const id = document.getElementById('searchPeerId').value.trim();
    const container = document.getElementById('peerSearchResult');
    
    if (!id) {
        container.innerHTML = '<p class="text-red-500 mt-2 bg-red-50 p-3 rounded-lg border border-red-100"><i class="fas fa-exclamation-circle mr-2"></i>Please enter an ID</p>';
        return;
    }
    
    const s = window.DB.students.find(st => st.universityID === id);
    if (!s) {
        container.innerHTML = '<div class="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 mt-4"><i class="fas fa-search text-slate-300 text-3xl mb-2"></i><p class="text-slate-500">Student not found.</p></div>';
        return;
    }
    
    let totalStars = 0;
    let count = 0;
    for (const evals of Object.values(s.evaluations || {})) {
        evals.forEach(e => {
            totalStars += e.stars;
            count++;
        });
    }
    const average = count > 0 ? (totalStars / count).toFixed(1) : 'N/A';
    
    container.innerHTML = `
        <div class="mt-8 border border-slate-200 p-8 rounded-2xl bg-white shadow-sm fade-in relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div class="flex justify-between items-start mb-6 relative z-10">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-100">
                        ${s.name[0]}
                    </div>
                    <div>
                        <h3 class="font-bold text-2xl text-slate-800">${s.name}</h3>
                        <p class="text-sm text-slate-500 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">ID: ${s.universityID} | Batch: ${s.batchNo}</p>
                    </div>
                </div>
                <div class="text-center p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                    <span class="block text-3xl font-bold text-yellow-500">${average}</span>
                    <span class="text-xs font-bold text-yellow-700 uppercase tracking-wide">Avg Rating</span>
                </div>
            </div>
            <div class="mb-6 relative z-10">
                 <button onclick="startChat('${s.name}')" class="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
                    <i class="fas fa-comment-dots"></i> Message Peer
                 </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm relative z-10">
                 <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p class="text-slate-400 text-xs uppercase font-bold mb-1">Skills</p>
                    <div class="flex flex-wrap gap-1">${s.skills?.map(sk => `<span class="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-600">${sk}</span>`).join('') || 'None'}</div>
                 </div>
                 <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p class="text-slate-400 text-xs uppercase font-bold mb-1">Activity</p>
                    <p class="font-medium text-slate-700">${s.problemsSolved} Problems Solved</p>
                 </div>
            </div>
        </div>
    `;
}
window.searchPeer = searchPeer;

function searchTeacher() {
    const nameQuery = document.getElementById('searchTeacherName').value.trim().toLowerCase();
    const container = document.getElementById('teacherSearchResult');
    
    if (!nameQuery) {
        container.innerHTML = '<p class="text-red-500 mt-2 bg-red-50 p-3 rounded-lg border border-red-100"><i class="fas fa-exclamation-circle mr-2"></i>Please enter a Name</p>';
        return;
    }
    
    const results = window.DB.teachers.filter(t => t.name.toLowerCase().includes(nameQuery));
    if (results.length === 0) {
        container.innerHTML = '<div class="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 mt-4"><i class="fas fa-search text-slate-300 text-3xl mb-2"></i><p class="text-slate-500">No teacher found.</p></div>';
        return;
    }
    
    let html = '<div class="space-y-4 mt-6">';
    results.forEach(t => {
        html += `
            <div class="border border-slate-200 p-6 rounded-2xl bg-white shadow-sm hover-card transition-all-300 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        ${t.initials || t.name[0]}
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800">${t.name}</h3>
                        <div class="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                            <span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">${t.courseCode}</span>
                            <span>${t.subject}</span>
                        </div>
                        <div class="text-xs text-slate-400 mt-1"><i class="fas fa-clock mr-1"></i> ${t.availability}</div>
                    </div>
                </div>
                <button onclick="startChat('${t.name}')" class="bg-white border border-indigo-200 text-indigo-600 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2">
                    <i class="fas fa-comment-alt"></i> Message
                </button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}
window.searchTeacher = searchTeacher;

function submitEvaluation() {
    const id = document.getElementById('evalId').value.trim();
    const course = document.getElementById('evalCourse').value.trim();
    const stars = parseInt(document.getElementById('evalStars').value);
    const comment = document.getElementById('evalComment').value.trim();
    
    if (!id || !course || !comment) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const student = window.DB.students.find(s => s.universityID === id);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }
    
    const currentEvals = student.evaluations || {};
    if (!currentEvals[course]) currentEvals[course] = [];
    currentEvals[course].push({
        stars,
        comment,
        teacherName: window.currentUser.name
    });
    
    window.fbUpdate('students', student._docId, { evaluations: currentEvals }).then(() => {
        showToast('Evaluation Submitted Successfully');
        document.getElementById('evalId').value = '';
        document.getElementById('evalComment').value = '';
    });
}
window.submitEvaluation = submitEvaluation;

function addToExtraCare() {
    const id = document.getElementById('extraCareId').value.trim();
    
    if (!id) {
        showToast('Please enter a student ID', 'error');
        return;
    }
    
    const student = window.DB.students.find(s => s.universityID === id);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }
    
    if (window.DB.extracare.find(e => e.studentId === id)) {
        showToast('Student is already in the list', 'warning');
        return;
    }
    
    window.fbAdd('extracare', { studentId: id }).then(() => {
        showToast('Added to Extra Care List');
        document.getElementById('extraCareId').value = '';
    });
}
window.addToExtraCare = addToExtraCare;

function renderExtraCareList() {
    const container = document.getElementById('extraCareList');
    container.innerHTML = '';
    
    if (window.DB.extracare.length === 0) {
        container.innerHTML = '<div class="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">List is currently empty</div>';
        return;
    }
    
    window.DB.extracare.forEach(item => {
        const s = window.DB.students.find(st => st.universityID === item.studentId);
        if (!s) return;
        
        container.innerHTML += `
            <div class="bg-white border border-pink-100 p-4 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-all-300 group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                        <i class="fas fa-user-heart"></i>
                    </div>
                    <div>
                        <p class="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">${s.name}</p>
                        <p class="text-xs text-slate-500">ID: ${s.universityID} <span class="mx-1">•</span> Batch: ${s.batchNo}</p>
                    </div>
                </div>
                <div class="text-right">
                     <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">${s.problemsSolved} Solved</span>
                </div>
            </div>
        `;
    });
}

function renderLeaderboard(type) {
    const container = document.getElementById('leaderboardContent');
    let html = `
        <table class="w-full text-left text-sm border-separate border-spacing-y-2">
            <thead>
                <tr class="text-slate-400 uppercase text-xs tracking-wider">
                    <th class="p-3 font-semibold">Rank</th>
                    <th class="p-3 font-semibold">User</th>
                    <th class="p-3 font-semibold">Details</th>
                    <th class="p-3 font-semibold text-right">Solved</th>
                </tr>
            </thead>
            <tbody>`;
    
    let list = [];
    if (type === 'student') {
        list = [...window.DB.students].sort((a, b) => b.problemsSolved - a.problemsSolved);
        list.forEach((s, i) => {
            const rankStyle = i === 0 ? 'text-yellow-500 text-xl' : i === 1 ? 'text-slate-400 text-lg' : i === 2 ? 'text-amber-600 text-lg' : 'text-slate-500';
            const icon = i < 3 ? '<i class="fas fa-crown"></i>' : `#${i + 1}`;
            html += `
                <tr class="bg-slate-50 hover:bg-white hover:shadow-md transition-all-300 group">
                    <td class="p-4 rounded-l-xl font-bold ${rankStyle} w-16 text-center">${icon}</td>
                    <td class="p-4 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">${s.name}</td>
                    <td class="p-4 text-slate-500">Batch: ${s.batchNo}</td>
                    <td class="p-4 rounded-r-xl font-bold text-indigo-600 text-right">${s.problemsSolved}</td>
                </tr>`;
        });
    } else {
        list = [...window.DB.teachers].sort((a, b) => b.problemsSolved - a.problemsSolved);
        list.forEach((t, i) => {
            const rankStyle = i === 0 ? 'text-yellow-500 text-xl' : i === 1 ? 'text-slate-400 text-lg' : i === 2 ? 'text-amber-600 text-lg' : 'text-slate-500';
            const icon = i < 3 ? '<i class="fas fa-crown"></i>' : `#${i + 1}`;
            html += `
                <tr class="bg-slate-50 hover:bg-white hover:shadow-md transition-all-300 group">
                    <td class="p-4 rounded-l-xl font-bold ${rankStyle} w-16 text-center">${icon}</td>
                    <td class="p-4 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">${t.name}</td>
                    <td class="p-4 text-slate-500">${t.courseCode}</td>
                    <td class="p-4 rounded-r-xl font-bold text-indigo-600 text-right">${t.problemsSolved}</td>
                </tr>`;
        });
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}
window.renderLeaderboard = renderLeaderboard;

function submitProblem() {
    const course = document.getElementById('probCourse').value.trim();
    const desc = document.getElementById('probDesc').value.trim();
    
    if (!course || !desc) {
        showToast('All fields required', 'error');
        return;
    }
    
    window.fbAdd('problems', {
        submitterName: window.currentUser.name,
        course: course,
        description: desc,
        solved: false,
        solution: "",
        proposedSolution: null,
        solverName: null,
        timestamp: Date.now(),
        id: Date.now()
    }).then(() => {
        const newCount = (window.currentUser.submittedProblems || 0) + 1;
        window.fbUpdate('students', window.currentUser._docId, { submittedProblems: newCount });
        
        showToast('Problem Posted Successfully');
        switchTab('s-problems');
        document.getElementById('probCourse').value = '';
        document.getElementById('probDesc').value = '';
    });
}
window.submitProblem = submitProblem;

function renderBatchLeaderboard() {
    const container = document.getElementById('studentBatchLeaderboard');
    const batch = window.currentUser.batchNo;
    const list = window.DB.students.filter(s => s.batchNo === batch).sort((a, b) => b.problemsSolved - a.problemsSolved);
    
    let html = `
        <div class="flex items-center justify-between mb-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <span class="text-sm font-bold text-emerald-800">Batch: ${batch}</span>
            <span class="text-xs text-emerald-600 bg-white px-2 py-1 rounded border border-emerald-100">${list.length} Students</span>
        </div>
        <table class="w-full text-left text-sm border-separate border-spacing-y-2">
            <thead>
                <tr class="text-slate-400 uppercase text-xs tracking-wider">
                    <th class="p-3 font-semibold">Rank</th>
                    <th class="p-3 font-semibold">Name</th>
                    <th class="p-3 font-semibold text-right">Solved</th>
                </tr>
            </thead>
            <tbody>`;
    
    list.forEach((s, i) => {
        const isMe = s.name === window.currentUser.name;
        const rowClass = isMe ? 'bg-emerald-50 border border-emerald-200' : 'bg-white hover:bg-slate-50';
        const nameClass = isMe ? 'text-emerald-700' : 'text-slate-700';
        
        html += `
            <tr class="${rowClass} shadow-sm rounded-lg transition-all-300">
                <td class="p-4 rounded-l-lg font-bold text-slate-500 w-16 text-center">#${i + 1}</td>
                <td class="p-4 font-bold ${nameClass}">${s.name} ${isMe ? '<span class="ml-2 text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">YOU</span>' : ''}</td>
                <td class="p-4 rounded-r-lg font-bold text-slate-700 text-right">${s.problemsSolved}</td>
            </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderProblems(viewerType) {
    const container = viewerType === 'teacher' ? document.getElementById('teacherProblemList') : document.getElementById('studentProblemList');
    container.innerHTML = '';
    
    if (window.DB.problems.length === 0) {
        container.innerHTML = '<div class="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300"><i class="fas fa-inbox text-4xl text-slate-300 mb-4"></i><p class="text-slate-500">No problems have been submitted yet.</p></div>';
        return;
    }
    
    [...window.DB.problems].sort((a, b) => b.timestamp - a.timestamp).forEach(p => {
        let statusBadge = '';
        let borderColor = 'border-l-gray-300';
        
        if (p.solved) {
            statusBadge = `<span class="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><i class="fas fa-check-circle"></i> Solved by ${p.solverName}</span>`;
            borderColor = 'border-l-emerald-500';
        } else if (p.proposedSolution) {
            statusBadge = `<span class="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><i class="fas fa-clock"></i> Solution Pending</span>`;
            borderColor = 'border-l-amber-500';
        } else {
            statusBadge = `<span class="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><i class="fas fa-dot-circle"></i> Open</span>`;
            borderColor = 'border-l-slate-300';
        }
        
        const isMyProblem = p.submitterName === window.currentUser.name;
        
        let actions = '';
        if (isMyProblem && p.proposedSolution && !p.solved) {
            actions = `
                <div class="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">${p.solverName ? p.solverName[0] : '?'}</div>
                        <p class="text-sm font-bold text-blue-800">Solution proposed by ${p.solverName}</p>
                    </div>
                    <p class="text-sm text-slate-700 italic my-3 bg-white p-3 rounded-lg border border-blue-50">"${p.proposedSolution}"</p>
                    <div class="flex gap-3">
                        <button onclick="confirmSolution('${p._docId}', '${p.solverName}')" class="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm">
                            <i class="fas fa-check mr-1"></i> Accept
                        </button>
                        <button onclick="rejectSolution('${p._docId}')" class="bg-white border border-slate-300 text-slate-600 text-xs px-4 py-2 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                            <i class="fas fa-times mr-1"></i> Reject
                        </button>
                    </div>
                </div>
            `;
        } else if (!isMyProblem && !p.solved && !p.proposedSolution) {
            actions = `
                <div class="mt-4 pt-4 border-t border-slate-100">
                    <textarea id="solution-${p._docId}" rows="2" placeholder="Propose your solution..." class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"></textarea>
                    <button onclick="proposeSolution('${p._docId}')" class="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                        <i class="fas fa-lightbulb mr-1"></i> Submit Solution
                    </button>
                </div>
            `;
        }
        
        if (p.solved && p.solution) {
            actions = `
                <div class="mt-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <p class="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1"><i class="fas fa-check-circle"></i> Accepted Solution</p>
                    <p class="text-sm text-slate-700 italic bg-white p-3 rounded-lg border border-emerald-50">"${p.solution}"</p>
                </div>
            `;
        }
        
        container.innerHTML += `
            <div class="bg-white border-l-4 ${borderColor} p-6 rounded-xl shadow-sm hover:shadow-md transition-all-300">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            ${p.submitterName[0]}
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">${p.submitterName}</p>
                            <p class="text-xs text-slate-500"><i class="fas fa-book mr-1"></i>${p.course}</p>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                <p class="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">${p.description}</p>
                ${actions}
            </div>
        `;
    });
}

function proposeSolution(docId) {
    const textarea = document.getElementById(`solution-${docId}`);
    const solution = textarea.value.trim();
    
    if (!solution) {
        showToast('Please enter a solution', 'error');
        return;
    }
    
    window.fbUpdate('problems', docId, {
        proposedSolution: solution,
        solverName: window.currentUser.name
    }).then(() => {
        showToast('Solution proposed successfully');
    });
}
window.proposeSolution = proposeSolution;

function confirmSolution(docId, solverName) {
    window.fbUpdate('problems', docId, {
        solved: true,
        solution: window.DB.problems.find(p => p._docId === docId).proposedSolution
    }).then(() => {
        const solver = window.DB.students.find(s => s.name === solverName) || window.DB.teachers.find(t => t.name === solverName);
        if (solver) {
            const colName = window.DB.students.find(s => s.name === solverName) ? 'students' : 'teachers';
            window.fbUpdate(colName, solver._docId, {
                problemsSolved: (solver.problemsSolved || 0) + 1
            });
        }
        showToast('Solution accepted');
    });
}
window.confirmSolution = confirmSolution;

function rejectSolution(docId) {
    window.fbUpdate('problems', docId, {
        proposedSolution: null,
        solverName: null
    }).then(() => {
        showToast('Solution rejected');
    });
}
window.rejectSolution = rejectSolution;

console.log("App.js loaded successfully");
