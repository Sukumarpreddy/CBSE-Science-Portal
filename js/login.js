import {
  getAuth,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import {
  getFirestore,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginMessage.textContent = 'Logging in...';

  try {
    // Login with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;

    console.log('Logged in user:', user.uid);

    // Get user's role from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      loginMessage.textContent = 'Account is not registered in the portal.';

      await auth.signOut();

      return;
    }

    const userData = userSnapshot.data();

    console.log('User role:', userData.role);

    // ==============================
    // ADMIN
    // ==============================

    if (userData.role === 'admin') {
      loginMessage.textContent = 'Admin login successful!';

      setTimeout(function () {
        window.location.href = 'admin-dashboard.html';
      }, 500);

      return;
    }

    // ==============================
    // FACULTY
    // ==============================

    if (userData.role === 'faculty') {
      loginMessage.textContent = 'Faculty login successful!';

      setTimeout(function () {
        window.location.href = 'faculty-dashboard.html';
      }, 500);

      return;
    }

    // ==============================
    // UNKNOWN ROLE
    // ==============================

    loginMessage.textContent =
      'Your account does not have a valid portal role.';

    await auth.signOut();
  } catch (error) {
    console.error('Login error:', error);

    loginMessage.textContent = 'Login failed. Check your email and password.';
  }
});
