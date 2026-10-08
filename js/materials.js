import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');
const selectedSubject = params.get('subject');
const selectedChapter = params.get('chapter');

const classBreadcrumbLink = document.getElementById('classBreadcrumbLink');
const subjectBreadcrumb = document.getElementById('subjectBreadcrumb');
const subjectTitle = document.getElementById('subjectTitle');
const pageDescription = document.getElementById('pageDescription');
const chapterName = document.getElementById('chapterName');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const materialsContainer = document.getElementById('materialsContainer');
const resultCount = document.getElementById('resultCount');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

/* =========================================================
   SUBJECT NAMES
========================================================= */

const subjectNames = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  biology: 'Biology',
  'computer-science': 'Computer Science',
};

/* =========================================================
   CHAPTER DATA
========================================================= */

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
      'Classification of Elements and Periodicity in Properties',
      'Chemical Bonding and Molecular Structure',
      'Thermodynamics',
      'Equilibrium',
      'Redox Reactions',
      'Organic Chemistry – Some Basic Principles and Techniques',
      'Hydrocarbons',
    ],

    mathematics: [
      'Sets',
      'Relations and Functions',
      'Trigonometric Functions',
      'Principle of Mathematical Induction',
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
      'Photosynthesis in Higher Plants',
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
      'Encoding Schemes and Number System',
      'Emerging Trends',
      'Introduction to Python',
      'Getting Started with Python',
      'Python Basics',
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
      'd- and f-Block Elements',
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
      'Environmental Issues',
    ],

    'computer-science': [
      'Computer Networks',
      'Data Management',
      'Database Concepts',
      'Introduction to SQL',
      'Computer Science Applications',
      'Societal Impacts',
    ],
  },
};

/* =========================================================
   STATE
========================================================= */

let allMaterials = [];

/* =========================================================
   NORMALIZE
========================================================= */

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================
   SUBJECT NAME
========================================================= */

function getSubjectName(subject) {
  return subjectNames[normalize(subject)] || 'Science';
}

/* =========================================================
   CHAPTER NAME
========================================================= */

function getChapterName() {
  const classData = chapters[String(selectedClass)];

  if (!classData) {
    return 'Chapter';
  }

  const subjectData = classData[normalize(selectedSubject)];

  if (!subjectData) {
    return 'Chapter';
  }

  const chapterIndex = Number(selectedChapter) - 1;

  return subjectData[chapterIndex] || `Chapter ${selectedChapter}`;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(timestamp) {
  if (!timestamp) {
    return 'Recently added';
  }

  try {
    let date;

    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) {
      return 'Recently added';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recently added';
  }
}

/* =========================================================
   MATERIAL TYPE
========================================================= */

function getMaterialType(material) {
  return String(material.type || 'Study Material').trim();
}

/* =========================================================
   TYPE CLASS
========================================================= */

function getTypeClass(type) {
  const value = normalize(type);

  if (value.includes('note')) {
    return 'type-notes';
  }

  if (value.includes('important')) {
    return 'type-important';
  }

  if (value.includes('question')) {
    return 'type-question';
  }

  if (value.includes('resource')) {
    return 'type-resource';
  }

  return '';
}

/* =========================================================
   TYPE ICON
========================================================= */

function getTypeIcon(type) {
  const value = normalize(type);

  if (value.includes('note')) {
    return '📝';
  }

  if (value.includes('important')) {
    return '★';
  }

  if (value.includes('question')) {
    return '📄';
  }

  if (value.includes('resource')) {
    return '🔗';
  }

  return '📚';
}

/* =========================================================
   STATES
========================================================= */

function showLoading() {
  loadingState.hidden = false;
  emptyState.hidden = true;
  errorState.hidden = true;
  materialsContainer.innerHTML = '';
}

function hideLoading() {
  loadingState.hidden = true;
}

function showEmpty() {
  loadingState.hidden = true;
  errorState.hidden = true;
  emptyState.hidden = false;
  materialsContainer.innerHTML = '';
}

function showError(message) {
  loadingState.hidden = true;
  emptyState.hidden = true;
  errorState.hidden = false;
  errorMessage.textContent = message;
  materialsContainer.innerHTML = '';
}

/* =========================================================
   PAGE INFORMATION
========================================================= */

function setupPage() {
  const subjectName = getSubjectName(selectedSubject);
  const currentChapter = getChapterName();

  subjectBreadcrumb.textContent = subjectName;

  subjectTitle.textContent = `${subjectName} Study Materials`;

  chapterName.textContent = currentChapter;

  pageDescription.textContent = `Access study materials, notes, questions and academic resources for ${subjectName}.`;

  if (selectedClass) {
    classBreadcrumbLink.textContent = `Class ${selectedClass}`;

    classBreadcrumbLink.href = `class.html?class=${encodeURIComponent(selectedClass)}`;
  } else {
    classBreadcrumbLink.textContent = 'Classes';
    classBreadcrumbLink.href = 'class.html?class=11';
  }

  document.title = `${subjectName} Materials | CBSE Science Portal`;
}

/* =========================================================
   LOAD MATERIALS
========================================================= */

async function loadMaterials() {
  showLoading();

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    allMaterials = [];

    snapshot.forEach((documentSnapshot) => {
      allMaterials.push({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      });
    });

    /* FILTER BY CLASS / SUBJECT / CHAPTER */

    const classValue = normalize(selectedClass);
    const subjectValue = normalize(selectedSubject);
    const chapterValue = normalize(selectedChapter);

    allMaterials = allMaterials.filter((material) => {
      const materialClass = normalize(material.class);
      const materialSubject = normalize(material.subject);
      const materialChapter = normalize(material.chapter);

      return (
        materialClass === classValue &&
        materialSubject === subjectValue &&
        materialChapter === chapterValue
      );
    });

    /* SORT NEWEST FIRST */

    allMaterials.sort((a, b) => {
      const aDate = getTimestampValue(a.uploadedAt);
      const bDate = getTimestampValue(b.uploadedAt);

      return bDate - aDate;
    });

    hideLoading();

    applyFilters();
  } catch (error) {
    console.error('Failed to load materials:', error);

    showError('We could not load the study materials. Please try again.');
  }
}

