import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signOut as signOutFaculty,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

import {
  initializeApp,
  getApps,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';

// ======================================================
// FIREBASE
// ======================================================

const adminAuth = getAuth(app);
const db = getFirestore(app);

// ======================================================
// DOM ELEMENTS — MATCHES YOUR CURRENT HTML
// ======================================================

const adminEmail = document.getElementById('adminEmail');

const totalFaculty = document.getElementById('totalFaculty');
const activeFaculty = document.getElementById('activeFaculty');
const facultyMaterials = document.getElementById('facultyMaterials');

const facultyContainer = document.getElementById('facultyContainer');
const searchInput = document.getElementById('searchInput');

const openAddFacultyBtn = document.getElementById('openAddFacultyBtn');

const facultyModal = document.getElementById('facultyModal');

const closeModalBtn = document.getElementById('closeModalBtn');

const cancelModalBtn = document.getElementById('cancelModalBtn');

const facultyForm = document.getElementById('facultyForm');

const facultyNameInput = document.getElementById('facultyNameInput');

const facultyEmailInput = document.getElementById('facultyEmailInput');

const facultyRoleInput = document.getElementById('facultyRoleInput');

const formMessage = document.getElementById('formMessage');

const saveFacultyBtn = document.getElementById('saveFacultyBtn');

const resultCount = document.getElementById('resultCount');

const emptyState = document.getElementById('emptyState');

const errorState = document.getElementById('errorState');

const errorMessage = document.getElementById('errorMessage');

const logoutBtn = document.getElementById('logoutBtn');

// ======================================================
// DATA
// ======================================================

let allFaculty = [];
let allMaterials = [];

// ======================================================
// CREATE MISSING PASSWORD + SUBJECT FIELDS
// ======================================================
// Your current HTML doesn't contain these fields.
// We create them dynamically so you don't have to
// replace the whole HTML right now.
// ======================================================

let facultyPasswordInput = null;
let facultySubjectInput = null;

function createMissingFormFields() {
  if (!facultyForm) {
    return;
  }

  // Find the form message
  const messageElement = document.getElementById('formMessage');

  // ----------------------------
  // Password field
  // ----------------------------

  if (!document.getElementById('facultyPasswordInput')) {
    const passwordGroup = document.createElement('div');

    passwordGroup.className = 'form-group';

    passwordGroup.innerHTML = `
      <label for="facultyPasswordInput">
        Temporary Password
      </label>

      <input
        type="password"
        id="facultyPasswordInput"
        placeholder="Enter password (minimum 6 characters)"
        minlength="6"
        autocomplete="new-password"
        required
      />

      <small style="
        display:block;
        margin-top:6px;
        color:#64748b;
        font-size:12px;
      ">
        Give this password to the faculty member. They can use it to sign in.
      </small>
    `;

    if (messageElement) {
      facultyForm.insertBefore(passwordGroup, messageElement);
    } else {
      facultyForm.appendChild(passwordGroup);
    }
  }

  // ----------------------------
  // Subject field
  // ----------------------------

  if (!document.getElementById('facultySubjectInput')) {
    const subjectGroup = document.createElement('div');

    subjectGroup.className = 'form-group';

    subjectGroup.innerHTML = `
      <label for="facultySubjectInput">
        Subject
      </label>

      <select
        id="facultySubjectInput"
        required
      >
        <option value="">Select subject</option>
        <option value="Physics">Physics</option>
        <option value="Chemistry">Chemistry</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Biology">Biology</option>
        <option value="Computer Science">Computer Science</option>
      </select>
    `;

    if (messageElement) {
      facultyForm.insertBefore(subjectGroup, messageElement);
    } else {
      facultyForm.appendChild(subjectGroup);
    }
  }

  facultyPasswordInput = document.getElementById('facultyPasswordInput');

  facultySubjectInput = document.getElementById('facultySubjectInput');
}

createMissingFormFields();

// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(adminAuth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const adminRef = doc(db, 'users', user.uid);

    const adminSnapshot = await getDoc(adminRef);

    if (!adminSnapshot.exists()) {
      await signOut(adminAuth);

      window.location.href = 'login.html';

      return;
    }

    const adminData = adminSnapshot.data();

    if (adminData.role !== 'admin') {
      alert('Access denied. Admin account required.');

      await signOut(adminAuth);

      window.location.href = 'login.html';

      return;
    }

    // ----------------------------
    // Admin information
    // ----------------------------

    if (adminEmail) {
      adminEmail.textContent = user.email || 'Administrator';
    }

    // ----------------------------
    // Load data
    // ----------------------------

    await loadFacultyData();
  } catch (error) {
    console.error('Admin authentication error:', error);

    alert('Unable to verify administrator access.');

    await signOut(adminAuth);

    window.location.href = 'login.html';
  }
});

