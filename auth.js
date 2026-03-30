// auth.js - Hybrid Authentication for LogLegends
// Google Sign-In: Uses Google Identity Services (GIS) - the OLD working method
// Email/Password: Uses Firebase Authentication

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration (for Email/Password auth and Firestore)
const firebaseConfig = {
    apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
    authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
    projectId: "lead-finder-pro-27bf2",
    storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
    messagingSenderId: "197510050244",
    appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491"
};

// Google Client ID for GIS (the old working method)
const GOOGLE_CLIENT_ID = "807592232939-pr256ntaj81m62pggratakrogl43hci8.apps.googleusercontent.com";

// Initialize Firebase (for email/password only)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Track current auth mode
let isSignUpMode = false;

// ============================================
// UI MODE SWITCHING
// ============================================

window.showSignInMode = function() {
    isSignUpMode = false;
    
    document.getElementById('auth-mode-signin').classList.add('active');
    document.getElementById('auth-mode-signup').classList.remove('active');
    document.getElementById('auth-name-group').style.display = 'none';
    document.getElementById('forgot-password-link').style.display = 'block';
    document.getElementById('auth-submit-btn').textContent = 'Sign In';
    document.getElementById('auth-submit-btn').onclick = window.signInWithEmail;
    
    hideAuthMessages();
};

window.showSignUpMode = function() {
    isSignUpMode = true;
    
    document.getElementById('auth-mode-signin').classList.remove('active');
    document.getElementById('auth-mode-signup').classList.add('active');
    document.getElementById('auth-name-group').style.display = 'block';
    document.getElementById('forgot-password-link').style.display = 'none';
    document.getElementById('auth-submit-btn').textContent = 'Create Account';
    document.getElementById('auth-submit-btn').onclick = window.signUpWithEmail;
    
    hideAuthMessages();
};

// ============================================
// MESSAGE HELPERS
// ============================================

function showError(message) {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
}

function showSuccess(message) {
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    successEl.textContent = message;
    successEl.style.display = 'block';
    errorEl.style.display = 'none';
}

function hideAuthMessages() {
    document.getElementById('auth-error').style.display = 'none';
    document.getElementById('auth-success').style.display = 'none';
}

function setButtonLoading(loading) {
    const btn = document.getElementById('auth-submit-btn');
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Please wait...';
    } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || (isSignUpMode ? 'Create Account' : 'Sign In');
    }
}

// ============================================
// GOOGLE SIGN-IN (Old GIS Method - WORKS!)
// ============================================

window.signInWithGoogle = function() {
    hideAuthMessages();
    
    if (typeof google === 'undefined' || !google.accounts) {
        showError('Google Sign-In is loading. Please try again in a moment.');
        return;
    }
    
    google.accounts.id.prompt();
};

// Handle Google credential response (called by GIS)
window.handleGoogleCredentialResponse = async function(response) {
    try {
        if (!response || !response.credential) {
            showError('Google Sign-In failed. Please try again.');
            return;
        }
        
        // Decode the JWT token
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        // Store user info in localStorage
        localStorage.setItem('log_uid', payload.sub);
        localStorage.setItem('log_name', payload.name || 'User');
        localStorage.setItem('log_pic', payload.picture || '');
        localStorage.setItem('log_email', payload.email || '');
        
        console.log('Google login successful:', payload.name);
        
        // Create/update Firestore document
        await createUserDocument({
            uid: payload.sub,
            email: payload.email,
            displayName: payload.name,
            photoURL: payload.picture
        });
        
        // Show the app
        handleSuccessfulLogin({
            uid: payload.sub,
            displayName: payload.name,
            email: payload.email,
            photoURL: payload.picture
        });
        
    } catch (error) {
        console.error('Google login error:', error);
        showError('Login failed. Please try again.');
    }
};

// Initialize Google Identity Services
function initializeGoogleSignIn() {
    const checkGoogle = setInterval(function() {
        if (typeof google !== 'undefined' && google.accounts) {
            clearInterval(checkGoogle);
            
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            
            console.log('Google Identity Services initialized');
        }
    }, 100);
    
    setTimeout(() => clearInterval(checkGoogle), 10000);
}

// ============================================
// EMAIL/PASSWORD AUTHENTICATION (Firebase)
// ============================================

