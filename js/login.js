import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

/* =========================================================
   FIREBASE
========================================================= */

const auth = getAuth(app);
const db = getFirestore(app);

/* =========================================================
   DOM ELEMENTS
========================================================= */

const loginForm = document.getElementById('loginForm');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');

const togglePassword = document.getElementById('togglePassword');

const rememberMe = document.getElementById('rememberMe');

const formMessage = document.getElementById('formMessage');

/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message, type = 'error') {
  if (!formMessage) return;

  formMessage.textContent = message;

  formMessage.className = `form-message ${type}`;
}

function clearMessage() {
  if (!formMessage) return;

  formMessage.textContent = '';

  formMessage.className = 'form-message';
}

/* =========================================================
   LOADING STATE
========================================================= */

function setLoading(isLoading) {
  if (!loginBtn) return;

  loginBtn.disabled = isLoading;

  if (isLoading) {
    loginBtn.classList.add('loading');

    if (loginBtnText) {
      loginBtnText.textContent = 'Signing in...';
    }
  } else {
    loginBtn.classList.remove('loading');

    if (loginBtnText) {
      loginBtnText.textContent = 'Sign in';
    }
  }
}

/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    passwordInput.type = isPassword ? 'text' : 'password';

    togglePassword.textContent = isPassword ? 'Hide' : 'Show';

    togglePassword.setAttribute(
      'aria-label',
      isPassword ? 'Hide password' : 'Show password',
    );
  });
}

/* =========================================================
   CLEAR ERROR WHEN USER TYPES
========================================================= */

if (emailInput) {
  emailInput.addEventListener('input', clearMessage);
}

if (passwordInput) {
  passwordInput.addEventListener('input', clearMessage);
}

/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  clearMessage();

  /* ---------------------------------------------
           GET VALUES
        --------------------------------------------- */

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

  if (!email) {
    showMessage('Please enter your email address.');

    emailInput.focus();

    return;
  }

  if (!emailInput.checkValidity()) {
    showMessage('Please enter a valid email address.');

    emailInput.focus();

    return;
  }

  if (!password) {
    showMessage('Please enter your password.');

    passwordInput.focus();

    return;
  }

  setLoading(true);

  try {
    /* -----------------------------------------
               SET LOGIN PERSISTENCE
            ----------------------------------------- */

    await setPersistence(
      auth,
      rememberMe && rememberMe.checked
        ? browserLocalPersistence
        : browserSessionPersistence,
    );

    /* -----------------------------------------
               FIREBASE AUTHENTICATION
            ----------------------------------------- */

    const credential = await signInWithEmailAndPassword(auth, email, password);

    const user = credential.user;

    /* -----------------------------------------
               GET USER ROLE
            ----------------------------------------- */

    const userRef = doc(db, 'users', user.uid);

    const userSnapshot = await getDoc(userRef);

    /* -----------------------------------------
               USER PROFILE DOES NOT EXIST
            ----------------------------------------- */

    if (!userSnapshot.exists()) {
      await signOut(auth);

      showMessage(
        'Your account is authenticated, but it has not been assigned a portal role. Please contact the administrator.',
      );

      setLoading(false);

      return;
    }

    const userData = userSnapshot.data();

    /* -----------------------------------------
               ADMIN
            ----------------------------------------- */

    if (userData.role === 'admin') {
      showMessage(
        'Login successful. Opening administrator portal...',
        'success',
      );

      setTimeout(() => {
        window.location.replace('admin-dashboard.html');
      }, 500);

      return;
    }

    /* -----------------------------------------
               FACULTY
            ----------------------------------------- */

    if (userData.role === 'faculty') {
      showMessage('Login successful. Opening faculty portal...', 'success');

      setTimeout(() => {
        window.location.replace('faculty-dashboard.html');
      }, 500);

      return;
    }

    /* -----------------------------------------
               UNKNOWN ROLE
            ----------------------------------------- */

    await signOut(auth);

    showMessage(
      'Your account does not have permission to access this portal. Please contact the administrator.',
    );

    setLoading(false);
  } catch (error) {
    console.error('Login error:', error);

    /* -----------------------------------------
               FIREBASE ERROR MESSAGES
            ----------------------------------------- */

    let message = 'Unable to sign in. Please try again.';

    switch (error.code) {
      case 'auth/invalid-credential':

      case 'auth/invalid-login-credentials':
        message = 'Incorrect email or password.';

        break;

      case 'auth/user-not-found':
        message = 'No account was found with this email address.';

        break;

      case 'auth/wrong-password':
        message = 'Incorrect email or password.';

        break;

      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';

        break;

      case 'auth/too-many-requests':
        message = 'Too many unsuccessful attempts. Please try again later.';

        break;

      case 'auth/user-disabled':
        message =
          'This account has been disabled. Please contact the administrator.';

        break;

      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';

        break;

      case 'permission-denied':
        message = 'You do not have permission to access your portal profile.';

        break;

      default:
        console.error('Firebase error code:', error.code);

        message = 'Something went wrong while signing in. Please try again.';
    }

    showMessage(message);

    setLoading(false);
  }
});
