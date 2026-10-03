import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

const db = getFirestore(app);
const auth = getAuth(app);

const container = document.getElementById('facultyMaterialContainer');

let currentUser = null;

/* ============================= */
/* AUTHENTICATION */
/* ============================= */

onAuthStateChanged(auth, function (user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;

  console.log('Faculty dashboard:', currentUser.email);

  loadMaterials();
});

/* ============================= */
/* LOAD MATERIALS */
/* ============================= */

async function loadMaterials() {
  container.innerHTML =
    "<div class='loading-materials'>Loading materials...</div>";

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    const materials = [];

    snapshot.forEach(function (document) {
      materials.push({
        id: document.id,
        ...document.data(),
      });
    });

    displayMaterials(materials);
  } catch (error) {
    console.error('Error loading materials:', error);

    container.innerHTML = `
            <div class="no-materials">

                <h3>Unable to load materials</h3>

                <p>
                    Please try again later.
                </p>

            </div>
        `;
  }
}

/* ============================= */
/* DISPLAY MATERIALS */
/* ============================= */

function displayMaterials(materials) {
  if (materials.length === 0) {
    container.innerHTML = `
            <div class="no-materials">

                <h3>No materials uploaded yet</h3>

                <p>
                    Start by uploading your first
                    study material.
                </p>

            </div>
        `;

    return;
  }

  container.innerHTML = '';

  materials.forEach(function (material) {
    const card = document.createElement('div');

    card.className = 'faculty-material-card';

    card.innerHTML = `

            <div class="material-icon">
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

            <span class="material-type">
                ${material.type || 'Material'}
            </span>

            <div class="material-actions">

                <a
                    href="${material.resourceURL || '#'}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="view-btn"
                >
                    View
                </a>

                <button
                    class="edit-btn"
                    data-id="${material.id}"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${material.id}"
                >
                    Delete
                </button>

            </div>
        `;

    container.appendChild(card);
  });

  addMaterialEvents();
}

/* ============================= */
/* BUTTON EVENTS */
/* ============================= */

function addMaterialEvents() {
  const editButtons = document.querySelectorAll('.edit-btn');

  editButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const materialId = this.dataset.id;

      openEditModal(materialId);
    });
  });

  const deleteButtons = document.querySelectorAll('.delete-btn');

  deleteButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      const materialId = this.dataset.id;

      const confirmed = confirm(
        'Are you sure you want to delete this material?',
      );

      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, 'materials', materialId));

        alert('Material deleted successfully.');

        loadMaterials();
      } catch (error) {
        console.error('Delete error:', error);

        alert('Unable to delete material.');
      }
    });
  });
}

/* ============================= */
/* EDIT MODAL */
/* ============================= */

const editModal = document.getElementById('editModal');

const editForm = document.getElementById('editMaterialForm');

const closeEditModal = document.getElementById('closeEditModal');

const cancelEdit = document.getElementById('cancelEdit');

const editMessage = document.getElementById('editMessage');

let editingMaterialId = null;

/* ============================= */
/* OPEN EDIT MODAL */
/* ============================= */

async function openEditModal(materialId) {
  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    let selectedMaterial = null;

    snapshot.forEach(function (document) {
      if (document.id === materialId) {
        selectedMaterial = {
          id: document.id,
          ...document.data(),
        };
      }
    });

    if (!selectedMaterial) {
      alert('Material not found.');

      return;
    }

    editingMaterialId = materialId;

    document.getElementById('editMaterialId').value = materialId;

    document.getElementById('editClass').value = selectedMaterial.class || '11';

    document.getElementById('editSubject').value =
      selectedMaterial.subject || 'physics';

    document.getElementById('editChapter').value =
      selectedMaterial.chapter || '';

    document.getElementById('editTitle').value = selectedMaterial.title || '';

    document.getElementById('editType').value =
      selectedMaterial.type || 'notes';

    document.getElementById('editURL').value =
      selectedMaterial.resourceURL || '';

    document.getElementById('editDescription').value =
      selectedMaterial.description || '';

    editMessage.textContent = '';

    editModal.classList.add('active');
  } catch (error) {
    console.error('Error opening edit:', error);

    alert('Unable to open material.');
  }
}

/* ============================= */
/* CLOSE MODAL */
/* ============================= */

function closeModal() {
  editModal.classList.remove('active');

  editingMaterialId = null;

  editForm.reset();

  editMessage.textContent = '';
}

closeEditModal.addEventListener('click', closeModal);

cancelEdit.addEventListener('click', closeModal);

/* ============================= */
/* SAVE EDIT */
/* ============================= */

editForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!editingMaterialId) {
    return;
  }

  const updatedMaterial = {
    class: document.getElementById('editClass').value,

    subject: document.getElementById('editSubject').value,

    chapter: document.getElementById('editChapter').value.trim(),

    title: document.getElementById('editTitle').value.trim(),

    type: document.getElementById('editType').value,

    resourceURL: document.getElementById('editURL').value.trim(),

    description: document.getElementById('editDescription').value.trim(),
  };

  if (
    !updatedMaterial.chapter ||
    !updatedMaterial.title ||
    !updatedMaterial.resourceURL
  ) {
    editMessage.textContent = 'Please fill all required fields.';

    return;
  }

  editMessage.textContent = 'Saving changes...';

  try {
    await updateDoc(doc(db, 'materials', editingMaterialId), updatedMaterial);

    editMessage.textContent = 'Material updated successfully.';

    setTimeout(function () {
      closeModal();

      loadMaterials();
    }, 700);
  } catch (error) {
    console.error('Update error:', error);

    editMessage.textContent = 'Unable to update material.';
  }
});
