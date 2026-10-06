// ========================================
// GET URL PARAMETERS
// ========================================

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');
const selectedSubject = params.get('subject');

// ========================================
// PAGE ELEMENTS
// ========================================

const pageDescription = document.getElementById('pageDescription');

const subjectTitle = document.getElementById('subjectTitle');

const chapterContainer = document.getElementById('chapterContainer');

const subjectBreadcrumb = document.getElementById('subjectBreadcrumb');

const classBreadcrumbLink = document.getElementById('classBreadcrumbLink');

// ========================================
// SUBJECT NAMES
// ========================================

const subjectNames = {
  physics: 'Physics',

  chemistry: 'Chemistry',

  mathematics: 'Mathematics',

  biology: 'Biology',

  'computer-science': 'Computer Science',
};

// ========================================
// CHAPTER DATA
// ========================================

const chapters = {
  // ========================================
  // CLASS 11
  // ========================================

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

  // ========================================
  // CLASS 12
  // ========================================

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

// ========================================
// VALIDATE SELECTION
// ========================================

if (!selectedClass || !selectedSubject) {
  subjectTitle.textContent = 'Invalid Selection';

  pageDescription.textContent = 'Please select a class and subject.';

  subjectBreadcrumb.textContent = 'Subject';
} else {
  // Get subject name

  const subjectName = subjectNames[selectedSubject] || selectedSubject;

  // ========================================
  // UPDATE PAGE TITLE
  // ========================================

  subjectTitle.textContent = subjectName;

  // ========================================
  // UPDATE DESCRIPTION
  // ========================================

  pageDescription.textContent = `Explore ${subjectName} chapters and study materials.`;

  // ========================================
  // UPDATE BREADCRUMB
  // ========================================

  subjectBreadcrumb.textContent = subjectName;

  classBreadcrumbLink.textContent = `Class ${selectedClass}`;

  classBreadcrumbLink.href = `class.html?class=${selectedClass}`;
}

// ========================================
// GET CHAPTER LIST
// ========================================

const selectedChapters = chapters[selectedClass]?.[selectedSubject];

// ========================================
// CHECK CHAPTER DATA
// ========================================

if (!selectedChapters) {
  chapterContainer.innerHTML = `

        <div class="no-chapters">

            <h3>
                Chapters not available
            </h3>

            <p>
                Chapter information for this
                subject is not available yet.
            </p>

        </div>

    `;
}

// ========================================
// DISPLAY CHAPTERS
// ========================================
else {
  selectedChapters.forEach(function (chapter, index) {
    // ========================================
    // CREATE CARD
    // ========================================

    const chapterCard = document.createElement('div');

    chapterCard.className = 'chapter-card';

    // ========================================
    // CHAPTER NUMBER
    // ========================================

    const chapterNumber = String(index + 1).padStart(2, '0');

    // ========================================
    // MATERIAL URL
    // ========================================

    const materialURL = `materials.html?class=${selectedClass}&subject=${selectedSubject}&chapter=${index + 1}`;

    // ========================================
    // CARD HTML
    // ========================================

    chapterCard.innerHTML = `

                <div class="chapter-number">
                    ${chapterNumber}
                </div>


                <div class="chapter-content">

                    <h3>
                        ${chapter}
                    </h3>

                    <p>
                        Notes • Questions • Study Material
                    </p>

                    <a
                        href="${materialURL}"
                        class="chapter-link"
                    >
                        Explore Chapter
                        <span>→</span>
                    </a>

                </div>


                <div class="chapter-arrow">
                    →
                </div>

            `;

    // ========================================
    // ADD CARD TO PAGE
    // ========================================

    chapterContainer.appendChild(chapterCard);
  });
}
