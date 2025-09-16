const glossaryList = document.getElementById('glossary-list');
const searchInput = document.getElementById('search');

let glossary = [];

// Load glossary from JSON
fetch('glossary.json')
  .then(res => res.json())
  .then(data => {
    glossary = data;
    displayGlossary(glossary);
  });

function displayGlossary(list) {
  glossaryList.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.term}</strong>: ${item.definition}`;
    glossaryList.appendChild(li);
  });
}

// Real-time search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = glossary.filter(item => 
    item.term.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query)
  );
  displayGlossary(filtered);
});
