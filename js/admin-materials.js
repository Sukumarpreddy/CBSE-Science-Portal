import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const db = getFirestore(app);
const auth = getAuth(app);

const container = document.getElementById('adminMaterialContainer');

const resultCount = document.getElementById('materialCountText');

const searchInput = document.getElementById('searchInput');

const classFilter = document.getElementById('classFilter');

const subjectFilter = document.getElementById('subjectFilter');

const logoutBtn = document.getElementById('logoutBtn');

let allMaterials = [];

/* ============================= */
/* ADMIN AUTH CHECK */
/* ============================= */

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists() || userSnapshot.data().role !== 'admin') {
      alert('Access denied. Admin account required.');

      window.location.href = 'faculty-dashboard.html';

      return;
    }

    loadMaterials();
  } catch (error) {
    console.error('Admin verification error:', error);

    alert('Unable to verify admin account.');
  }
});

/* ============================= */
/* LOAD MATERIALS */
/* ============================= */

async function loadMaterials() {
  container.innerHTML = `
        <div class="no-admin-materials">
            Loading materials...
        </div>
    `;

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    allMaterials = [];

    snapshot.forEach(function (document) {
      allMaterials.push({
        id: document.id,

        ...document.data(),
      });
    });

    applyFilters();
  } catch (error) {
    console.error('Error loading materials:', error);

    container.innerHTML = `
            <div class="no-admin-materials">

                <h3>
                    Unable to load materials
                </h3>

                <p>
                    Please try again.
                </p>

            </div>
        `;
  }
}

/* ============================= */
/* FILTERS */
/* ============================= */

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();

  const selectedClass = classFilter.value;

  const selectedSubject = subjectFilter.value;

  const filtered = allMaterials.filter(function (material) {
    const title = String(material.title || '').toLowerCase();

    const description = String(material.description || '').toLowerCase();

    const chapter = String(material.chapter || '').toLowerCase();

    const matchesSearch =
      !search ||
      title.includes(search) ||
      description.includes(search) ||
      chapter.includes(search);

    const matchesClass =
      selectedClass === 'all' || String(material.class || '') === selectedClass;

    const matchesSubject =
      selectedSubject === 'all' ||
      String(material.subject || '').toLowerCase() === selectedSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  displayMaterials(filtered);
}

/* ============================= */
/* DISPLAY */
/* ============================= */

function displayMaterials(materials) {
  resultCount.textContent = `${materials.length} material${
    materials.length === 1 ? '' : 's'
  } found`;

  if (materials.length === 0) {
    container.innerHTML = `
            <div class="no-admin-materials">

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

  container.innerHTML = '';

  materials.forEach(function (material) {
    const card = document.createElement('div');

    card.className = 'admin-material-card';

    card.innerHTML = `

                <div class="admin-material-icon">
                    📚
                </div>

                <h3>
                    ${material.title || 'Untitled Material'}
                </h3>

                <p>
                    Class ${material.class || '-'}
                    •
                    ${material.subject || '-'}
                </p>

                <p>
                    ${material.chapter || 'Chapter not specified'}
                </p>

                <span class="admin-material-type">
                    ${material.type || 'Material'}
                </span>

                <p class="admin-material-uploader">
                    Uploaded by:
                    ${material.uploadedBy || 'Unknown'}
                </p>

                <div class="admin-material-actions">

                    <a
                        href="${material.resourceURL || '#'}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="admin-view-btn"
                    >
                        View
                    </a>

                    <button
                        class="admin-edit-btn"
                        data-id="${material.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="admin-delete-btn"
                        data-id="${material.id}"
                    >
                        Delete
                    </button>

                </div>

            `;

    container.appendChild(card);
  });

  addEvents();
}

/* ============================= */
/* EVENTS */
/* ============================= */

function addEvents() {
  const editButtons = document.querySelectorAll('.admin-edit-btn');

  editButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const materialId = this.dataset.id;

      editMaterial(materialId);
    });
  });

  const deleteButtons = document.querySelectorAll('.admin-delete-btn');

  deleteButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const materialId = this.dataset.id;

      deleteMaterial(materialId);
    });
  });
}

/* ============================= */
/* EDIT MATERIAL */
/* ============================= */

async function editMaterial(materialId) {
  const material = allMaterials.find(function (item) {
    return item.id === materialId;
  });

  if (!material) return;

  const newTitle = prompt('Edit material title:', material.title || '');

  if (newTitle === null) {
    return;
  }

  const cleanTitle = newTitle.trim();

  if (!cleanTitle) {
    alert('Title cannot be empty.');

    return;
  }

  try {
    await updateDoc(doc(db, 'materials', materialId), {
      title: cleanTitle,
    });

    alert('Material updated successfully.');

    loadMaterials();
  } catch (error) {
    console.error('Update error:', error);

    alert('Unable to update material.');
  }
}

/* ============================= */
/* DELETE MATERIAL */
/* ============================= */

async function deleteMaterial(materialId) {
  const confirmed = confirm('Are you sure you want to delete this material?');

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'materials', materialId));

    alert('Material deleted successfully.');

    loadMaterials();
  } catch (error) {
    console.error('Delete error:', error);

    alert('Unable to delete material.');
  }
}

/* ============================= */
/* FILTER EVENTS */
/* ============================= */

searchInput.addEventListener('input', applyFilters);

classFilter.addEventListener('change', applyFilters);

subjectFilter.addEventListener('change', applyFilters);

/* ============================= */
/* LOGOUT */
/* ============================= */

logoutBtn.addEventListener('click', async function () {
  try {
    await signOut(auth);

    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
});
