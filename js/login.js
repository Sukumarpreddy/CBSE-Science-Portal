import {
  getAuth,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginMessage.textContent = 'Logging in...';

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    console.log('Logged in user:', userCredential.user);

    loginMessage.textContent = 'Login successful!';

    // Temporary destination
    setTimeout(function () {
      window.location.href = 'faculty-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error(error);

    loginMessage.textContent = 'Login failed. Check your email and password.';
  }
});
