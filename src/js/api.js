// import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { refs } from './refs';
import { getAPI, generateContent, pasteContent } from './popularRender';
import {
  getMovieNameAPI,
  generateContentNameAPI,
  pasteContentNameAPI,
} from './renderByName';
import {
  BASE_URL,
  KEY,
  IMG_URL,
  API_URL,
  POPULAR_URL,
  BASE_FIND_WORD_URL,
} from './url';

// ==============================================================

import Pagination from 'tui-pagination';
// import 'tui-pagination/dist/tui-pagination.css';

// ================================================================
// сохраняем слово в инпуте
let searchInput = '';

if (JSON.parse(localStorage.getItem('searchWord'))) {
  searchInput = JSON.parse(localStorage.getItem('searchWord'));
  refs.input.value = searchInput;
} else {
  localStorage.setItem('searchWord', JSON.stringify(searchInput));
}
console.dir(refs.input);
refs.input.addEventListener('input', listenInput);

function listenInput(event) {
  console.log(event.currentTarget.value);
  localStorage.setItem('searchWord', JSON.stringify(event.currentTarget.value));
}
// сохранение поиска
let searchData = '';

if (JSON.parse(localStorage.getItem('search'))) {
  searchData = JSON.parse(localStorage.getItem('search'));
  refs.input.value = searchData;
} else {
  localStorage.setItem('search', JSON.stringify(searchData));
}

//* рейтинг популярний фільмів при загрузці і перезавантаженні сайта

let statusSearch = false;
let statusSearchForm = false;

refs.logo.addEventListener('click', clearLOacalStorageOnLogo);
function clearLOacalStorageOnLogo() {
  localStorage.removeItem('search');
  localStorage.removeItem('searchWord');
  localStorage.removeItem('pagination');
}

//* запит і рендер фільмів за назвою
async function handleSubmit(event) {
  event.preventDefault();

  const movie = event.currentTarget.elements.search.value.trim().toLowerCase();
  localStorage.setItem('search', JSON.stringify(movie));
  localStorage.setItem('pagination', 1);
  localStorage.setItem('searchWord', 0);
  searchData = JSON.parse(localStorage.getItem('search'));

  if (!movie) {
    Notify.info(
      'Sorry, there are no movies matching your search query. Please try again.'
    );
    return;
  }
  refs.list.innerHTML = '';
  await getMovieNameAPI(movie)
  
  console.log(JSON.parse(
    localStorage.getItem('itemsPerPage')
  ))
  console.log(JSON.parse(
    localStorage.getItem('totalItems')
  ))
  statusSearch = true;

  // пагінація по пошуку
  const options = {
  totalItems: JSON.parse(
    localStorage.getItem('totalItems')
  ),
  itemsPerPage: JSON.parse(
    localStorage.getItem('itemsPerPage')
  ),
  visiblePages: 5,
  page: 1,
  centerAlign: true,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage:
      '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

  const pagination = new Pagination('pagination', options);
    pagination.movePageTo(1);
  pagination._options.totalItems = JSON.parse(
    localStorage.getItem('totalItems')
  );
  pagination._options.itemsPerPage = JSON.parse(
    localStorage.getItem('itemsPerPage')
  );
  console.log(pagination);
pagination.on('afterMove', async function (eventData) {
  resetGallery();

  getMovieNameAPI(movie, eventData.page);
  
  localStorage.setItem('pagination', eventData.page);
});
}

refs.form.addEventListener('submit', handleSubmit);

// пагінація
const optionsPop = {
 totalItems: 20000,
  itemsPerPage: 20,
  visiblePages: 5,
  page: 1,
  centerAlign: true,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage:
      '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

const paginationPop = new Pagination('pagination', optionsPop);

paginationPop.on('afterMove', async function (eventData) {
  resetGallery();

  // if (searchData) {
  //   if (statusSearch) {
  //     statusSearch = false;
  //   } else {
  //     getMovieNameAPI(searchData, eventData.page);
  //   }
  // } else {
  //   if (statusSearchForm) {
  //     console.log('statusSearchForm');
  //     // statusSearchForm = false;
  //   } else {
      getAPI(`${API_URL}&page=${eventData.page}`);
  //   }
  // }
  // movieStrorage = eventData.page;
  localStorage.setItem('pagination', eventData.page);
});
paginationPop.movePageTo(localStorage.getItem('pagination'));

function resetGallery() {
  refs.list.innerHTML = '';
}


// для філбтрів


import { filterItem, getSearchForm, renderFiltrMarkup } from './filter';

filterItem.filterForm.addEventListener('input', (e) => {
  setTimeout(pogination, 1000);
})

function pogination() {
  console.log('cnfhn')
  const year = filterItem.yearForm.value
  const genre = filterItem.genreForm.value
  console.log(year);
  console.log(genre);

  const options = {
  totalItems: JSON.parse(
    localStorage.getItem('totalItems')
  ),
  itemsPerPage: JSON.parse(
    localStorage.getItem('itemsPerPage')
  ),
  visiblePages: 5,
  page: 1,
  centerAlign: true,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage:
      '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

  const pagination = new Pagination('pagination', options);
    pagination.movePageTo(1);
  pagination._options.totalItems = JSON.parse(
    localStorage.getItem('totalItems')
  );
  pagination._options.itemsPerPage = JSON.parse(
    localStorage.getItem('itemsPerPage')
  );
  console.log(pagination);

pagination.on('afterMove', async function (eventData) {
  resetGallery();

  getSearchForm(genre, year, eventData.page)
      .then(data => {
        console.log(data);
        renderFiltrMarkup(data.results);
      })
      .catch(error => console.log(error))
      // .finally(() => spinerStop);
  
  localStorage.setItem('pagination', eventData.page);
});
}