/* =========================================================
   TIMESTAMP
========================================================= */

function getTimestampValue(timestamp) {
  if (!timestamp) {
    return 0;
  }

  try {
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().getTime();
    }

    if (timestamp.seconds) {
      return Number(timestamp.seconds) * 1000;
    }

    const date = new Date(timestamp);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  } catch {
    return 0;
  }
}

/* =========================================================
   FILTER
========================================================= */

function applyFilters() {
  const searchTerm = normalize(searchInput.value);

  const selectedType = normalize(typeFilter.value);

  const filtered = allMaterials.filter((material) => {
    const title = normalize(material.title);

    const description = normalize(material.description);

    const type = normalize(material.type);

    const matchesSearch =
      !searchTerm ||
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      type.includes(searchTerm);

    const matchesType =
      !selectedType ||
      selectedType === 'all' ||
      type === selectedType ||
      (selectedType === 'question paper' && type.includes('question')) ||
      (selectedType === 'important questions' && type.includes('important')) ||
      (selectedType === 'study material' && type.includes('study'));

    return matchesSearch && matchesType;
  });

  renderMaterials(filtered);
}

/* =========================================================
   RENDER MATERIALS
========================================================= */

function renderMaterials(materials) {
  if (!materials.length) {
    showEmpty();
    resultCount.textContent = 'No matching resources';
    return;
  }

  emptyState.hidden = true;
  errorState.hidden = true;
  loadingState.hidden = true;

  resultCount.textContent = `${materials.length} ${
    materials.length === 1 ? 'resource' : 'resources'
  } available`;

  materialsContainer.innerHTML = materials.map(createMaterialCard).join('');
}

/* =========================================================
   MATERIAL CARD
========================================================= */

function createMaterialCard(material) {
  const title = escapeHTML(material.title || 'Untitled Material');

  const description = escapeHTML(
    material.description || 'Academic study material for students.',
  );

  const type = getMaterialType(material);

  const safeType = escapeHTML(type);

  const typeClass = getTypeClass(type);

  const icon = getTypeIcon(type);

  const date = formatDate(material.uploadedAt);

  /* STUDENT VISIBLE CLASS */

  const className = escapeHTML(`Class ${selectedClass || ''}`);

  /* STUDENT VISIBLE SUBJECT */

  const subjectName = escapeHTML(getSubjectName(selectedSubject));

  /* RESOURCE URL */

  const resourceURL =
    material.resourceURL || material.fileURL || material.url || '';

  let actionHTML;

  if (resourceURL) {
    actionHTML = `
      <a
        href="${escapeHTML(resourceURL)}"
        class="card-action"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Resource
        <span>↗</span>
      </a>
    `;
  } else {
    actionHTML = `
      <span
        class="card-action"
        style="
          opacity:0.55;
          cursor:not-allowed;
        "
      >
        Resource unavailable
      </span>
    `;
  }

  return `

    <article class="material-card ${typeClass}">

      <div class="card-top">

        <div class="material-icon">
          ${icon}
        </div>

        <span class="material-type">
          ${safeType}
        </span>

      </div>


      <h3>
        ${title}
      </h3>


      <p class="material-description">
        ${description}
      </p>


      <div class="card-meta">

        <div class="meta-item">
          <span>🎓</span>
          <span>${className}</span>
        </div>


        <div class="meta-item">
          <span>📚</span>
          <span>${subjectName}</span>
        </div>


        <div class="meta-item">
          <span>◷</span>
          <span>${date}</span>
        </div>

      </div>


      ${actionHTML}

    </article>

  `;
}

/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener('input', applyFilters);

/* =========================================================
   TYPE FILTER
========================================================= */

typeFilter.addEventListener('change', applyFilters);

/* =========================================================
   RETRY
========================================================= */

retryBtn.addEventListener('click', loadMaterials);

/* =========================================================
   INITIALIZE
========================================================= */

setupPage();

loadMaterials();