window.signInWithEmail = async function() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    setButtonLoading(true);
    hideAuthMessages();
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Email sign-in successful:', userCredential.user.email);
        
        localStorage.setItem('log_uid', userCredential.user.uid);
        localStorage.setItem('log_name', userCredential.user.displayName || 'User');
        localStorage.setItem('log_pic', userCredential.user.photoURL || '');
        localStorage.setItem('log_email', userCredential.user.email || '');
        
        handleSuccessfulLogin(userCredential.user);
    } catch (error) {
        console.error('Sign-in error:', error);
        handleAuthError(error);
    } finally {
        setButtonLoading(false);
    }
};

window.signUpWithEmail = async function() {
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    if (!name) { showError('Please enter your name.'); return; }
    if (!email) { showError('Please enter your email address.'); return; }
    if (!password) { showError('Please enter a password.'); return; }
    if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
    
    setButtonLoading(true);
    hideAuthMessages();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await createUserDocument(userCredential.user, name);
        
        localStorage.setItem('log_uid', userCredential.user.uid);
        localStorage.setItem('log_name', name);
        localStorage.setItem('log_pic', '');
        localStorage.setItem('log_email', email);
        
        console.log('Account created:', email);
        handleSuccessfulLogin({ ...userCredential.user, displayName: name });
    } catch (error) {
        console.error('Sign-up error:', error);
        handleAuthError(error);
    } finally {
        setButtonLoading(false);
    }
};

// ============================================
// FORGOT PASSWORD
// ============================================

window.forgotPassword = async function() {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) { showError('Please enter your email address first.'); return; }
    
    hideAuthMessages();
    
    try {
        await sendPasswordResetEmail(auth, email);
        showSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            showError('No account found with this email address.');
        } else {
            handleAuthError(error);
        }
    }
};

// ============================================
// LOGOUT
// ============================================

window.logoutUser = async function() {
    try {
        await signOut(auth);
        
        localStorage.removeItem('log_uid');
        localStorage.removeItem('log_name');
        localStorage.removeItem('log_pic');
        localStorage.removeItem('log_email');
        
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        console.log('User logged out');
        document.body.classList.remove('logged-in');
        document.body.classList.add('not-logged-in');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// ============================================
// HELPERS
// ============================================

async function createUserDocument(user, displayName) {
    try {
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: displayName || user.displayName || 'User',
            createdAt: new Date().toISOString(),
            totalHours: 0,
            nightHours: 0,
            trips: []
        }, { merge: true });
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}

function handleAuthError(error) {
    const msgs = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-not-found': 'No account found. Try signing up.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/weak-password': 'Password must be at least 6 characters.'
    };
    showError(msgs[error.code] || 'An error occurred. Please try again.');
}

function handleSuccessfulLogin(user) {
    console.log('Login successful:', user.displayName || user.email);
    
    document.body.classList.remove('not-logged-in');
    document.body.classList.add('logged-in');
    
    const syncArea = document.getElementById('sync-status-area');
    if (syncArea) syncArea.style.display = 'flex';
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const pic = user.photoURL;
        const name = user.displayName || 'User';
        
        if (pic) {
            userInfo.innerHTML = `<img src="${pic}" style="width:32px;height:32px;border-radius:50%;margin-right:10px;"><span>${name}</span>`;
        } else {
            userInfo.innerHTML = `<span style="width:32px;height:32px;border-radius:50%;background:#667eea;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;font-weight:bold;color:white;">${name.charAt(0).toUpperCase()}</span><span>${name}</span>`;
        }
    }
    
    if (typeof window.pullFromCloud === 'function') window.pullFromCloud();
    if (typeof window.loadDashboard === 'function') window.loadDashboard();
}

function checkExistingLogin() {
    const uid = localStorage.getItem('log_uid');
    const name = localStorage.getItem('log_name');
    const email = localStorage.getItem('log_email');
    const pic = localStorage.getItem('log_pic');
    
    if (uid && email) {
        console.log('Found existing login:', email);
        handleSuccessfulLogin({ uid, displayName: name, email, photoURL: pic });
        return true;
    }
    return false;
}

// ============================================
// INITIALIZE
// ============================================

if (!checkExistingLogin()) {
    document.body.classList.add('not-logged-in');
    document.body.classList.remove('logged-in');
}

initializeGoogleSignIn();

console.log('Auth.js loaded - Hybrid (GIS + Firebase Email)');
