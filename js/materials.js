import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

/* ========================================
   FIREBASE
======================================== */

const db = getFirestore(app);

/* ========================================
   URL PARAMETERS
======================================== */

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');

const selectedSubject = params.get('subject');

const selectedChapter = params.get('chapter');

/* ========================================
   HTML ELEMENTS
======================================== */

const chapterTitle = document.getElementById('chapterTitle');

const chapterDescription = document.getElementById('chapterDescription');

const subjectTitle = document.getElementById('subjectTitle');

const materialContainer = document.getElementById('materialContainer');

const breadcrumbClass = document.getElementById('breadcrumbClass');

const breadcrumbChapter = document.getElementById('breadcrumbChapter');

const materialSearch = document.getElementById('materialSearch');

const materialTypeFilter = document.getElementById('materialTypeFilter');

const materialResultCount = document.getElementById('materialResultCount');

/* ========================================
   SUBJECT NAMES
======================================== */

const subjectNames = {
  physics: 'Physics',

  chemistry: 'Chemistry',

  mathematics: 'Mathematics',

  biology: 'Biology',

  'computer-science': 'Computer Science',
};

/* ========================================
   CHAPTER DATA
======================================== */

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

/* ========================================
   FIND CHAPTER NAME
======================================== */

let chapterName = 'Chapter';

if (
  chapters[selectedClass] &&
  chapters[selectedClass][selectedSubject] &&
  selectedChapter
) {
  const chapterIndex = Number(selectedChapter) - 1;

  chapterName =
    chapters[selectedClass][selectedSubject][chapterIndex] ||
    `Chapter ${selectedChapter}`;
}

/* ========================================
   PAGE INFORMATION
======================================== */

chapterTitle.textContent = chapterName;

subjectTitle.textContent = subjectNames[selectedSubject] || selectedSubject;

chapterDescription.textContent = `Study materials for Class ${selectedClass} ${
  subjectNames[selectedSubject] || ''
}`;

breadcrumbClass.textContent = selectedClass;

breadcrumbChapter.textContent = chapterName;

/* ========================================
   DATA
======================================== */

let allMaterials = [];

/* ========================================
   LOAD MATERIALS
======================================== */

async function loadMaterials() {
  materialContainer.innerHTML = `
        <p>Loading materials...</p>
    `;

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    allMaterials = [];

    snapshot.forEach(function (docSnapshot) {
      const material = docSnapshot.data();

      const materialClass = String(material.class || '');

      const materialSubject = String(material.subject || '').toLowerCase();

      const materialChapter = String(material.chapter || '').toLowerCase();

      const expectedChapter = `chapter ${selectedChapter}`;

      if (
        materialClass === String(selectedClass) &&
        materialSubject === String(selectedSubject).toLowerCase() &&
        (materialChapter.includes(expectedChapter) ||
          materialChapter.includes(chapterName.toLowerCase()) ||
          materialChapter === String(selectedChapter).toLowerCase())
      ) {
        allMaterials.push({
          id: docSnapshot.id,

          ...material,
        });
      }
    });

    applyFilters();
  } catch (error) {
    console.error('Error loading materials:', error);

    materialContainer.innerHTML = `

            <div class="no-chapters">

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

/* ========================================
   FILTER MATERIALS
======================================== */

function applyFilters() {
  const search = materialSearch
    ? materialSearch.value.trim().toLowerCase()
    : '';

  const selectedType = materialTypeFilter ? materialTypeFilter.value : 'all';

  const filtered = allMaterials.filter(function (material) {
    const title = String(material.title || '').toLowerCase();

    const description = String(material.description || '').toLowerCase();

    const type = String(material.type || '').toLowerCase();

    const matchesSearch =
      !search || title.includes(search) || description.includes(search);

    const matchesType = selectedType === 'all' || type === selectedType;

    return matchesSearch && matchesType;
  });

  displayMaterials(filtered);
}

/* ========================================
   DISPLAY MATERIALS
======================================== */

function displayMaterials(materials) {
  if (materialResultCount) {
    materialResultCount.textContent = `${materials.length} material${
      materials.length === 1 ? '' : 's'
    } available`;
  }

  if (materials.length === 0) {
    materialContainer.innerHTML = `

            <div class="no-chapters">

                <h3>
                    No materials found
                </h3>

                <p>
                    Faculty has not uploaded
                    matching materials yet.
                </p>

            </div>

        `;

    return;
  }

  materialContainer.innerHTML = '';

  materials.forEach(function (material) {
    const card = document.createElement('div');

    card.className = 'material-card';

    const resourceURL = material.resourceURL || material.fileURL || '';

    card.innerHTML = `

                <div class="material-icon">
                    📚
                </div>


                <h3>
                    ${escapeHTML(material.title || 'Study Material')}
                </h3>


                <p>
                    ${escapeHTML(material.description || 'Study resource')}
                </p>


                <span class="material-type">
                    ${escapeHTML(material.type || 'Material')}
                </span>


                ${
                  resourceURL
                    ? `
                    <a
                        href="${escapeAttribute(resourceURL)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="material-btn"
                    >
                        View Resource →
                    </a>
                    `
                    : `
                    <span class="material-btn disabled">
                        Resource unavailable
                    </span>
                    `
                }

            `;

    materialContainer.appendChild(card);
  });
}

/* ========================================
   SEARCH EVENTS
======================================== */

if (materialSearch) {
  materialSearch.addEventListener('input', applyFilters);
}

if (materialTypeFilter) {
  materialTypeFilter.addEventListener('change', applyFilters);
}

/* ========================================
   SECURITY HELPERS
======================================== */

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

/* ========================================
   START
======================================== */

loadMaterials();
