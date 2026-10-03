// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDWZB55vKzh_ZULDZ2OqDvGrDO-ZpYksrA',
  authDomain: 'cbse-science-portal.firebaseapp.com',
  projectId: 'cbse-science-portal',
  storageBucket: 'cbse-science-portal.firebasestorage.app',
  messagingSenderId: '559943474036',
  appId: '1:559943474036:web:b4b5ec8f624447fa3eaa21',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase connected successfully!');

export { app };
