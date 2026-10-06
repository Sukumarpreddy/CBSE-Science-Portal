import {
  getFirestore,
  collection,
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

/* =========================================================
   DOM ELEMENTS
========================================================= */

const totalMaterials = document.getElementById('totalMaterials');
const class11Count = document.getElementById('class11Count');
const class12Count = document.getElementById('class12Count');
const subjectCount = document.getElementById('subjectCount');

const searchInput = document.getElementById('searchInput');
const classFilter = document.getElementById('classFilter');
const subjectFilter = document.getElementById('subjectFilter');
const typeFilter = document.getElementById('typeFilter');

const materialsContainer = document.getElementById('materialsContainer');

const resultCount = document.getElementById('resultCount');

const emptyState = document.getElementById('emptyState');

const errorState = document.getElementById('errorState');

const errorMessage = document.getElementById('errorMessage');

const retryBtn = document.getElementById('retryBtn');

const logoutBtn = document.getElementById('logoutBtn');

const adminEmail = document.getElementById('adminEmail');

const profileAvatar = document.getElementById('profileAvatar');

/* =========================================================
   DATA
========================================================= */

let allMaterials = [];
let allUsers = [];

/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    if (adminEmail) {
      adminEmail.textContent = user.email || 'Administrator';
    }

    if (profileAvatar) {
      profileAvatar.textContent = (user.email || 'A').charAt(0).toUpperCase();
    }

    await loadMaterials();
  } catch (error) {
    console.error('Admin materials error:', error);

    showError(error.message || 'Unable to load materials.');
  }
});

/* =========================================================
   LOAD MATERIALS
========================================================= */

async function loadMaterials() {
  hideStates();

  showLoading();

  try {
    console.log('Loading materials from Firestore...');

    /* -----------------------------------------
       LOAD MATERIALS
    ----------------------------------------- */

    const materialsSnapshot = await getDocs(collection(db, 'materials'));

    console.log('Materials found:', materialsSnapshot.size);

    allMaterials = materialsSnapshot.docs.map((materialDoc) => {
      const data = materialDoc.data();

      console.log('Material:', materialDoc.id, data);

      return {
        id: materialDoc.id,
        ...data,
      };
    });

    /* -----------------------------------------
       LOAD USERS
    ----------------------------------------- */

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));

      allUsers = usersSnapshot.docs.map((userDoc) => ({
        id: userDoc.id,
        ...userDoc.data(),
      }));

      console.log('Users found:', allUsers.length);
    } catch (userError) {
      console.warn('Could not load users:', userError);

      allUsers = [];
    }

    /* -----------------------------------------
       SORT MATERIALS
    ----------------------------------------- */

    allMaterials.sort((a, b) => {
      const dateA = getTimestampValue(a.uploadedAt);

      const dateB = getTimestampValue(b.uploadedAt);

      return dateB - dateA;
    });

    /* -----------------------------------------
       UPDATE UI
    ----------------------------------------- */

    updateStatistics();

    populateSubjectFilter();

    renderMaterials();
  } catch (error) {
    console.error('Firestore material loading failed:', error);

    showError(error.message || 'Unable to load materials from Firebase.');
  }
}

/* =========================================================
   TIMESTAMP HELPER
========================================================= */

