import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

const auth = getAuth(app);
const db = getFirestore(app);

// =====================================================
// DOM ELEMENTS
// =====================================================

const materialForm = document.getElementById('materialForm');

const classSelect = document.getElementById('classSelect');
const subjectSelect = document.getElementById('subjectSelect');
const chapterSelect = document.getElementById('chapterSelect');

const typeSelect = document.getElementById('typeSelect');

const titleInput = document.getElementById('titleInput');
const resourceURL = document.getElementById('resourceURL');
const descriptionInput = document.getElementById('descriptionInput');

const formMessage = document.getElementById('formMessage');

const facultyEmail = document.getElementById('facultyEmail');
const logoutBtn = document.getElementById('logoutBtn');

// =====================================================
// CHAPTER DATA
// =====================================================

const chapters = {
  11: {
    physics: [
      'Physical World',
      'Units and Measurements',
      'Motion in a Straight Line',
      'Motion in a Plane',
      'Laws of Motion',
      'Work, Energy and Power',
      'System of Particles and Rotational Motion',
      'Gravitation',
      'Mechanical Properties of Solids',
      'Mechanical Properties of Fluids',
      'Thermal Properties of Matter',
      'Thermodynamics',
      'Kinetic Theory',
      'Oscillations',
      'Waves',
    ],

    chemistry: [
      'Some Basic Concepts of Chemistry',
      'Structure of Atom',
      'Classification of Elements and Periodicity',
      'Chemical Bonding and Molecular Structure',
      'Thermodynamics',
      'Equilibrium',
      'Redox Reactions',
      'Organic Chemistry – Basic Principles',
      'Hydrocarbons',
      'Some Basic Principles of Organic Chemistry',
    ],

    mathematics: [
      'Sets',
      'Relations and Functions',
      'Trigonometric Functions',
      'Complex Numbers and Quadratic Equations',
      'Linear Inequalities',
      'Permutations and Combinations',
      'Binomial Theorem',
      'Sequences and Series',
      'Straight Lines',
      'Conic Sections',
      'Introduction to Three Dimensional Geometry',
      'Limits and Derivatives',
      'Statistics',
      'Probability',
    ],

    biology: [
      'The Living World',
      'Biological Classification',
      'Plant Kingdom',
      'Animal Kingdom',
      'Morphology of Flowering Plants',
      'Anatomy of Flowering Plants',
      'Structural Organisation in Animals',
      'Cell: The Unit of Life',
      'Biomolecules',
      'Cell Cycle and Cell Division',
      'Transport in Plants',
      'Mineral Nutrition',
      'Photosynthesis in Plants',
      'Respiration in Plants',
      'Plant Growth and Development',
      'Digestion and Absorption',
      'Breathing and Exchange of Gases',
      'Body Fluids and Circulation',
      'Excretory Products and their Elimination',
      'Locomotion and Movement',
      'Neural Control and Coordination',
      'Chemical Coordination and Integration',
    ],

    'computer-science': [
      'Computer Systems',
      'Python Programming',
      'Data Representation',
      'Boolean Logic',
      'Data Handling',
      'Society, Law and Ethics',
    ],
  },

  12: {
    physics: [
      'Electric Charges and Fields',
      'Electrostatic Potential and Capacitance',
      'Current Electricity',
      'Moving Charges and Magnetism',
      'Magnetism and Matter',
      'Electromagnetic Induction',
      'Alternating Current',
      'Electromagnetic Waves',
      'Ray Optics and Optical Instruments',
      'Wave Optics',
      'Dual Nature of Radiation and Matter',
      'Atoms',
      'Nuclei',
      'Semiconductor Electronics',
    ],

    chemistry: [
      'Solutions',
      'Electrochemistry',
      'Chemical Kinetics',
      'The d- and f-Block Elements',
      'Coordination Compounds',
      'Haloalkanes and Haloarenes',
      'Alcohols, Phenols and Ethers',
      'Aldehydes, Ketones and Carboxylic Acids',
      'Amines',
      'Biomolecules',
    ],

    mathematics: [
      'Relations and Functions',
      'Inverse Trigonometric Functions',
      'Matrices',
      'Determinants',
      'Continuity and Differentiability',
      'Application of Derivatives',
      'Integrals',
      'Application of Integrals',
      'Differential Equations',
      'Vector Algebra',
      'Three Dimensional Geometry',
      'Linear Programming',
      'Probability',
    ],

    biology: [
      'Sexual Reproduction in Flowering Plants',
      'Human Reproduction',
      'Reproductive Health',
      'Principles of Inheritance and Variation',
      'Molecular Basis of Inheritance',
      'Evolution',
      'Human Health and Disease',
      'Strategies for Enhancement in Food Production',
      'Microbes in Human Welfare',
      'Biotechnology: Principles and Processes',
      'Biotechnology and its Applications',
      'Organisms and Populations',
      'Ecosystem',
      'Biodiversity and Conservation',
    ],

    'computer-science': [
      'Computer Networks',
      'Database Concepts',
      'SQL',
      'Python Programming',
      'Data Structures',
      'Computer Security',
      'Society, Law and Ethics',
    ],
  },
};

// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';

    return;
  }

  if (facultyEmail) {
    facultyEmail.textContent = user.email;
  }
});

// =====================================================
// LOAD CHAPTERS
// =====================================================

function loadChapters() {
  const selectedClass = classSelect.value;
  const selectedSubject = subjectSelect.value;

  // Clear existing chapters

  chapterSelect.innerHTML = '';

  // Default option

  const defaultOption = document.createElement('option');

  defaultOption.value = '';

  defaultOption.textContent = 'Select chapter';

  chapterSelect.appendChild(defaultOption);

  // Nothing selected yet

  if (!selectedClass || !selectedSubject) {
    return;
  }

  // Get chapters

  const selectedChapters = chapters[selectedClass]?.[selectedSubject];

  if (!selectedChapters) {
    const option = document.createElement('option');

    option.value = '';

    option.textContent = 'No chapters available';

    chapterSelect.appendChild(option);

    return;
  }

  // Add chapters

  selectedChapters.forEach((chapter, index) => {
    const option = document.createElement('option');

    option.value = String(index + 1);

    option.textContent = `${index + 1}. ${chapter}`;

    option.dataset.chapterName = chapter;

    chapterSelect.appendChild(option);
  });
}

// =====================================================
// CLASS CHANGE
// =====================================================

classSelect.addEventListener('change', loadChapters);

// =====================================================
// SUBJECT CHANGE
// =====================================================

subjectSelect.addEventListener('change', loadChapters);

// =====================================================
// FORM SUBMIT
// =====================================================

materialForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const user = auth.currentUser;

  if (!user) {
    showMessage('Please login again before uploading.', 'error');

    return;
  }

  const classValue = classSelect.value;

  const subject = subjectSelect.value;

  const chapterNumber = chapterSelect.value;

  const selectedChapterOption =
    chapterSelect.options[chapterSelect.selectedIndex];

  const chapterName = selectedChapterOption?.dataset.chapterName || '';

  const type = typeSelect.value;

  const title = titleInput.value.trim();

  const url = resourceURL.value.trim();

  const description = descriptionInput.value.trim();

  if (!classValue || !subject || !chapterNumber || !type || !title || !url) {
    showMessage('Please fill in all required fields.', 'error');

    return;
  }

  try {
    const submitButton = materialForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    submitButton.innerHTML = 'Uploading...';

    await addDoc(collection(db, 'materials'), {
      class: classValue,

      subject: subject,

      // Store chapter number
      chapter: chapterNumber,

      // Store chapter name separately
      chapterName: chapterName,

      title: title,

      type: type,

      resourceURL: url,

      description: description,

      uploadedBy: user.email,

      uploadedByUid: user.uid,

      uploadedAt: serverTimestamp(),
    });

    showMessage('Material uploaded successfully.', 'success');

    materialForm.reset();

    loadChapters();
  } catch (error) {
    console.error('Upload error:', error);

    showMessage('Unable to upload material. Please try again.', 'error');
  } finally {
    const submitButton = materialForm.querySelector('button[type="submit"]');

    submitButton.disabled = false;

    submitButton.innerHTML = '<span>＋</span> Upload Material';
  }
});

// =====================================================
// MESSAGE
// =====================================================

function showMessage(message, type) {
  formMessage.textContent = message;

  formMessage.className = `form-message ${type}`;
}

// =====================================================
// LOGOUT
// =====================================================

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
