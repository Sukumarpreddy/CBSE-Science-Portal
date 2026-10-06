// ======================================================
// CBSE SCIENCE PORTAL
// MATERIALS PAGE
// ======================================================

import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

// ======================================================
// FIRESTORE
// ======================================================

const db = getFirestore(app);

// ======================================================
// URL PARAMETERS
// ======================================================

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');
const selectedSubject = params.get('subject');
const selectedChapter = params.get('chapter');

// ======================================================
// DOM ELEMENTS
// ======================================================

const subjectTitle = document.getElementById('subjectTitle');
const pageDescription = document.getElementById('pageDescription');

const classBreadcrumbLink = document.getElementById('classBreadcrumbLink');

const subjectBreadcrumbLink = document.getElementById('subjectBreadcrumbLink');

const breadcrumbChapter = document.getElementById('breadcrumbChapter');

const materialContainer = document.getElementById('materialContainer');

const materialSearch = document.getElementById('materialSearch');

const materialTypeFilter = document.getElementById('materialTypeFilter');

const materialResultCount = document.getElementById('materialResultCount');

// ======================================================
// SUBJECT NAMES
// ======================================================

const subjectNames = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  biology: 'Biology',
  'computer-science': 'Computer Science',
};

// ======================================================
// CHAPTER NAMES
// ======================================================

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

// ======================================================
// HELPERS
// ======================================================

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeClass(value) {
  const valueText = normalize(value);

  if (
    valueText === '11' ||
    valueText === 'class 11' ||
    valueText === 'class11' ||
    valueText === '11th' ||
    valueText === '11th class'
  ) {
    return '11';
  }

  if (
    valueText === '12' ||
    valueText === 'class 12' ||
    valueText === 'class12' ||
    valueText === '12th' ||
    valueText === '12th class'
  ) {
    return '12';
  }

  return valueText.replace(/\D/g, '');
}

function normalizeSubject(value) {
  const valueText = normalize(value);

  const subjectMap = {
    physics: 'physics',
    chemistry: 'chemistry',
    mathematics: 'mathematics',
    maths: 'mathematics',
    math: 'mathematics',
    biology: 'biology',
    'computer science': 'computer-science',
    'computer-science': 'computer-science',
    computerscience: 'computer-science',
  };

  return subjectMap[valueText] || valueText;
}

function getChapterName() {
  const classData = chapters[selectedClass];
  const subjectData = classData?.[selectedSubject];

  if (!subjectData) {
    return 'Chapter';
  }

  const chapterNumber = Number(selectedChapter);

  if (
    Number.isInteger(chapterNumber) &&
    chapterNumber >= 1 &&
    chapterNumber <= subjectData.length
  ) {
    return subjectData[chapterNumber - 1];
  }

  return 'Chapter';
}

function normalizeChapter(value) {
  return normalize(value)
    .replace(/^chapter\s*/i, '')
    .trim();
}

function isMatchingChapter(materialChapter, requestedChapter, chapterName) {
  const materialValue = normalizeChapter(materialChapter);
  const requestedValue = normalizeChapter(requestedChapter);
  const chapterNameValue = normalizeChapter(chapterName);

  // Chapter number
  if (materialValue === requestedValue) {
    return true;
  }

  // Chapter name
  if (materialValue === chapterNameValue) {
    return true;
  }

  // Example:
  // Firebase: "Chapter 5"
  // URL: 5
  if (materialValue.replace(/\D/g, '') === requestedValue.replace(/\D/g, '')) {
    return true;
  }

  return false;
}

// ======================================================
// PAGE DATA
// ======================================================

const chapterName = getChapterName();

const subjectName =
  subjectNames[selectedSubject] || selectedSubject || 'Subject';

// ======================================================
// UPDATE PAGE
// ======================================================

function updatePage() {
  if (subjectTitle) {
    subjectTitle.textContent = chapterName;
  }

  if (pageDescription) {
    pageDescription.textContent = `Study materials for Class ${selectedClass} ${subjectName}.`;
  }

  if (classBreadcrumbLink) {
    classBreadcrumbLink.textContent = `Class ${selectedClass}`;

    classBreadcrumbLink.href = `class.html?class=${selectedClass}`;
  }

  if (subjectBreadcrumbLink) {
    subjectBreadcrumbLink.textContent = subjectName;

    subjectBreadcrumbLink.href = `chapters.html?class=${selectedClass}&subject=${selectedSubject}`;
  }

  if (breadcrumbChapter) {
    breadcrumbChapter.textContent = chapterName;
  }
}

updatePage();

// ======================================================
// MATERIAL DATA
// ======================================================

let allMaterials = [];

// ======================================================
// LOADING UI
// ======================================================

function showLoading() {
  materialResultCount.textContent = 'Loading study resources...';

  materialContainer.innerHTML = `
    <div class="materials-loading">

      <div class="loading-card">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-button"></div>
      </div>

      <div class="loading-card">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-button"></div>
      </div>

    </div>
  `;
}

// ======================================================
// LOAD FIREBASE MATERIALS
// ======================================================

