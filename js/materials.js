import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';

import { app } from './firebase.js';

// Firebase
const db = getFirestore(app);

// Get URL parameters
const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');
const selectedSubject = params.get('subject');
const selectedChapter = params.get('chapter');

// HTML elements
const chapterTitle = document.getElementById('chapterTitle');
const chapterDescription = document.getElementById('chapterDescription');
const subjectTitle = document.getElementById('subjectTitle');
const materialContainer = document.getElementById('materialContainer');
const breadcrumbClass = document.getElementById('breadcrumbClass');
const breadcrumbChapter = document.getElementById('breadcrumbChapter');
// Subject names
const subjectNames = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  biology: 'Biology',
  'computer-science': 'Computer Science',
};

// Chapter names
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

// Get chapter name
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

// Page title
chapterTitle.textContent = chapterName;

subjectTitle.textContent = subjectNames[selectedSubject] || selectedSubject;

chapterDescription.textContent = `Study materials for Class ${selectedClass} ${subjectNames[selectedSubject] || ''}.`;
breadcrumbClass.textContent = selectedClass;
breadcrumbChapter.textContent = chapterName;
// Load materials
async function loadMaterials() {
  materialContainer.innerHTML = '<p>Loading materials...</p>';

  try {
    const snapshot = await getDocs(collection(db, 'materials'));

    let foundMaterials = [];

    snapshot.forEach(function (doc) {
      const material = doc.data();

      const materialClass = String(material.class || '');

      const materialSubject = String(material.subject || '').toLowerCase();

      const materialChapter = String(material.chapter || '').toLowerCase();

      const expectedChapter = `chapter ${selectedChapter}`;

      if (
        materialClass === String(selectedClass) &&
        materialSubject === String(selectedSubject).toLowerCase() &&
        (materialChapter.includes(expectedChapter) ||
          materialChapter.includes(chapterName.toLowerCase()))
      ) {
        foundMaterials.push(material);
      }
    });

    displayMaterials(foundMaterials);
  } catch (error) {
    console.error('Error loading materials:', error);

    materialContainer.innerHTML = `
            <div class="no-chapters">
                <h3>Unable to load materials</h3>
                <p>Please try again later.</p>
            </div>
        `;
  }
}

// Display materials
function displayMaterials(materials) {
  if (materials.length === 0) {
    materialContainer.innerHTML = `
            <div class="no-chapters">
                <h3>No materials available yet</h3>
                <p>
                    Faculty has not uploaded materials
                    for this chapter yet.
                </p>
            </div>
        `;

    return;
  }

  materialContainer.innerHTML = '';

  materials.forEach(function (material) {
    const card = document.createElement('div');

    card.className = 'material-card';

    card.innerHTML = `

            <div class="material-icon">
                📚
            </div>

            <h3>
                ${material.title || 'Study Material'}
            </h3>

            <p>
                ${material.description || 'Study resource'}
            </p>

            <span class="material-type">
                ${material.type || 'Material'}
            </span>

            <a
                href="${material.resourceURL}"
                target="_blank"
                rel="noopener noreferrer"
                class="material-btn"
            >
                View Resource →
            </a>

        `;

    materialContainer.appendChild(card);
  });
}

// Start
loadMaterials();
