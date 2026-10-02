// ========================================
// GET URL PARAMETERS
// ========================================

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');
const selectedSubject = params.get('subject');
const selectedChapter = params.get('chapter');

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
  },
};

// ========================================
// GET PAGE ELEMENTS
// ========================================

const chapterTitle = document.getElementById('chapterTitle');

const chapterDescription = document.getElementById('chapterDescription');

const breadcrumbClass = document.getElementById('breadcrumbClass');

const breadcrumbSubject = document.getElementById('breadcrumbSubject');

const breadcrumbChapter = document.getElementById('breadcrumbChapter');

// ========================================
// FIND CHAPTER
// ========================================

const subjectName = subjectNames[selectedSubject];

const chapterList = chapters[selectedClass]?.[selectedSubject];

const chapterIndex = Number(selectedChapter) - 1;

const chapterName = chapterList?.[chapterIndex];

// ========================================
// DISPLAY INFORMATION
// ========================================

if (!selectedClass || !selectedSubject || !selectedChapter || !chapterName) {
  chapterTitle.textContent = 'Chapter Not Found';

  chapterDescription.textContent = 'Please select a valid chapter.';
} else {
  chapterTitle.textContent = chapterName;

  chapterDescription.textContent = `Class ${selectedClass} • ${subjectName}`;

  breadcrumbClass.textContent = `Class ${selectedClass}`;

  breadcrumbSubject.textContent = subjectName;

  breadcrumbChapter.textContent = chapterName;
}