// ======================================================
// LOAD FACULTY + MATERIALS
// ======================================================

async function loadFacultyData() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));

    const materialsSnapshot = await getDocs(collection(db, 'materials'));

    // ----------------------------
    // Faculty
    // ----------------------------

    allFaculty = [];

    usersSnapshot.forEach((userDoc) => {
      const data = userDoc.data();

      if (data.role === 'faculty') {
        allFaculty.push({
          id: userDoc.id,
          ...data,
        });
      }
    });

    // ----------------------------
    // Materials
    // ----------------------------

    allMaterials = [];

    materialsSnapshot.forEach((materialDoc) => {
      allMaterials.push({
        id: materialDoc.id,
        ...materialDoc.data(),
      });
    });

    // ----------------------------
    // Update UI
    // ----------------------------

    updateStatistics();

    renderFaculty(allFaculty);
  } catch (error) {
    console.error('Failed to load faculty:', error);

    if (errorState) {
      errorState.classList.remove('hidden');
    }

    if (errorMessage) {
      errorMessage.textContent =
        error.message || 'Unable to load faculty data.';
    }

    if (facultyContainer) {
      facultyContainer.innerHTML = '';
    }
  }
}

// ======================================================
// STATISTICS
// ======================================================

function updateStatistics() {
  const activeCount = allFaculty.filter(
    (faculty) => faculty.status !== 'inactive',
  ).length;

  if (totalFaculty) {
    totalFaculty.textContent = allFaculty.length;
  }

  if (activeFaculty) {
    activeFaculty.textContent = activeCount;
  }

  if (facultyMaterials) {
    facultyMaterials.textContent = allMaterials.length;
  }

  if (resultCount) {
    resultCount.textContent = `${allFaculty.length} ${
      allFaculty.length === 1 ? 'faculty' : 'faculty'
    }`;
  }
}

// ======================================================
// RENDER FACULTY
// ======================================================