async function loadMaterials() {
  showLoading();

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    allMaterials = [];

    snapshot.forEach((docSnapshot) => {
      const material = docSnapshot.data();

      allMaterials.push({
        id: docSnapshot.id,
        ...material,
      });
    });

    console.log('Firebase materials:', allMaterials);

    // ==================================================
    // NORMALIZED TARGET VALUES
    // ==================================================

    const targetClass = normalizeClass(selectedClass);

    const targetSubject = normalizeSubject(selectedSubject);

    // ==================================================
    // FILTER MATERIALS
    // ==================================================

    allMaterials = allMaterials.filter((material) => {
      const materialClass = normalizeClass(material.class);

      const materialSubject = normalizeSubject(material.subject);

      const classMatches = materialClass === targetClass;

      const subjectMatches = materialSubject === targetSubject;

      const chapterMatches = isMatchingChapter(
        material.chapter,
        selectedChapter,
        chapterName,
      );

      console.log('Checking material:', {
        title: material.title,
        firebaseClass: material.class,
        normalizedClass: materialClass,
        firebaseSubject: material.subject,
        normalizedSubject: materialSubject,
        firebaseChapter: material.chapter,
        classMatches,
        subjectMatches,
        chapterMatches,
      });

      return classMatches && subjectMatches && chapterMatches;
    });

    console.log('Matched materials:', allMaterials);

    renderMaterials();
  } catch (error) {
    console.error('Firebase materials error:', error);

    materialResultCount.textContent = 'Unable to load resources';

    materialContainer.innerHTML = `
      <div class="materials-error">

        <div class="state-icon">!</div>

        <h3>
          Unable to load resources
        </h3>

        <p>
          We couldn't connect to the study
          materials database. Please try again.
        </p>

        <button
          class="retry-btn"
          onclick="location.reload()"
        >
          Try Again
        </button>

      </div>
    `;
  }
}

// ======================================================
// RENDER MATERIALS
// ======================================================

function renderMaterials() {
  const searchText = normalize(materialSearch?.value);

  const selectedType = normalize(materialTypeFilter?.value || 'all');

  const filteredMaterials = allMaterials.filter((material) => {
    const title = normalize(material.title);

    const description = normalize(material.description);

    const type = normalize(material.type);

    const searchMatches =
      !searchText ||
      title.includes(searchText) ||
      description.includes(searchText) ||
      type.includes(searchText);

    const typeMatches = selectedType === 'all' || type === selectedType;

    return searchMatches && typeMatches;
  });

  // ==================================================
  // RESULT COUNT
  // ==================================================

  const count = filteredMaterials.length;

  materialResultCount.textContent = `${count} material${count !== 1 ? 's' : ''} available`;

  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (count === 0) {
    materialContainer.innerHTML = `
      <div class="materials-empty">

        <div class="empty-icon">
          <span>⌕</span>
        </div>

        <h3>
          No materials found
        </h3>

        <p>
          There are no study resources matching
          your current search or filter.
        </p>

        <button
          class="clear-search-btn"
          id="clearSearchBtn"
        >
          Clear Filters
        </button>

      </div>
    `;

    const clearButton = document.getElementById('clearSearchBtn');

    clearButton?.addEventListener('click', () => {
      if (materialSearch) {
        materialSearch.value = '';
      }

      if (materialTypeFilter) {
        materialTypeFilter.value = 'all';
      }

      renderMaterials();
    });

    return;
  }

  // ==================================================
  // MATERIAL GRID
  // ==================================================

  materialContainer.innerHTML = '';

  filteredMaterials.forEach((material, index) => {
    const card = document.createElement('article');

    card.className = 'material-card';

    const title = material.title || 'Untitled Material';

    const description =
      material.description || 'Study material uploaded by faculty.';

    const type = formatMaterialType(material.type);

    const resourceURL =
      material.resourceURL || material.fileURL || material.url || '#';

    card.innerHTML = `

        <div class="material-card-top">

          <div class="material-file-icon">
            <span>PDF</span>
          </div>

          <span class="material-type">
            ${escapeHTML(type)}
          </span>

        </div>

        <div class="material-card-content">

          <div class="material-number">
  STUDY RESOURCE ${String(index + 1).padStart(2, '0')}
</div>

          <h3>
            ${escapeHTML(title)}
          </h3>

          <p>
            ${escapeHTML(description)}
          </p>

        </div>

        <div class="material-card-footer">

          <span class="material-source">
            Faculty Resource
          </span>

          <a
            href="${escapeAttribute(resourceURL)}"
            class="material-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resource
            <span>→</span>
          </a>

        </div>

      `;

    materialContainer.appendChild(card);
  });
}

// ======================================================
// MATERIAL TYPE
// ======================================================

function formatMaterialType(type) {
  const normalized = normalize(type);

  const typeMap = {
    notes: 'Notes',

    'important-questions': 'Important Questions',

    'study-material': 'Study Material',

    assignment: 'Assignment',

    'previous-year': 'Previous Year Questions',
  };

  return typeMap[normalized] || type || 'Study Material';
}

// ======================================================
// SEARCH
// ======================================================

materialSearch?.addEventListener('input', renderMaterials);

// ======================================================
// FILTER
// ======================================================

materialTypeFilter?.addEventListener('change', renderMaterials);

// ======================================================
// SECURITY HELPERS
// ======================================================

function escapeHTML(value) {
  const div = document.createElement('div');

  div.textContent = String(value);

  return div.innerHTML;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ======================================================
// VALIDATE PAGE
// ======================================================

if (selectedClass && selectedSubject && selectedChapter) {
  loadMaterials();
} else {
  materialResultCount.textContent = 'Invalid chapter selection';

  materialContainer.innerHTML = `
    <div class="materials-error">

      <div class="state-icon">!</div>

      <h3>
        Invalid chapter
      </h3>

      <p>
        Please select a chapter from
        the chapters page.
      </p>

      <a
        href="index.html"
        class="retry-btn"
      >
        Back to Home
      </a>

    </div>
  `;
}
