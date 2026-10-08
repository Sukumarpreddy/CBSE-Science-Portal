/* =========================================================
   CBSE SCIENCE PORTAL
   CHAPTERS
========================================================= */

/* =========================================================
   URL PARAMETERS
========================================================= */

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');

const selectedSubject = params.get('subject');

/* =========================================================
   DOM
========================================================= */

const classBreadcrumbLink = document.getElementById('classBreadcrumbLink');

const subjectBreadcrumb = document.getElementById('subjectBreadcrumb');

const subjectTitle = document.getElementById('subjectTitle');

const pageDescription = document.getElementById('pageDescription');

const classBadge = document.getElementById('classBadge');

const chapterCount = document.getElementById('chapterCount');

const chapterContainer = document.getElementById('chapterContainer');

const chapterSearch = document.getElementById('chapterSearch');

const emptyState = document.getElementById('emptyState');

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
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================
   GET SUBJECT
========================================================= */

const subjectKey = normalize(selectedSubject);

const subjectName = subjectNames[subjectKey] || 'Science';

/* =========================================================
   GET CHAPTERS
========================================================= */

function getCurrentChapters() {
  if (!selectedClass) {
    return [];
  }

  const classData = chapters[String(selectedClass)];

  if (!classData) {
    return [];
  }

  return classData[subjectKey] || [];
}

/* =========================================================
   PAGE SETUP
========================================================= */

function setupPage() {
  classBadge.textContent = selectedClass || '--';

  subjectBreadcrumb.textContent = subjectName;

  subjectTitle.textContent = subjectName;

  pageDescription.textContent = `Explore ${subjectName} chapters for Class ${selectedClass || ''} and access the available study resources.`;

  document.title = `${subjectName} Chapters | CBSE Science Portal`;

  if (selectedClass) {
    classBreadcrumbLink.textContent = `Class ${selectedClass}`;

    classBreadcrumbLink.href = `class.html?class=${encodeURIComponent(
      selectedClass,
    )}`;
  } else {
    classBreadcrumbLink.textContent = 'Classes';

    classBreadcrumbLink.href = 'class.html?class=11';
  }
}

/* =========================================================
   RENDER CHAPTERS
========================================================= */

function renderChapters(chapterList = getCurrentChapters()) {
  if (!chapterList.length) {
    chapterContainer.innerHTML = '';

    emptyState.hidden = false;

    chapterCount.textContent = 'No chapters available.';

    return;
  }

  emptyState.hidden = true;

  chapterCount.textContent = `${chapterList.length} ${
    chapterList.length === 1 ? 'chapter' : 'chapters'
  } available`;

  chapterContainer.innerHTML = chapterList
    .map((chapter, index) => {
      const chapterNumber = index + 1;

      return `

                        <a
                            class="chapter-card"
                            href="materials.html?class=${encodeURIComponent(
                              selectedClass,
                            )}&subject=${encodeURIComponent(
                              selectedSubject,
                            )}&chapter=${chapterNumber}"
                        >

                            <div>

                                <div class="chapter-number">

                                    <span
                                        class="chapter-index"
                                    >
                                        ${String(chapterNumber).padStart(
                                          2,
                                          '0',
                                        )}
                                    </span>

                                    <span
                                        class="chapter-arrow"
                                    >
                                        →
                                    </span>

                                </div>


                                <h3>
                                    ${escapeHTML(chapter)}
                                </h3>

                            </div>


                            <div
                                class="chapter-card-footer"
                            >

                                <span>
                                    Chapter
                                    ${chapterNumber}
                                </span>

                                <span>
                                    View materials
                                </span>

                            </div>

                        </a>

                    `;
    })
    .join('');
}

/* =========================================================
   SEARCH
========================================================= */

function searchChapters() {
  const searchTerm = normalize(chapterSearch.value);

  const allChapters = getCurrentChapters();

  if (!searchTerm) {
    renderChapters(allChapters);

    return;
  }

  const filtered = allChapters.filter((chapter) =>
    normalize(chapter).includes(searchTerm),
  );

  renderChapters(filtered);
}

chapterSearch.addEventListener('input', searchChapters);

/* =========================================================
   INITIALIZE
========================================================= */

setupPage();

renderChapters();