function renderFaculty(facultyList) {
  if (!facultyContainer) {
    return;
  }

  // ----------------------------
  // Result count
  // ----------------------------

  if (resultCount) {
    resultCount.textContent = `${facultyList.length} ${
      facultyList.length === 1 ? 'faculty' : 'faculty'
    }`;
  }

  // ----------------------------
  // Empty state
  // ----------------------------

  if (facultyList.length === 0) {
    facultyContainer.innerHTML = '';

    if (emptyState) {
      emptyState.classList.remove('hidden');
    }

    return;
  }

  if (emptyState) {
    emptyState.classList.add('hidden');
  }

  // ----------------------------
  // Render table rows
  // ----------------------------

  facultyContainer.innerHTML = facultyList
    .map((faculty) => {
      const materialCount = allMaterials.filter(
        (material) => material.uploadedByUid === faculty.id,
      ).length;

      const status = faculty.status === 'inactive' ? 'Inactive' : 'Active';

      const firstLetter = (faculty.name || faculty.email || 'F')
        .charAt(0)
        .toUpperCase();

      return `
          <tr>

            <!-- FACULTY -->

            <td>

              <div class="faculty-person">

                <div class="faculty-avatar">
                  ${escapeHTML(firstLetter)}
                </div>

                <div class="faculty-name">

                  <strong>
                    ${escapeHTML(faculty.name || 'Unnamed Faculty')}
                  </strong>

                  <small>
                    ${escapeHTML(faculty.subject || 'Subject not assigned')}
                  </small>

                </div>

              </div>

            </td>


            <!-- EMAIL -->

            <td class="email-cell">
              ${escapeHTML(faculty.email || 'No email')}
            </td>


            <!-- ROLE -->

            <td>

              <span class="role-badge">
                Faculty
              </span>

            </td>


            <!-- MATERIALS -->

            <td>

              <span class="material-count">
                ${materialCount}
              </span>

            </td>


            <!-- STATUS -->

            <td>

              <span class="status-badge ${status.toLowerCase()}">

                <span class="status-dot"></span>

                ${status}

              </span>

            </td>


            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="delete-button"
                data-id="${escapeHTML(faculty.id)}"
                data-name="${escapeHTML(
                  faculty.name || faculty.email || 'Faculty',
                )}"
              >
                Remove
              </button>

            </td>

          </tr>
        `;
    })
    .join('');

  // ----------------------------
  // Remove buttons
  // ----------------------------

  document.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const facultyId = button.dataset.id;

      const facultyName = button.dataset.name;

      await removeFaculty(facultyId, facultyName);
    });
  });
}

// ======================================================
// SEARCH
// ======================================================

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
      renderFaculty(allFaculty);

      return;
    }

    const filtered = allFaculty.filter((faculty) => {
      const name = (faculty.name || '').toLowerCase();

      const email = (faculty.email || '').toLowerCase();

      const subject = (faculty.subject || '').toLowerCase();

      return (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        subject.includes(searchTerm)
      );
    });

    renderFaculty(filtered);
  });
}

// ======================================================
// OPEN MODAL
// ======================================================

if (openAddFacultyBtn) {
  openAddFacultyBtn.addEventListener('click', () => {
    openFacultyModal();
  });
}

function openFacultyModal() {
  if (!facultyModal) {
    return;
  }

  // Make sure dynamically created fields exist
  createMissingFormFields();

  // Reset form
  if (facultyForm) {
    facultyForm.reset();
  }

  // Change description
  const description = facultyModal.querySelector('.modal-description');

  if (description) {
    description.textContent =
      'Create a Firebase Authentication account and faculty profile for the portal.';
  }

  // Clear message
  if (formMessage) {
    formMessage.textContent = '';

    formMessage.className = 'form-message hidden';
  }

  // Open
  facultyModal.classList.remove('hidden');

  facultyModal.classList.add('active');

  setTimeout(() => {
    if (facultyNameInput) {
      facultyNameInput.focus();
    }
  }, 100);
}

// ======================================================
// CLOSE MODAL
// ======================================================

function closeFacultyModal() {
  if (!facultyModal) {
    return;
  }

  facultyModal.classList.remove('active');

  facultyModal.classList.add('hidden');

  if (facultyForm) {
    facultyForm.reset();
  }

  if (formMessage) {
    formMessage.textContent = '';

    formMessage.className = 'form-message hidden';
  }
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeFacultyModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener('click', closeFacultyModal);
}

// ======================================================
// CLOSE WHEN CLICKING OUTSIDE
// ======================================================

if (facultyModal) {
  facultyModal.addEventListener('click', (event) => {
    if (event.target === facultyModal) {
      closeFacultyModal();
    }
  });
}

// ======================================================
// CREATE FACULTY ACCOUNT
// ======================================================

