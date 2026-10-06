import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const db = getFirestore(app);
const auth = getAuth(app);

/* =========================================================
   DOM
========================================================= */

const totalFaculty = document.getElementById('totalFaculty');

const totalMaterials = document.getElementById('totalMaterials');

const class11Count = document.getElementById('class11Count');

const class12Count = document.getElementById('class12Count');

const subjectCount = document.getElementById('subjectCount');

const recentMaterials = document.getElementById('recentMaterials');

const adminEmail = document.getElementById('adminEmail');

const profileAvatar = document.getElementById('profileAvatar');

const logoutBtn = document.getElementById('logoutBtn');

/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  try {
    /* -----------------------------------------
           ADMIN CHECK
        ----------------------------------------- */

    const userRef = doc(db, 'users', user.uid);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      console.error('Admin profile not found.');

      window.location.href = 'login.html';

      return;
    }

    const userData = userSnapshot.data();

    if (userData.role !== 'admin') {
      alert('You do not have administrator access.');

      window.location.href = 'login.html';

      return;
    }

    /* -----------------------------------------
           ADMIN PROFILE
        ----------------------------------------- */

    if (adminEmail) {
      adminEmail.textContent = user.email || 'Administrator';
    }

    if (profileAvatar) {
      profileAvatar.textContent = (user.email || 'A').charAt(0).toUpperCase();
    }

    /* -----------------------------------------
           LOAD DASHBOARD
        ----------------------------------------- */

    await loadDashboard();
  } catch (error) {
    console.error('Admin dashboard error:', error);
  }
});

/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {
  try {
    /* -----------------------------------------
           LOAD USERS
        ----------------------------------------- */

    const usersSnapshot = await getDocs(collection(db, 'users'));

    const users = usersSnapshot.docs.map((userDoc) => ({
      id: userDoc.id,
      ...userDoc.data(),
    }));

    const faculty = users.filter((user) => user.role === 'faculty');

    /* -----------------------------------------
           LOAD MATERIALS
        ----------------------------------------- */

    const materialsSnapshot = await getDocs(collection(db, 'materials'));

    const materials = materialsSnapshot.docs.map((materialDoc) => ({
      id: materialDoc.id,
      ...materialDoc.data(),
    }));

    console.log('Dashboard materials:', materials);

    /* -----------------------------------------
           STATISTICS
        ----------------------------------------- */

    const class11 = materials.filter(
      (material) => normalizeClass(material.class) === '11',
    ).length;

    const class12 = materials.filter(
      (material) => normalizeClass(material.class) === '12',
    ).length;

    const subjects = new Set(
      materials
        .map((material) => normalizeSubject(material.subject))
        .filter(Boolean),
    );

    totalFaculty.textContent = faculty.length;

    totalMaterials.textContent = materials.length;

    class11Count.textContent = class11;

    class12Count.textContent = class12;

    subjectCount.textContent = subjects.size;

    /* -----------------------------------------
           RECENT MATERIALS
        ----------------------------------------- */

    materials.sort((a, b) => getTime(b.uploadedAt) - getTime(a.uploadedAt));

    renderRecentMaterials(materials.slice(0, 5));
  } catch (error) {
    console.error('Unable to load dashboard:', error);

    recentMaterials.innerHTML = `
            <div class="dashboard-loading">
                Unable to load dashboard data.
            </div>
        `;
  }
}

/* =========================================================
   RECENT MATERIALS
========================================================= */

function renderRecentMaterials(materials) {
  if (!materials.length) {
    recentMaterials.innerHTML = `
            <div class="dashboard-loading">
                No materials have been uploaded yet.
            </div>
        `;

    return;
  }

  recentMaterials.innerHTML = materials
    .map((material) => createRecentMaterial(material))
    .join('');
}

/* =========================================================
   MATERIAL ROW
========================================================= */

function createRecentMaterial(material) {
  const title = escapeHTML(material.title || 'Untitled Material');

  const subject = formatSubject(normalizeSubject(material.subject));

  const classValue = normalizeClass(material.class);

  const type = formatType(normalizeType(material.type));

  const uploader = material.uploadedBy || 'Faculty';

  const date = formatDate(material.uploadedAt);

  return `
        <div class="recent-material">

            <div class="material-icon-small">
                ${getMaterialIcon(normalizeType(material.type))}
            </div>


            <div class="material-info">

                <strong>
                    ${title}
                </strong>

                <span>
                    Class ${escapeHTML(classValue)}
                    ·
                    ${escapeHTML(subject)}
                    ·
                    ${escapeHTML(type)}
                </span>

            </div>


            <div class="material-meta">

                <strong>
                    ${escapeHTML(uploader)}
                </strong>

                <span>
                    ${escapeHTML(date)}
                </span>

            </div>

        </div>
    `;
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeClass(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace(/class/gi, '').trim();
}

function normalizeSubject(value) {
  if (!value) {
    return '';
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
}

function normalizeType(value) {
  if (!value) {
    return '';
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
}

function formatSubject(subject) {
  const names = {
    physics: 'Physics',

    chemistry: 'Chemistry',

    mathematics: 'Mathematics',

    biology: 'Biology',

    'computer-science': 'Computer Science',
  };

  return (
    names[subject] ||
    subject
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function formatType(type) {
  const names = {
    notes: 'Notes',

    'important-questions': 'Important Questions',

    'study-material': 'Study Material',

    assignment: 'Assignment',

    'previous-year-questions': 'Previous Year Questions',
  };

  return names[type] || formatSubject(type) || 'Material';
}

function getMaterialIcon(type) {
  switch (type) {
    case 'notes':
      return 'N';

    case 'important-questions':
      return '?';

    case 'study-material':
      return 'S';

    case 'assignment':
      return 'A';

    case 'previous-year-questions':
      return 'P';

    default:
      return 'M';
  }
}

function getTime(timestamp) {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  if (timestamp.seconds !== undefined) {
    return timestamp.seconds * 1000;
  }

  const value = new Date(timestamp).getTime();

  return Number.isNaN(value) ? 0 : value;
}

function formatDate(timestamp) {
  const time = getTime(timestamp);

  if (!time) {
    return '—';
  }

  return new Date(time).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener('click', async () => {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout failed:', error);
  }
});
