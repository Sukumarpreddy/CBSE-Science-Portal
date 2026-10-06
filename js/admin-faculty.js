/* =========================================
   ADMIN FACULTY MANAGEMENT
   CBSE SCIENCE PORTAL
========================================= */

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import { app } from './firebase.js';

/* =========================================
   FIREBASE
========================================= */

const db = getFirestore(app);
const auth = getAuth(app);

/* =========================================
   DOM
========================================= */

const adminEmail = document.getElementById('adminEmail');

const totalFaculty = document.getElementById('totalFaculty');

const activeFaculty = document.getElementById('activeFaculty');

const facultyMaterials = document.getElementById('facultyMaterials');

const facultyContainer = document.getElementById('facultyContainer');

const resultCount = document.getElementById('resultCount');

const searchInput = document.getElementById('searchInput');

const logoutBtn = document.getElementById('logoutBtn');

/* Modal */

const facultyModal = document.getElementById('facultyModal');

const openAddFacultyBtn = document.getElementById('openAddFacultyBtn');

const closeModalBtn = document.getElementById('closeModalBtn');

const cancelModalBtn = document.getElementById('cancelModalBtn');

const facultyForm = document.getElementById('facultyForm');

const facultyNameInput = document.getElementById('facultyNameInput');

const facultyEmailInput = document.getElementById('facultyEmailInput');

const facultyRoleInput = document.getElementById('facultyRoleInput');

const formMessage = document.getElementById('formMessage');

const saveFacultyBtn = document.getElementById('saveFacultyBtn');

const emptyState = document.getElementById('emptyState');

const errorState = document.getElementById('errorState');

const errorMessage = document.getElementById('errorMessage');

/* =========================================
   STATE
========================================= */

let facultyMembers = [];

let materialCounts = {};

let currentAdmin = null;

/* =========================================
   AUTH
========================================= */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  currentAdmin = user;

  console.log('Admin logged in:', user.email);

  try {
    const isAdmin = await checkAdminRole(user.uid);

    if (!isAdmin) {
      alert('You do not have permission to access Faculty Management.');

      await signOut(auth);

      window.location.href = 'login.html';

      return;
    }

    /* Display admin */

    if (adminEmail) {
      adminEmail.textContent = user.email || 'Administrator';
    }

    /* Load page */

    await loadPage();
  } catch (error) {
    console.error('Admin page error:', error);

    showError(getFirebaseErrorMessage(error));
  }
});

/* =========================================
   CHECK ADMIN ROLE
========================================= */

async function checkAdminRole(uid) {
  try {
    const userRef = doc(db, 'users', uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.error('Admin profile does not exist.');

      return false;
    }

    const data = snapshot.data();

    console.log('Current role:', data.role);

    return data.role === 'admin';
  } catch (error) {
    console.error('Role check failed:', error);

    throw error;
  }
}

/* =========================================
   LOAD PAGE
========================================= */

async function loadPage() {
  try {
    await loadMaterials();

    await loadFaculty();

    updateStatistics();

    renderFaculty(facultyMembers);
  } catch (error) {
    console.error('Page loading failed:', error);

    showError(getFirebaseErrorMessage(error));
  }
}

/* =========================================
   LOAD MATERIALS
========================================= */

async function loadMaterials() {
  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    materialCounts = {};

    let total = 0;

    snapshot.forEach((document) => {
      const material = document.data();

      const uid = material.uploadedByUid;

      if (uid) {
        if (!materialCounts[uid]) {
          materialCounts[uid] = 0;
        }

        materialCounts[uid]++;
      }

      total++;
    });

    if (facultyMaterials) {
      facultyMaterials.textContent = total;
    }
  } catch (error) {
    console.error('Materials loading failed:', error);

    throw error;
  }
}

/* =========================================
   LOAD FACULTY
========================================= */

async function loadFaculty() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));

    facultyMembers = [];

    snapshot.forEach((document) => {
      const data = document.data();

      if (data.role === 'faculty') {
        facultyMembers.push({
          id: document.id,

          ...data,
        });
      }
    });

    console.log('Faculty members:', facultyMembers);

    /* Sort by name */

    facultyMembers.sort((a, b) =>
      String(a.name || a.email || '').localeCompare(
        String(b.name || b.email || ''),
      ),
    );
  } catch (error) {
    console.error('Faculty loading failed:', error);

    throw error;
  }
}

