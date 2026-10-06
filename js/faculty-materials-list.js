import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
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

/* ==========================================
   DOM ELEMENTS
========================================== */

const facultyEmail = document.getElementById('facultyEmail');

const totalMaterials = document.getElementById('totalMaterials');

const totalClasses = document.getElementById('totalClasses');

const totalSubjects = document.getElementById('totalSubjects');

const searchInput = document.getElementById('searchInput');

const classFilter = document.getElementById('classFilter');

const subjectFilter = document.getElementById('subjectFilter');

const typeFilter = document.getElementById('typeFilter');

const resultCount = document.getElementById('resultCount');

const materialsContainer = document.getElementById('materialsContainer');

const logoutBtn = document.getElementById('logoutBtn');

let allMaterials = [];

/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  if (facultyEmail) {
    facultyEmail.textContent = user.email;
  }

  await loadMaterials(user.uid);
});

/* ==========================================
   LOAD MATERIALS
========================================== */

async function loadMaterials(uid) {
  try {
    const materialsQuery = query(
      collection(db, 'materials'),
      where('uploadedByUid', '==', uid),
    );

    const snapshot = await getDocs(materialsQuery);

    allMaterials = [];

    snapshot.forEach((document) => {
      allMaterials.push({
        id: document.id,

        ...document.data(),
      });
    });

    updateStatistics();

    renderMaterials();
  } catch (error) {
    console.error('Error loading materials:', error);

    materialsContainer.innerHTML = `

            <div class="no-materials">

                <h3>
                    Unable to load materials
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;
  }
}

/* ==========================================
   STATISTICS
========================================== */

function updateStatistics() {
  totalMaterials.textContent = allMaterials.length;

  const classes = new Set();

  const subjects = new Set();

  allMaterials.forEach((material) => {
    if (material.class) {
      classes.add(String(material.class));
    }

    if (material.subject) {
      subjects.add(normalizeSubject(material.subject));
    }
  });

  totalClasses.textContent = classes.size;

  totalSubjects.textContent = subjects.size;
}

/* ==========================================
   RENDER MATERIALS
========================================== */

function renderMaterials() {
  const search = searchInput.value.trim().toLowerCase();

  const selectedClass = classFilter.value;

  const selectedSubject = subjectFilter.value;

  const selectedType = typeFilter.value;

  const filteredMaterials = allMaterials.filter((material) => {
    const title = String(material.title || '').toLowerCase();

    const description = String(material.description || '').toLowerCase();

    const chapter = String(
      material.chapterName || material.chapter || '',
    ).toLowerCase();

    const searchText = `${title} ${description} ${chapter}`;

    const matchesSearch = !search || searchText.includes(search);

    const matchesClass =
      !selectedClass || String(material.class) === selectedClass;

    const matchesSubject =
      !selectedSubject ||
      normalizeSubject(material.subject) === selectedSubject;

    const matchesType =
      !selectedType || normalizeType(material.type) === selectedType;

    return matchesSearch && matchesClass && matchesSubject && matchesType;
  });

  resultCount.textContent = `${filteredMaterials.length} ${
    filteredMaterials.length === 1 ? 'material' : 'materials'
  }`;

  if (filteredMaterials.length === 0) {
    materialsContainer.innerHTML = `

            <div class="no-results">

                <h3>
                    No materials found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

    return;
  }

  materialsContainer.innerHTML = filteredMaterials
    .map(createMaterialCard)
    .join('');

  attachCardEvents();
}

/* ==========================================
   MATERIAL CARD
========================================== */

