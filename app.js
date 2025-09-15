

// --- Section Navigation ---
function showSection(id) {
  document.querySelectorAll('section').forEach(sec => {
    sec.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';
}

// Attach nav buttons
document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    showSection(target);
  });
});

// Start at home
document.addEventListener('DOMContentLoaded', () => {
  showSection('home');
});

