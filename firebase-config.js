import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    onSnapshot, 
    query, 
    orderBy,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWY7_PF2ebIKX7jO9YGxzFeUu3MrvOw1Q",
    authDomain: "student-evaluation-5859f.firebaseapp.com",
    projectId: "student-evaluation-5859f",
    storageBucket: "student-evaluation-5859f.firebasestorage.app",
    messagingSenderId: "1070612693344",
    appId: "1:1070612693344:web:7fae24fea3b703cafede05"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not available in this browser');
    }
});

window.DB = {
    teachers: [],
    students: [],
    problems: [],
    extracare: [],
    messages: []
};

window.connectionStatus = 'connecting';

function updateConnectionUI(status) {
    window.connectionStatus = status;
    let statusEl = document.getElementById('connectionStatus');
    
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'connectionStatus';
        statusEl.className = 'connection-status';
        document.body.appendChild(statusEl);
    }
    
    if (status === 'online') {
        statusEl.className = 'connection-status online';
        statusEl.innerHTML = '<i class="fas fa-wifi"></i> Connected';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 2000);
    } else if (status === 'offline') {
        statusEl.className = 'connection-status offline';
        statusEl.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline - Changes will sync when reconnected';
        statusEl.style.display = 'flex';
    } else if (status === 'reconnecting') {
        statusEl.className = 'connection-status reconnecting';
        statusEl.innerHTML = '<i class="fas fa-sync fa-spin"></i> Reconnecting...';
        statusEl.style.display = 'flex';
    }
}

function initListeners() {
    const collections = ['teachers', 'students', 'problems', 'extracare', 'messages'];
    let loadedCount = 0;
    
    collections.forEach(colName => {
        const colRef = collection(db, colName);
        
        onSnapshot(colRef, (snapshot) => {
            window.DB[colName] = snapshot.docs.map(docSnap => ({ 
                ...docSnap.data(), 
                _docId: docSnap.id 
            }));
            
            loadedCount++;
            
            const overlay = document.getElementById('loadingOverlay');
            if (overlay && loadedCount >= collections.length) {
                overlay.classList.add('hidden');
            }
            
            updateConnectionUI('online');
            
            if (window.currentUser) {
                window.refreshCurrentTab();
                
                if (window.currentUserType === 'student') {
                    const updated = window.DB.students.find(s => s._docId === window.currentUser._docId);
                    if (updated) window.currentUser = updated;
                } else if (window.currentUserType === 'teacher') {
                    const updated = window.DB.teachers.find(t => t._docId === window.currentUser._docId);
                    if (updated) window.currentUser = updated;
                }
            }
        }, (error) => {
            console.error("Firebase Connection Error:", error);
            
            if (error.code === 'unavailable') {
                updateConnectionUI('offline');
            } else {
                updateConnectionUI('reconnecting');
            }
            
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.innerHTML = `
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                        </div>
                        <p class="text-red-600 font-medium mb-2">Connection Error</p>
                        <p class="text-slate-500 text-sm">Please check your internet connection</p>
                        <button onclick="location.reload()" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                            Retry Connection
                        </button>
                    </div>
                `;
            }
        });
    });
}

initListeners();

window.fbAdd = async (colName, data) => {
    try {
        const docRef = await addDoc(collection(db, colName), data);
        console.log("Document added with ID:", docRef.id);
        return true;
    } catch (e) {
        console.error("Write Error:", e);
        window.showToast("Error saving data: " + e.message, 'error');
        return false;
    }
};

window.fbUpdate = async (colName, docId, data) => {
    try {
        await updateDoc(doc(db, colName, docId), data);
        console.log("Document updated:", docId);
        return true;
    } catch (e) {
        console.error("Update Error:", e);
        window.showToast("Error updating: " + e.message, 'error');
        return false;
    }
};

window.isOnline = () => window.connectionStatus === 'online';

console.log("Firebase v12.6.0 initialized successfully");
console.log("Project:", firebaseConfig.projectId);