function createMaterialCard(material) {
  const title = escapeHTML(material.title || 'Untitled Material');

  const subject = formatSubject(material.subject);

  const type = formatType(material.type);

  const className = material.class
    ? `Class ${escapeHTML(String(material.class))}`
    : 'Class';

  const chapter = material.chapterName
    ? escapeHTML(material.chapterName)
    : material.chapter
      ? `Chapter ${escapeHTML(String(material.chapter))}`
      : 'Chapter not specified';

  const resourceURL =
    material.resourceURL || material.fileURL || material.url || '#';

  let description = String(material.description || '').trim();

  /*
       Hide duplicate descriptions such as:
       description = "notes"
       type = "notes"
    */

  if (
    description.toLowerCase() ===
    String(material.type || '')
      .trim()
      .toLowerCase()
  ) {
    description = '';
  }

  if (!description) {
    description = 'Academic study resource.';
  }

  description = escapeHTML(description);

  return `

        <article class="material-card">


            <!-- CARD TOP -->

            <div class="material-card-top">

                <div class="material-file-icon">
                    ▤
                </div>


                <span class="material-type">
                    ${escapeHTML(type)}
                </span>

            </div>


            <!-- CARD CONTENT -->

            <div class="material-card-content">

                <h3>
                    ${title}
                </h3>


                <div class="material-meta">

                    <span>
                        ${className}
                    </span>


                    <span>
                        ${escapeHTML(subject)}
                    </span>


                    <span>
                        ${chapter}
                    </span>

                </div>


                <p>
                    ${description}
                </p>

            </div>


            <!-- CARD ACTIONS -->

            <div class="material-card-footer">


                <a
                    href="${escapeAttribute(resourceURL)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="material-btn view-btn"
                >
                    View
                </a>


                <button
                    type="button"
                    class="material-btn edit-btn"
                    data-id="${escapeHTML(material.id)}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="material-btn delete-btn"
                    data-id="${escapeHTML(material.id)}"
                >
                    Delete
                </button>

            </div>


        </article>

    `;
}

/* ==========================================
   CARD EVENTS
========================================== */

function attachCardEvents() {
  /* EDIT */

  document.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const materialId = button.dataset.id;

      const material = allMaterials.find((item) => item.id === materialId);

      if (!material) {
        return;
      }

      localStorage.setItem('editMaterial', JSON.stringify(material));

      window.location.href =
        'faculty-materials.html?edit=' + encodeURIComponent(materialId);
    });
  });

  /* DELETE */

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const materialId = button.dataset.id;

      const material = allMaterials.find((item) => item.id === materialId);

      if (!material) {
        return;
      }

      const confirmed = confirm(
        `Are you sure you want to delete "${material.title || 'this material'}"?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        await deleteDoc(doc(db, 'materials', materialId));

        allMaterials = allMaterials.filter((item) => item.id !== materialId);

        updateStatistics();

        renderMaterials();
      } catch (error) {
        console.error('Delete error:', error);

        alert('Unable to delete this material.');
      }
    });
  });
}

/* ==========================================
   FILTER EVENTS
========================================== */

searchInput.addEventListener('input', renderMaterials);

classFilter.addEventListener('change', renderMaterials);

subjectFilter.addEventListener('change', renderMaterials);

typeFilter.addEventListener('change', renderMaterials);

/* ==========================================
   LOGOUT
========================================== */

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

/* ==========================================
   SUBJECT HELPERS
========================================== */

function normalizeSubject(subject) {
  const value = String(subject || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const aliases = {
    'computer-science': 'computer-science',

    'computer science': 'computer-science',

    maths: 'mathematics',

    math: 'mathematics',
  };

  return aliases[value] || value;
}

function formatSubject(subject) {
  const subjects = {
    physics: 'Physics',

    chemistry: 'Chemistry',

    mathematics: 'Mathematics',

    biology: 'Biology',

    'computer-science': 'Computer Science',
  };

  const normalized = normalizeSubject(subject);

  return subjects[normalized] || subject || 'Subject';
}

/* ==========================================
   TYPE HELPERS
========================================== */

function normalizeType(type) {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function formatType(type) {
  const types = {
    notes: 'Notes',

    'important-questions': 'Important Questions',

    'study-material': 'Study Material',

    assignment: 'Assignment',

    'previous-year-questions': 'Previous Year Questions',
  };

  const normalized = normalizeType(type);

  return types[normalized] || type || 'Study Material';
}

/* ==========================================
   SECURITY HELPERS
========================================== */

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
