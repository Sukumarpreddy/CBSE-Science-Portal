// ================================
// GET CLASS FROM URL
// ================================

const params = new URLSearchParams(window.location.search);

const selectedClass = params.get('class');

// ================================
// SHOW SELECTED CLASS
// ================================

const classTitle = document.getElementById('classTitle');

if (selectedClass === '12') {
  classTitle.textContent = 'Class 12';
} else {
  classTitle.textContent = 'Class 11';
}

// ================================
// SUBJECT NAVIGATION
// ================================

const subjectLinks = document.querySelectorAll('.subject-link');

subjectLinks.forEach(function (link) {
  link.addEventListener('click', function (event) {
    // Stop the # link from refreshing the page
    event.preventDefault();

    // Get subject
    const subject = this.dataset.subject;

    // Check subject in console
    console.log('Selected Class:', selectedClass);
    console.log('Selected Subject:', subject);

    // Open chapters page
    window.location.href = `chapters.html?class=${selectedClass}&subject=${subject}`;
  });
});
