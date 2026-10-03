import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

/* ========================================
   FIREBASE
======================================== */

const db = getFirestore(app);

const auth = getAuth(app);

/* ========================================
   HTML ELEMENTS
======================================== */

const facultyContainer = document.getElementById('facultyContainer');

const facultyTotal = document.getElementById('facultyTotal');

const facultySearch = document.getElementById('facultySearch');

const logoutBtn = document.getElementById('logoutBtn');

/* ========================================
   DATA
======================================== */

let allFaculty = [];

let allMaterials = [];

/* ========================================
   CHECK ADMIN
======================================== */

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      alert('Your account is not registered in the portal.');

      await signOut(auth);

      window.location.href = 'login.html';

      return;
    }

    const userData = userSnapshot.data();

    if (userData.role !== 'admin') {
      alert('Access denied. Admin account required.');

      window.location.href = 'faculty-dashboard.html';

      return;
    }

    // Admin verified
    loadFaculty();
  } catch (error) {
    console.error('Admin verification error:', error);

    alert('Unable to verify administrator.');
  }
});

/* ========================================
   LOAD FACULTY
======================================== */

async function loadFaculty() {
  facultyContainer.innerHTML = `
        <div class="faculty-loading">
            Loading faculty...
        </div>
    `;

  try {
    /* ================================
           GET USERS
        ================================= */

    const usersSnapshot = await getDocs(collection(db, 'users'));

    allFaculty = [];

    usersSnapshot.forEach(function (userDoc) {
      const data = userDoc.data();

      if (data.role === 'faculty') {
        allFaculty.push({
          id: userDoc.id,

          email: data.email || 'Unknown',

          role: data.role,
        });
      }
    });

    /* ================================
           GET MATERIALS
        ================================= */

    const materialsSnapshot = await getDocs(collection(db, 'materials'));

    allMaterials = [];

    materialsSnapshot.forEach(function (materialDoc) {
      allMaterials.push(materialDoc.data());
    });

    /* ================================
           TOTAL
        ================================= */

    facultyTotal.textContent = allFaculty.length;

    /* ================================
           DISPLAY
        ================================= */

    displayFaculty(allFaculty);
  } catch (error) {
    console.error('Faculty loading error:', error);

    facultyContainer.innerHTML = `

            <div class="no-faculty">

                <h3>
                    Unable to load faculty
                </h3>

                <p>
                    Please check your Firebase
                    permissions.
                </p>

            </div>

        `;
  }
}

/* ========================================
   DISPLAY FACULTY
======================================== */

function displayFaculty(facultyList) {
  if (facultyList.length === 0) {
    facultyContainer.innerHTML = `

            <div class="no-faculty">

                <h3>
                    No faculty found
                </h3>

                <p>
                    Faculty accounts will appear here.
                </p>

            </div>

        `;

    return;
  }

  facultyContainer.innerHTML = '';

  facultyList.forEach(function (faculty) {
    /* ============================
               COUNT MATERIALS
            ============================ */

    const materialCount = allMaterials.filter(function (material) {
      return material.uploadedBy === faculty.email;
    }).length;

    /* ============================
               CARD
            ============================ */

    const card = document.createElement('div');

    card.className = 'faculty-card';

    card.innerHTML = `

                <div class="faculty-card-icon">
                    👨‍🏫
                </div>


                <h3>
                    Faculty Account
                </h3>


                <p class="faculty-email">
                    ${escapeHTML(faculty.email)}
                </p>


                <span class="faculty-role">
                    ${escapeHTML(faculty.role)}
                </span>


                <div class="faculty-card-footer">

                    <div class="faculty-material-count">

                        Materials Uploaded:

                        <strong>
                            ${materialCount}
                        </strong>

                    </div>

                </div>

            `;

    facultyContainer.appendChild(card);
  });
}

/* ========================================
   SEARCH
======================================== */

facultySearch.addEventListener('input', function () {
  const search = facultySearch.value.trim().toLowerCase();

  const filtered = allFaculty.filter(function (faculty) {
    return faculty.email.toLowerCase().includes(search);
  });

  displayFaculty(filtered);
});

/* ========================================
   ESCAPE HTML
======================================== */

function escapeHTML(value) {
  const div = document.createElement('div');

  div.textContent = String(value);

  return div.innerHTML;
}

/* ========================================
   LOGOUT
======================================== */

logoutBtn.addEventListener('click', async function () {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});
