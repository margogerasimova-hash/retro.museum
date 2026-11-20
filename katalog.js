(() => {
  const typeFilter = document.querySelector('#type-filter');
  const decadeFilter = document.querySelector('#decade-filter');
  const nameSearch = document.querySelector('#name-search');
  const resultCount = document.querySelector('#result-count');
  const exhibitsList = document.querySelector('#exhibits-list');
  const emptyState = document.querySelector('#empty-state');
  const resetEmpty = document.querySelector('#reset-empty');

  let exhibits = [];

  const text = (value) => String(value ?? '');

  function addTypeOptions(items) {
    [...new Set(items.map((item) => text(item.type)).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'uk'))
      .forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.append(option);
      });
  }

  function cardTemplate(item) {
    const card = document.createElement('article');
    card.className = 'exhibit-card';

    const title = document.createElement('h3');
    title.textContent = text(item.name);
    card.append(title);

    const facts = document.createElement('dl');
    facts.className = 'exhibit-facts';
    [['Виробник', item.maker], ['Рік', item.year], ['Тип', item.type]].forEach(([label, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = text(value) || '—';
      facts.append(dt, dd);
    });
    card.append(facts);

    const description = document.createElement('p');
    description.className = 'exhibit-description';
    description.textContent = text(item.description);
    card.append(description);
    return card;
  }

  function getFiltered() {
    const type = typeFilter.value;
    const decade = decadeFilter.value;
    const query = nameSearch.value.trim().toLocaleLowerCase('uk');
    return exhibits.filter((item) => {
      const matchesType = !type || text(item.type) === type;
      const matchesDecade = !decade || text(item.decade) === decade;
      const matchesName = !query || text(item.name).toLocaleLowerCase('uk').includes(query);
      return matchesType && matchesDecade && matchesName;
    });
  }

  function render() {
    const filtered = getFiltered();
    exhibitsList.replaceChildren(...filtered.map(cardTemplate));
    resultCount.textContent = `Знайдено експонатів: ${filtered.length}`;
    emptyState.hidden = filtered.length !== 0;
    exhibitsList.hidden = filtered.length === 0;
  }

  function resetFilters() {
    typeFilter.value = '';
    decadeFilter.value = '';
    nameSearch.value = '';
    render();
    nameSearch.focus();
  }

  typeFilter.addEventListener('change', render);
  decadeFilter.addEventListener('change', render);
  nameSearch.addEventListener('input', render);
  resetEmpty.addEventListener('click', resetFilters);

  fetch('./data/eksponaty.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Не вдалося завантажити дані: ${response.status}`);
      return response.json();
    })
    .then((items) => {
      exhibits = Array.isArray(items) ? items : [];
      addTypeOptions(exhibits);
      render();
    })
    .catch(() => {
      exhibits = [];
      render();
    });
})();
