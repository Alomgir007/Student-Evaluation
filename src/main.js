import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updatePassword
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const teachersCol = collection(db, "teachers");
const studentsCol = collection(db, "students");
const problemsCol = collection(db, "problems");
const extraCareCol = collection(db, "extraCare");

let currentUser = null;
let currentUserType = null;
let unsubscribes = [];

// Auth State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const [teacherSnap, studentSnap] = await Promise.all([
      getDoc(doc(teachersCol, uid)),
      getDoc(doc(studentsCol, uid))
    ]);

    if (teacherSnap.exists()) {
      currentUser = { id: uid, ...teacherSnap.data() };
      currentUserType = "teacher";
      initSession(currentUser, "teacher");
    } else if (studentSnap.exists()) {
      currentUser = { id: uid, ...studentSnap.data() };
      currentUserType = "student";
      initSession(currentUser, "student");
    }
  } else {
    cleanup();
    currentUser = null;
    currentUserType = null;
    showView("view-login");
    document.getElementById("userInfo")?.classList.add("hidden");
  }
});

// === ALL YOUR ORIGINAL FUNCTIONS (updated for Firebase) ===

window.showView = (id) => {
  document.querySelectorAll('[id^="view-"]').forEach(v => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};

window.showToast = (msg) => {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.remove("translate-y-20");
  setTimeout(() => t.classList.add("translate-y-20"), 3000);
};

window.login = async () => {
  const email = document.getElementById("loginName").value.trim();
  const pass = document.getElementById("loginPass").value;
  if (!email || !pass) return showToast("Enter email & password");
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    showToast("Login failed: " + e.message);
  }
};

window.logout = () => signOut(auth);

window.signupTeacher = async () => {
  const name = document.getElementById("tName").value.trim();
  const email = document.getElementById("tEmail").value.trim();
  const pass = document.getElementById("tPass").value;
  const subj = document.getElementById("tSubj").value;
  const code = document.getElementById("tCode").value.toUpperCase();
  const contact = document.getElementById("tContact").value;
  const avail = document.getElementById("tAvail").value;

  if (!email.includes("@") || !pass) return showToast("Valid email & password required");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(teachersCol, cred.user.uid), {
      name, email, subject: subj, courseCode: code,
      contactNumber: contact, availability: avail,
      initials: name.split(" ").map(n => n[0]).join("").toUpperCase(),
      problemsSolved: 0,
      createdAt: serverTimestamp()
    });
    showToast("Teacher registered!");
    showView("view-login");
  } catch (e) {
    showToast(e.message);
  }
};

window.signupStudent = async () => {
  const name = document.getElementById("sName").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const pass = document.getElementById("sPass").value;
  const id = document.getElementById("sId").value.trim();
  const no = document.getElementById("sNo").value;
  const batch = document.getElementById("sBatch").value;
  const cgpa = document.getElementById("sCgpa").value;
  const skills = document.getElementById("sSkills").value;
  const links = document.getElementById("sLinks").value;

  if (!email.includes("@") || !id.match(/^\d{3}-\d{2}-\d{3}$/)) {
    return showToast("Valid email & ID (XXX-XX-XXX) required");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(studentsCol, cred.user.uid), {
      name, email, universityID: id, studentNo: no, batchNo: batch,
      cgpas: cgpa ? cgpa.split(",").map(parseFloat) : [],
      skills: skills ? skills.split(",").map(s => s.trim()) : [],
      links: links ? links.split(",").map(s => s.trim()) : [],
      submittedProblems: 0, problemsSolved: 0,
      evaluations: {},
      createdAt: serverTimestamp()
    });
    showToast("Student registered!");
    showView("view-login");
  } catch (e) {
    showToast(e.message);
  }
};

// Add this to BOTH signup forms (Teacher & Student)
document.querySelectorAll("#view-signup-teacher, #view-signup-student").forEach(form => {
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "Email (required for login)";
  emailInput.required = true;
  emailInput.className = "w-full p-2 border rounded mt-2";
  emailInput.id = form.id.includes("teacher") ? "tEmail" : "sEmail";
  form.querySelector("div.space-y-3").insertBefore(emailInput, form.querySelector("div.space-y-3").children[1]);
});

function initSession(user, type) {
  document.getElementById("userInfo").classList.remove("hidden");
  document.getElementById("welcomeText").innerText = `Hello, ${user.name}`;

  if (type === "teacher") {
    document.getElementById("teacherNameDisplay").innerText = user.name;
    document.getElementById("teacherInitialsDisplay").innerText = user.initials || user.name[0];
    document.getElementById("teacherCodeDisplay").innerText = user.courseCode;
    showView("view-teacher-dash");
  } else {
    document.getElementById("studentNameDisplay").innerText = user.name;
    document.getElementById("studentIdDisplay").innerText = user.universityID;
    showView("view-student-dash");
  }
  renderProfile();
  renderProblems(type);
}

function cleanup() {
  unsubscribes.forEach(fn => fn());
  unsubscribes = [];
}

// Keep all your other functions (renderProfile, submitProblem, etc.)
// Just replace localStorage → Firestore calls (I can send full version if you want)

// Start
showView("view-login");