/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {
  const total = facultyMembers.length;

  const active = facultyMembers.filter(
    (faculty) => faculty.status !== 'inactive',
  ).length;

  if (totalFaculty) {
    totalFaculty.textContent = total;
  }

  if (activeFaculty) {
    activeFaculty.textContent = active;
  }

  const totalMaterialCount = Object.values(materialCounts).reduce(
    (sum, value) => sum + value,
    0,
  );

  if (facultyMaterials) {
    facultyMaterials.textContent = totalMaterialCount;
  }
}

/* =========================================
   RENDER FACULTY
========================================= */

function renderFaculty(list) {
  if (!facultyContainer) {
    return;
  }

  if (resultCount) {
    resultCount.textContent = `${list.length} ${
      list.length === 1 ? 'faculty' : 'faculty members'
    }`;
  }

  /* Empty */

  if (list.length === 0) {
    facultyContainer.innerHTML = '';

    if (emptyState) {
      emptyState.classList.remove('hidden');
    }

    return;
  } else {
    if (emptyState) {
      emptyState.classList.add('hidden');
    }
  }

  facultyContainer.innerHTML = list.map(createFacultyRow).join('');
}

/* =========================================
   CREATE FACULTY ROW
========================================= */

function createFacultyRow(faculty) {
  const name = faculty.name || 'Faculty Member';

  const email = faculty.email || 'No email';

  const initial = getInitial(name, email);

  const materials = materialCounts[faculty.id] || 0;

  const role = faculty.role || 'faculty';

  const status = faculty.status === 'inactive' ? 'Inactive' : 'Active';

  return `

        <tr>

            <td>

                <div class="faculty-person">

                    <div class="faculty-avatar">

                        ${escapeHTML(initial)}

                    </div>


                    <div class="faculty-name">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <small>
                            Faculty ID:
                            ${escapeHTML(faculty.id)}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                <span class="email-cell">

                    ${escapeHTML(email)}

                </span>

            </td>


            <td>

                <span class="role-badge">

                    ${escapeHTML(role)}

                </span>

            </td>


            <td>

                <span class="material-count">

                    ${materials}

                </span>

            </td>


            <td>

                <span class="status-badge">

                    <span class="status-dot"></span>

                    ${status}

                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="delete-button"
                    data-id="${escapeAttribute(faculty.id)}"
                >
                    Remove
                </button>

            </td>

        </tr>

    `;
}

/* =========================================
   SEARCH
========================================= */

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const search = searchInput.value.trim().toLowerCase();

    if (!search) {
      renderFaculty(facultyMembers);

      return;
    }

    const filtered = facultyMembers.filter((faculty) => {
      const name = String(faculty.name || '').toLowerCase();

      const email = String(faculty.email || '').toLowerCase();

      return name.includes(search) || email.includes(search);
    });

    renderFaculty(filtered);
  });
}

/* =========================================
   OPEN MODAL
========================================= */

if (openAddFacultyBtn) {
  openAddFacultyBtn.addEventListener('click', () => {
    openModal();
  });
}

/* =========================================
   CLOSE MODAL
========================================= */

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener('click', closeModal);
}

/* Click outside */

if (facultyModal) {
  facultyModal.addEventListener('click', (event) => {
    if (event.target === facultyModal) {
      closeModal();
    }
  });
}

/* Escape key */

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    facultyModal &&
    !facultyModal.classList.contains('hidden')
  ) {
    closeModal();
  }
});

/* =========================================
   MODAL FUNCTIONS
========================================= */

function openModal() {
  if (!facultyModal) {
    return;
  }

  facultyModal.classList.remove('hidden');

  clearFormMessage();

  if (facultyForm) {
    facultyForm.reset();
  }

  setTimeout(() => {
    facultyNameInput?.focus();
  }, 50);
}

function closeModal() {
  if (!facultyModal) {
    return;
  }

  facultyModal.classList.add('hidden');

  clearFormMessage();

  if (facultyForm) {
    facultyForm.reset();
  }
}

/* =========================================
   ADD FACULTY
========================================= */

