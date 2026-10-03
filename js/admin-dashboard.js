import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

// ========================================
// FIREBASE
// ========================================

const db = getFirestore(app);
const auth = getAuth(app);

// ========================================
// HTML ELEMENTS
// ========================================

const adminEmail = document.getElementById('adminEmail');

const facultyCount = document.getElementById('facultyCount');

const materialCount = document.getElementById('materialCount');

const recentMaterials = document.getElementById('recentMaterials');

const logoutBtn = document.getElementById('logoutBtn');

// ========================================
// CHECK ADMIN LOGIN
// ========================================

onAuthStateChanged(auth, async function (user) {
  // User is not logged in
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  try {
    // Get current user's profile
    const userRef = doc(db, 'users', user.uid);

    const userSnapshot = await getDoc(userRef);

    // User profile doesn't exist
    if (!userSnapshot.exists()) {
      alert('Your account is not registered in the portal.');

      await signOut(auth);

      window.location.href = 'login.html';

      return;
    }

    const userData = userSnapshot.data();

    // Check admin role
    if (userData.role !== 'admin') {
      alert('Access denied. Admin account required.');

      window.location.href = 'faculty-dashboard.html';

      return;
    }

    // Display admin email
    adminEmail.textContent = user.email || userData.email || 'Administrator';

    // Load dashboard
    loadDashboard();
  } catch (error) {
    console.error('Admin verification error:', error);

    alert('Unable to verify administrator.');
  }
});

// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {
  await loadFacultyCount();

  await loadMaterialCount();

  await loadRecentMaterials();
}

// ========================================
// FACULTY COUNT
// ========================================

async function loadFacultyCount() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));

    let count = 0;

    usersSnapshot.forEach(function (userDoc) {
      const userData = userDoc.data();

      if (userData.role === 'faculty') {
        count++;
      }
    });

    facultyCount.textContent = count;
  } catch (error) {
    console.error('Faculty count error:', error);

    facultyCount.textContent = '0';
  }
}

// ========================================
// MATERIAL COUNT
// ========================================

async function loadMaterialCount() {
  try {
    const materialsSnapshot = await getDocs(collection(db, 'materials'));

    materialCount.textContent = materialsSnapshot.size;
  } catch (error) {
    console.error('Material count error:', error);

    materialCount.textContent = '0';
  }
}

// ========================================
// RECENT MATERIALS
// ========================================

async function loadRecentMaterials() {
  recentMaterials.innerHTML = `
        <div class="loading-admin">
            Loading recent materials...
        </div>
    `;

  try {
    const materialsRef = collection(db, 'materials');

    const recentQuery = query(
      materialsRef,
      orderBy('uploadedAt', 'desc'),
      limit(6),
    );

    const snapshot = await getDocs(recentQuery);

    // No materials
    if (snapshot.empty) {
      recentMaterials.innerHTML = `
                <div class="no-admin-materials">

                    <h3>
                        No materials uploaded yet
                    </h3>

                    <p>
                        Faculty materials will appear here.
                    </p>

                </div>
            `;

      return;
    }

    recentMaterials.innerHTML = '';

    // IMPORTANT:
    // Don't call the Firestore document "document"
    // because "document" is the browser DOM object.

    snapshot.forEach(function (docSnapshot) {
      const material = docSnapshot.data();

      const card = document.createElement('div');

      card.className = 'recent-material-card';

      card.innerHTML = `

                    <div class="recent-icon">
                        📚
                    </div>

                    <h3>
                        ${escapeHTML(material.title || 'Untitled Material')}
                    </h3>

                    <p>
                        Class
                        ${escapeHTML(material.class || '-')}
                        •
                        ${escapeHTML(material.subject || '-')}
                    </p>

                    <p>
                        ${escapeHTML(
                          material.chapter || 'Chapter not specified',
                        )}
                    </p>

                    <span class="recent-type">
                        ${escapeHTML(material.type || 'Material')}
                    </span>

                `;

      recentMaterials.appendChild(card);
    });
  } catch (error) {
    console.error('Recent materials error:', error);

    // If orderBy uploadedAt causes a problem,
    // show a useful message instead of breaking.

    recentMaterials.innerHTML = `

            <div class="no-admin-materials">

                <h3>
                    Unable to load recent materials
                </h3>

                <p>
                    Please check the Firestore
                    uploadedAt field.
                </p>

            </div>

        `;
  }
}

// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {
  const div = document.createElement('div');

  div.textContent = String(value);

  return div.innerHTML;
}

// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener('click', async function () {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});
