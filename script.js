async function loadGlossary() {
  try {
    // GitHub Pages path fix
    const base = window.location.pathname.replace(/\/index\.html$/, '');
    const response = await fetch(`${base}/glossary.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    const glossary = await response.json();
    displayGlossary(glossary);
  } catch (error) {
    console.error('Error loading glossary:', error);
    document.getElementById('glossary-list').innerHTML = '<li>Failed to load glossary.</li>';
  }
}

function displayGlossary(glossary) {
  const list = document.getElementById('glossary-list');
  list.innerHTML = '';
  glossary.forEach(item => {
    const li = document.createElement('li');
    const term = document.createElement('h2');
    term.textContent = item.term;
    const definition = document.createElement('p');
    definition.textContent = item.definition;
    li.appendChild(term);
    li.appendChild(definition);
    list.appendChild(li);
  });
}

document.getElementById('search').addEventListener('input', (e) => {
  const filter = e.target.value.toLowerCase();
  const items = document.querySelectorAll('#glossary-list li');
  items.forEach(li => {
    const term = li.querySelector('h2').textContent.toLowerCase();
    const def = li.querySelector('p').textContent.toLowerCase();
    li.style.display = term.includes(filter) || def.includes(filter) ? '' : 'none';
  });
});

loadGlossary();