if (facultyForm) {
  facultyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = facultyNameInput.value.trim();

    const email = facultyEmailInput.value.trim().toLowerCase();

    const role = facultyRoleInput.value;

    if (!name) {
      showFormMessage('Please enter the faculty name.', 'error');

      return;
    }

    if (!email) {
      showFormMessage('Please enter the faculty email.', 'error');

      return;
    }

    try {
      setSavingState(true);

      /*
                    Check whether a faculty
                    profile with this email
                    already exists.
                */

      const existing = facultyMembers.some(
        (faculty) => String(faculty.email || '').toLowerCase() === email,
      );

      if (existing) {
        showFormMessage(
          'A faculty profile with this email already exists.',
          'error',
        );

        setSavingState(false);

        return;
      }

      /*
                    Create Firestore profile.

                    NOTE:
                    This does NOT create
                    Firebase Authentication.

                    The actual Auth account
                    should be created securely
                    through Firebase Admin SDK
                    or Firebase Console.
                */

      await addDoc(collection(db, 'users'), {
        name,

        email,

        role,

        status: 'active',

        createdAt: serverTimestamp(),

        createdBy: currentAdmin.uid,
      });

      showFormMessage('Faculty profile added successfully.', 'success');

      /*
                    Reload faculty list
                */

      await loadFaculty();

      updateStatistics();

      renderFaculty(facultyMembers);

      setTimeout(() => {
        closeModal();
      }, 900);
    } catch (error) {
      console.error('Add faculty failed:', error);

      showFormMessage(getFirebaseErrorMessage(error), 'error');
    } finally {
      setSavingState(false);
    }
  });
}

/* =========================================
   REMOVE FACULTY
========================================= */

if (facultyContainer) {
  facultyContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.delete-button');

    if (!button) {
      return;
    }

    const facultyId = button.dataset.id;

    if (!facultyId) {
      return;
    }

    const faculty = facultyMembers.find((item) => item.id === facultyId);

    if (!faculty) {
      return;
    }

    const confirmed = confirm(
      `Remove ${faculty.name || faculty.email} from the faculty directory?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      button.disabled = true;

      button.textContent = 'Removing...';

      await deleteDoc(doc(db, 'users', facultyId));

      facultyMembers = facultyMembers.filter((item) => item.id !== facultyId);

      updateStatistics();

      renderFaculty(facultyMembers);
    } catch (error) {
      console.error('Remove faculty failed:', error);

      alert(getFirebaseErrorMessage(error));

      button.disabled = false;

      button.textContent = 'Remove';
    }
  });
}

/* =========================================
   SAVING STATE
========================================= */

function setSavingState(saving) {
  if (!saveFacultyBtn) {
    return;
  }

  saveFacultyBtn.disabled = saving;

  saveFacultyBtn.textContent = saving ? 'Saving...' : 'Save Faculty';
}

/* =========================================
   FORM MESSAGE
========================================= */

function showFormMessage(message, type) {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = message;

  formMessage.className = `form-message ${type}`;
}

function clearFormMessage() {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = '';

  formMessage.className = 'form-message hidden';
}

/* =========================================
   ERROR STATE
========================================= */

function showError(message) {
  if (!errorState) {
    return;
  }

  if (errorMessage) {
    errorMessage.textContent =
      message || 'Please refresh the page and try again.';
  }

  errorState.classList.remove('hidden');

  if (facultyContainer) {
    facultyContainer.innerHTML = '';
  }
}

/* =========================================
   FIREBASE ERROR MESSAGE
========================================= */

function getFirebaseErrorMessage(error) {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  console.error(error);

  switch (error.code) {
    case 'permission-denied':

    case 'firestore/permission-denied':
      return 'Permission denied. Check your Firestore security rules.';

    case 'unavailable':

    case 'firestore/unavailable':
      return 'Firebase is temporarily unavailable. Please try again.';

    case 'failed-precondition':

    case 'firestore/failed-precondition':
      return 'Firestore configuration requires attention.';

    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/* =========================================
   INITIAL
========================================= */

function getInitial(name, email) {
  const source = name || email || 'F';

  return source.charAt(0).toUpperCase();
}

/* =========================================
   HTML ESCAPE
========================================= */

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

/* =========================================
   LOGOUT
========================================= */

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);

      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout failed:', error);

      alert('Unable to logout. Please try again.');
    }
  });
}