function getTimestampValue(timestamp) {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  if (timestamp.seconds !== undefined) {
    return timestamp.seconds * 1000;
  }

  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  const parsed = new Date(timestamp).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {
  const materials = allMaterials;

  const class11 = materials.filter(
    (item) => normalizeClass(item.class) === '11',
  ).length;

  const class12 = materials.filter(
    (item) => normalizeClass(item.class) === '12',
  ).length;

  const subjects = new Set(
    materials.map((item) => normalizeSubject(item.subject)).filter(Boolean),
  );

  totalMaterials.textContent = materials.length;

  class11Count.textContent = class11;

  class12Count.textContent = class12;

  subjectCount.textContent = subjects.size;
}

/* =========================================================
   SUBJECT FILTER
========================================================= */

function populateSubjectFilter() {
  if (!subjectFilter) {
    return;
  }

  const subjects = [
    ...new Set(
      allMaterials
        .map((item) => normalizeSubject(item.subject))
        .filter(Boolean),
    ),
  ].sort();

  subjectFilter.innerHTML = `
    <option value="all">All Subjects</option>
  `;

  subjects.forEach((subject) => {
    const option = document.createElement('option');

    option.value = subject;

    option.textContent = formatSubject(subject);

    subjectFilter.appendChild(option);
  });
}

/* =========================================================
   RENDER MATERIALS
========================================================= */

function renderMaterials() {
  const search = (searchInput?.value || '').trim().toLowerCase();

  const selectedClass = classFilter?.value || 'all';

  const selectedSubject = subjectFilter?.value || 'all';

  const selectedType = typeFilter?.value || 'all';

  const filtered = allMaterials.filter((material) => {
    const materialClass = normalizeClass(material.class);

    const subject = normalizeSubject(material.subject);

    const type = normalizeType(material.type);

    const title = String(material.title || '').toLowerCase();

    const chapter = String(
      material.chapterName || material.chapter || '',
    ).toLowerCase();

    const uploader = String(
      material.uploadedBy || getUploaderName(material) || '',
    ).toLowerCase();

    const searchMatch =
      !search ||
      title.includes(search) ||
      chapter.includes(search) ||
      uploader.includes(search) ||
      subject.includes(search) ||
      type.includes(search);

    const classMatch =
      selectedClass === 'all' || materialClass === selectedClass;

    const subjectMatch =
      selectedSubject === 'all' || subject === selectedSubject;

    const typeMatch = selectedType === 'all' || type === selectedType;

    return searchMatch && classMatch && subjectMatch && typeMatch;
  });

  console.log('Filtered materials:', filtered.length);

  resultCount.textContent = `${filtered.length} ${
    filtered.length === 1 ? 'material' : 'materials'
  }`;

  if (filtered.length === 0) {
    materialsContainer.innerHTML = '';

    showEmpty();

    return;
  }

  hideEmpty();

  hideError();

  materialsContainer.innerHTML = filtered.map(createMaterialRow).join('');
}

/* =========================================================
   CREATE TABLE ROW
========================================================= */

function createMaterialRow(material) {
  const title = escapeHTML(material.title || 'Untitled Material');

  const subject = normalizeSubject(material.subject);

  const subjectLabel = formatSubject(subject);

  const materialClass = normalizeClass(material.class);

  const chapter =
    material.chapterName ||
    (material.chapter ? `Chapter ${material.chapter}` : 'General');

  const type = normalizeType(material.type);

  const typeLabel = formatType(type);

  const uploader =
    material.uploadedBy || getUploaderName(material) || 'Faculty';

  const date = formatDate(material.uploadedAt);

  const url = material.resourceURL || material.fileURL || material.url || '';

  return `
    <tr class="material-row">

      <td>
        <div class="material-info">

          <div class="material-icon">
            ${getMaterialIcon(type)}
          </div>

          <div class="material-details">

            <strong>
              ${title}
            </strong>

            <span>
              ${escapeHTML(chapter)}
            </span>

          </div>

        </div>
      </td>


      <td>
        <span class="class-badge">
          Class ${escapeHTML(materialClass || '-')}
        </span>
      </td>


      <td>
        <span class="subject-text">
          ${escapeHTML(subjectLabel || '-')}
        </span>
      </td>


      <td>
        <span class="type-badge ${escapeHTML(type)}">
          ${escapeHTML(typeLabel)}
        </span>
      </td>


      <td>
        <div class="uploader">
          <div class="uploader-avatar">
            ${escapeHTML(String(uploader).charAt(0).toUpperCase())}
          </div>

          <span>
            ${escapeHTML(uploader)}
          </span>
        </div>
      </td>


      <td>
        <span class="date-text">
          ${escapeHTML(date)}
        </span>
      </td>


      <td>
        <div class="action-buttons">

          ${
            url
              ? `
                <a
                  href="${escapeAttribute(url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="action-btn view-btn"
                  title="Open material"
                >
                  View
                </a>
              `
              : `
                <button
                  type="button"
                  class="action-btn disabled-btn"
                  disabled
                  title="No resource URL"
                >
                  No File
                </button>
              `
          }


          <button
            type="button"
            class="action-btn delete-btn"
            data-id="${escapeAttribute(material.id)}"
            title="Delete material"
          >
            Delete
          </button>

        </div>
      </td>

    </tr>
  `;
}

/* =========================================================
   UPLOADER
========================================================= */

function getUploaderName(material) {
  if (material.uploadedByUid) {
    const user = allUsers.find((item) => item.id === material.uploadedByUid);

    if (user) {
      return user.name || user.displayName || user.email || 'Faculty';
    }
  }

  return 'Faculty';
}

/* =========================================================
   MATERIAL ICON
========================================================= */

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

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeClass(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace('Class', '').replace('class', '').trim();
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

/* =========================================================
   FORMAT HELPERS
========================================================= */

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

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(timestamp) {
  const value = getTimestampValue(timestamp);

  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {
  materialsContainer.innerHTML = `
    <tr>
      <td colspan="7" class="loading-cell">

        <div class="loader"></div>

        <span>
          Loading materials...
        </span>

      </td>
    </tr>
  `;
}

/* =========================================================
   STATES
========================================================= */

function hideStates() {
  hideEmpty();
  hideError();
}

function showEmpty() {
  emptyState?.classList.remove('hidden');
}

function hideEmpty() {
  emptyState?.classList.add('hidden');
}

function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
  }

  errorState?.classList.remove('hidden');
}

function hideError() {
  errorState?.classList.add('hidden');
}

/* =========================================================
   FILTER EVENTS
========================================================= */

searchInput?.addEventListener('input', renderMaterials);

classFilter?.addEventListener('change', renderMaterials);

subjectFilter?.addEventListener('change', renderMaterials);

typeFilter?.addEventListener('change', renderMaterials);

/* =========================================================
   DELETE MATERIAL
========================================================= */

materialsContainer?.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('.delete-btn');

  if (!deleteButton) {
    return;
  }

  const materialId = deleteButton.dataset.id;

  if (!materialId) {
    return;
  }

  const material = allMaterials.find((item) => item.id === materialId);

  const materialTitle = material?.title || 'this material';

  const confirmed = confirm(
    `Are you sure you want to delete "${materialTitle}"?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    deleteButton.disabled = true;

    deleteButton.textContent = 'Deleting...';

    await deleteDoc(doc(db, 'materials', materialId));

    allMaterials = allMaterials.filter((item) => item.id !== materialId);

    updateStatistics();

    populateSubjectFilter();

    renderMaterials();
  } catch (error) {
    console.error('Delete error:', error);

    alert('Unable to delete this material.\n\n' + error.message);

    deleteButton.disabled = false;

    deleteButton.textContent = 'Delete';
  }
});

/* =========================================================
   RETRY
========================================================= */

retryBtn?.addEventListener('click', () => {
  loadMaterials();
});

/* =========================================================
   LOGOUT
========================================================= */

logoutBtn?.addEventListener('click', async () => {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});
