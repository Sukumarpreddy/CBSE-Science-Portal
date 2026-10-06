import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const db = getFirestore(app);
const auth = getAuth(app);

const facultyEmail = document.getElementById('facultyEmail');

const totalMaterials = document.getElementById('totalMaterials');

const totalClasses = document.getElementById('totalClasses');

const totalSubjects = document.getElementById('totalSubjects');

const recentUploads = document.getElementById('recentUploads');

const materialsList = document.getElementById('materialsList');

const logoutBtn = document.getElementById('logoutBtn');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  console.log('Faculty dashboard:', user.email);

  if (facultyEmail) {
    facultyEmail.textContent = user.email;
  }

  await loadDashboard(user.uid);
});

async function loadDashboard(uid) {
  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    const materials = [];

    snapshot.forEach((document) => {
      const material = document.data();

      if (material.uploadedByUid === uid) {
        materials.push({
          id: document.id,
          ...material,
        });
      }
    });

    console.log('Faculty materials:', materials);

    updateStatistics(materials);

    displayRecentMaterials(materials);
  } catch (error) {
    console.error('Dashboard loading error:', error);

    if (materialsList) {
      materialsList.innerHTML = `

                <div class="no-materials">

                    <h3>
                        Unable to load materials
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;
    }
  }
}

function updateStatistics(materials) {
  if (totalMaterials) {
    totalMaterials.textContent = materials.length;
  }

  const classes = new Set();
  const subjects = new Set();

  materials.forEach((material) => {
    if (material.class) {
      classes.add(String(material.class));
    }

    if (material.subject) {
      subjects.add(String(material.subject));
    }
  });

  if (totalClasses) {
    totalClasses.textContent = classes.size;
  }

  if (totalSubjects) {
    totalSubjects.textContent = subjects.size;
  }

  if (recentUploads) {
    recentUploads.textContent = Math.min(materials.length, 5);
  }
}

function displayRecentMaterials(materials) {
  if (!materialsList) {
    return;
  }

  if (materials.length === 0) {
    materialsList.innerHTML = `

            <div class="no-materials">

                <h3>
                    No materials uploaded yet
                </h3>

                <p>
                    Start by uploading your first study material.
                </p>

                <a
                    href="faculty-materials.html"
                    class="dashboard-upload-link"
                >
                    Upload Material
                </a>

            </div>

        `;

    return;
  }

  const sortedMaterials = [...materials].sort((a, b) => {
    const timeA = a.uploadedAt?.seconds || 0;

    const timeB = b.uploadedAt?.seconds || 0;

    return timeB - timeA;
  });

  const recentMaterials = sortedMaterials.slice(0, 5);

  materialsList.innerHTML = recentMaterials.map(createMaterialCard).join('');
}

function createMaterialCard(material) {
  const title = escapeHTML(material.title || 'Untitled Material');

  const subject = formatSubject(material.subject);

  const className = material.class
    ? `Class ${escapeHTML(String(material.class))}`
    : 'Class';

  const chapter = material.chapterName
    ? escapeHTML(material.chapterName)
    : material.chapter
      ? `Chapter ${escapeHTML(String(material.chapter))}`
      : 'Chapter';

  const type = escapeHTML(material.type || 'Study Material');

  const resourceURL = material.resourceURL || material.fileURL || '#';

  return `

        <div class="dashboard-material-card">

            <div class="dashboard-material-icon">
                📚
            </div>

            <div class="dashboard-material-info">

                <h3>
                    ${title}
                </h3>

                <p>
                    ${className}
                    •
                    ${escapeHTML(subject)}
                </p>

                <span>
                    ${chapter}
                </span>

            </div>

            <div class="dashboard-material-meta">

                <span class="dashboard-material-type">
                    ${type}
                </span>

                <a
                    href="${escapeAttribute(resourceURL)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View
                </a>

            </div>

        </div>

    `;
}

function formatSubject(subject) {
  const subjects = {
    physics: 'Physics',

    chemistry: 'Chemistry',

    mathematics: 'Mathematics',

    biology: 'Biology',

    'computer-science': 'Computer Science',
  };

  return subjects[subject] || subject || 'Subject';
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')

    .replaceAll('<', '&lt;')

    .replaceAll('>', '&gt;')

    .replaceAll('"', '&quot;')

    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);

      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}