if (facultyForm) {
  facultyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Make sure fields exist
    createMissingFormFields();

    const name = facultyNameInput.value.trim();

    const email = facultyEmailInput.value.trim().toLowerCase();

    const password = facultyPasswordInput.value;

    const subject = facultySubjectInput.value;

    // ----------------------------
    // Validation
    // ----------------------------

    if (!name || !email || !password || !subject) {
      showFormMessage('Please fill in all required fields.', 'error');

      return;
    }

    if (password.length < 6) {
      showFormMessage('Password must contain at least 6 characters.', 'error');

      return;
    }

    // ----------------------------
    // Button
    // ----------------------------

    const submitButton =
      saveFacultyBtn || facultyForm.querySelector('button[type="submit"]');

    const originalText = submitButton
      ? submitButton.textContent
      : 'Save Faculty';

    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent = 'Creating Account...';
    }

    let facultyAuth = null;

    try {
      // ==================================================
      // SECOND FIREBASE APP
      // ==================================================
      // This is important.
      //
      // The admin stays logged in while the faculty
      // Firebase Auth account is created.
      // ==================================================

      const facultyAppName = 'facultyCreationApp';

      let facultyApp;

      const existingApp = getApps().find(
        (firebaseApp) => firebaseApp.name === facultyAppName,
      );

      if (existingApp) {
        facultyApp = existingApp;
      } else {
        facultyApp = initializeApp(app.options, facultyAppName);
      }

      facultyAuth = getAuth(facultyApp);

      // ==================================================
      // CREATE AUTH ACCOUNT
      // ==================================================

      const credential = await createUserWithEmailAndPassword(
        facultyAuth,
        email,
        password,
      );

      const facultyUser = credential.user;

      // ==================================================
      // CREATE FIRESTORE PROFILE
      // ==================================================
      // IMPORTANT:
      // Document ID = Firebase Auth UID
      // ==================================================

      await setDoc(doc(db, 'users', facultyUser.uid), {
        uid: facultyUser.uid,

        name: name,

        email: email,

        subject: subject,

        role: 'faculty',

        status: 'active',

        createdAt: serverTimestamp(),

        createdBy: adminAuth.currentUser.uid,
      });

      // ==================================================
      // SIGN OUT SECONDARY AUTH
      // ==================================================

      await signOutFaculty(facultyAuth);

      // ==================================================
      // SUCCESS
      // ==================================================

      showFormMessage('Faculty account created successfully.', 'success');

      // Reload faculty directory
      await loadFacultyData();

      // Close after short delay
      setTimeout(() => {
        closeFacultyModal();
      }, 1200);
    } catch (error) {
      console.error('Create faculty error:', error);

      let message = 'Unable to create faculty account.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'A Firebase account with this email already exists.';

          break;

        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';

          break;

        case 'auth/weak-password':
          message = 'Password must contain at least 6 characters.';

          break;

        case 'auth/network-request-failed':
          message = 'Network error. Please check your internet connection.';

          break;

        case 'permission-denied':

        case 'firestore/permission-denied':
          message = 'You do not have permission to create the faculty profile.';

          break;

        default:
          if (
            error.message &&
            error.message.includes('Missing or insufficient permissions')
          ) {
            message =
              'Firestore permission denied. Check your Firestore rules.';
          }

          break;
      }

      showFormMessage(message, 'error');

      // If secondary Auth is active,
      // sign it out so admin session remains clean.

      if (facultyAuth) {
        try {
          await signOutFaculty(facultyAuth);
        } catch (signOutError) {
          console.warn('Secondary sign-out error:', signOutError);
        }
      }
    } finally {
      // ----------------------------
      // Restore button
      // ----------------------------

      if (submitButton) {
        submitButton.disabled = false;

        submitButton.textContent = originalText;
      }
    }
  });
}

// ======================================================
// FORM MESSAGE
// ======================================================

function showFormMessage(message, type) {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = message;

  formMessage.className = `form-message ${type}`;
}

// ======================================================
// REMOVE FACULTY PROFILE
// ======================================================

async function removeFaculty(facultyId, facultyName) {
  const confirmed = confirm(
    `Remove ${facultyName} from the faculty directory?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'users', facultyId));

    await loadFacultyData();

    alert('Faculty profile removed successfully.');
  } catch (error) {
    console.error('Remove faculty error:', error);

    alert('Unable to remove faculty profile.');
  }
}

// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(adminAuth);

      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}
