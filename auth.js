// auth.js - Firebase Authentication for LogLegends
// Supports: Email/Password + Google Sign-In

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
    authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
    projectId: "lead-finder-pro-27bf2",
    storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
    messagingSenderId: "197510050244",
    appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Track current auth mode
let isSignUpMode = false;

// ============================================
// UI MODE SWITCHING
// ============================================

window.showSignInMode = function() {
    isSignUpMode = false;
    
    // Update toggle buttons
    document.getElementById('auth-mode-signin').classList.add('active');
    document.getElementById('auth-mode-signup').classList.remove('active');
    
    // Hide name field
    document.getElementById('auth-name-group').style.display = 'none';
    
    // Show forgot password link
    document.getElementById('forgot-password-link').style.display = 'block';
    
    // Update submit button
    document.getElementById('auth-submit-btn').textContent = 'Sign In';
    document.getElementById('auth-submit-btn').onclick = signInWithEmail;
    
    // Clear messages
    hideAuthMessages();
};

window.showSignUpMode = function() {
    isSignUpMode = true;
    
    // Update toggle buttons
    document.getElementById('auth-mode-signin').classList.remove('active');
    document.getElementById('auth-mode-signup').classList.add('active');
    
    // Show name field
    document.getElementById('auth-name-group').style.display = 'block';
    
    // Hide forgot password link
    document.getElementById('forgot-password-link').style.display = 'none';
    
    // Update submit button
    document.getElementById('auth-submit-btn').textContent = 'Create Account';
    document.getElementById('auth-submit-btn').onclick = signUpWithEmail;
    
    // Clear messages
    hideAuthMessages();
};

// ============================================
// MESSAGE DISPLAY HELPERS
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
// EMAIL/PASSWORD AUTHENTICATION
// ============================================

window.signInWithEmail = async function() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    
    // Validation
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    setButtonLoading(true);
    hideAuthMessages();
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Email sign-in successful:', userCredential.user.email);
        // onAuthStateChanged will handle the rest
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
    
    // Validation
    if (!name) {
        showError('Please enter your name.');
        return;
    }
    if (!email) {
        showError('Please enter your email address.');
        return;
    }
    if (!password) {
        showError('Please enter a password.');
        return;
    }
    if (password.length < 6) {
        showError('Password must be at least 6 characters.');
        return;
    }
    
    setButtonLoading(true);
    hideAuthMessages();
    
    try {
        // Create account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });
        
        // Create Firestore document for user
        await createUserDocument(userCredential.user, name);
        
        console.log('Account created successfully:', email);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Sign-up error:', error);
        handleAuthError(error);
    } finally {
        setButtonLoading(false);
    }
};

// ============================================
// GOOGLE SIGN-IN
// ============================================

window.signInWithGoogle = async function() {
    hideAuthMessages();
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful:', result.user.email);
        
        // Check if this is a new user
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            await createUserDocument(result.user, result.user.displayName);
        }
        
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Google sign-in error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, don't show error
            return;
        }
        if (error.code === 'auth/popup-blocked') {
            showError('Popup was blocked. Please allow popups for this site.');
            return;
        }
        
        handleAuthError(error);
    }
};

// ============================================
// FORGOT PASSWORD
// ============================================

window.forgotPassword = async function() {
    const email = document.getElementById('auth-email').value.trim();
    
    if (!email) {
        showError('Please enter your email address first.');
        return;
    }
    
    hideAuthMessages();
    
    try {
        await sendPasswordResetEmail(auth, email);
        showSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        
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
        
        // Clear localStorage
        localStorage.removeItem('log_uid');
        localStorage.removeItem('log_name');
        localStorage.removeItem('log_pic');
        localStorage.removeItem('log_email');
        
        console.log('User logged out');
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// ============================================
// HELPER FUNCTIONS
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
        
        console.log('User document created/updated in Firestore');
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}

function handleAuthError(error) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email. Try signing up.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.'
    };
    
    const message = errorMessages[error.code] || 'An error occurred. Please try again.';
    showError(message);
}

function handleSuccessfulLogin(user) {
    // Store user info in localStorage (for compatibility with existing app code)
    localStorage.setItem('log_uid', user.uid);
    localStorage.setItem('log_name', user.displayName || 'User');
    localStorage.setItem('log_pic', user.photoURL || '');
    localStorage.setItem('log_email', user.email || '');
    
    console.log('Login successful, user info stored:', user.displayName);
    
    // Hide login screen, show app
    const loginScreen = document.getElementById('login-screen');
    const syncArea = document.getElementById('sync-status-area');
    
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }
    if (syncArea) {
        syncArea.style.display = 'flex';
    }
    
    // Update user info display
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
    
    // Pull data from cloud if available
    if (typeof window.pullFromCloud === 'function') {
        window.pullFromCloud();
    }
    
    // Initialize dashboard
    if (typeof window.loadDashboard === 'function') {
        window.loadDashboard();
    }
}

// ============================================
// AUTH STATE LISTENER
// ============================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log('Auth state: signed in as', user.email);
        handleSuccessfulLogin(user);
    } else {
        // User is signed out
        console.log('Auth state: signed out');
        
        // Show login screen
        const loginScreen = document.getElementById('login-screen');
        const syncArea = document.getElementById('sync-status-area');
        
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        if (syncArea) {
            syncArea.style.display = 'none';
        }
    }
});

// ============================================
// INITIALIZE
// ============================================

console.log('Auth.js loaded - Firebase Authentication ready');
