import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById('materialForm');
const message = document.getElementById('formMessage');

let currentUser = null;

// Check if faculty is logged in
onAuthStateChanged(auth, function (user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;

  console.log('Faculty logged in:', currentUser.email);
});

// Add material
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!currentUser) {
    message.textContent = 'Please login first.';

    return;
  }

  const classValue = document.getElementById('class').value;

  const subject = document.getElementById('subject').value;

  const chapter = document.getElementById('chapter').value.trim();

  const title = document.getElementById('title').value.trim();

  const type = document.getElementById('type').value;

  const resourceURL = document.getElementById('resourceURL').value.trim();

  const description = document.getElementById('description').value.trim();

  message.textContent = 'Adding material...';

  try {
    await addDoc(collection(db, 'materials'), {
      class: classValue,
      subject: subject,
      chapter: chapter,
      title: title,
      type: type,
      resourceURL: resourceURL,
      description: description,
      uploadedBy: currentUser.email,
      uploadedAt: serverTimestamp(),
    });

    message.textContent = 'Material added successfully!';

    form.reset();

    console.log('Material added successfully');
  } catch (error) {
    console.error('Firestore error:', error);

    message.textContent = 'Failed to add material.';
  }
});
