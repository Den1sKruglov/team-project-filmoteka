import { fetchCardFilm, Api } from './url';

const ApiP = new Api();

const modalMoviInfo = document.querySelector('.modal-movie__backdrop');
const modalMovi = document.querySelector('.modal-movie');

const movieDiv = document.querySelector('.movie-popular');

let localStorageMovi = {
  watched: [],
  queue: [],
};

if (localStorage.getItem('watched')) {
  localStorageMovi = JSON.parse(localStorage.getItem('watched'));
} else {
  localStorage.setItem('watched', JSON.stringify(localStorageMovi));
}

movieDiv.addEventListener('click', openModalInfo);

async function openModalInfo(e) {
  e.preventDefault();
  if (e.target.nodeName !== 'LI') {
    return;
  }

  // console.log(e.target);
  modalMovi.innerHTML = '';
  modalMoviInfo.classList.remove('is-hidden');

  const idMovie = e.target.dataset.id;

  try {
    const PixabaySeach = await ApiP.fetchCardFilm(idMovie);
    modalMovi.innerHTML = CardFilminHtml(PixabaySeach);
    onBtnInModalMovi(e);
  } catch (error) {
    console.log(error);
    modalMovi.innerHTML = CardFilminHtmlIfError();
  }

  const modalMoviInfoBtnClose = document.querySelector(
    '.modal-movie__btn-close'
  );
  modalMoviInfoBtnClose.addEventListener('click', closeModalInfo);
}

// Опрацьовує роботу кнопок
function onBtnInModalMovi(e) {
  const idMovie = e.target.dataset.id;
  const modalMoviInfoBtnWatched = document.querySelector(
    '.modal-movie__btn-watched'
  );
  const modalMoviInfoBtnQueue = document.querySelector(
    '.modal-movie__btn-queue'
  );

  modalMoviInfoBtnWatched.addEventListener(
    'click',
    changeWatched(e, modalMoviInfoBtnWatched)
  );

  modalMoviInfoBtnQueue.addEventListener(
    'click',
    changeQueue(e, modalMoviInfoBtnQueue)
  );

  const localStorageWatched = JSON.parse(
    localStorage.getItem('watched')
  ).watched;
  const localStorageQueue = JSON.parse(localStorage.getItem('watched')).queue;

  addCurentInBtn(localStorageWatched, idMovie, modalMoviInfoBtnWatched);
  addCurentInBtn(localStorageQueue, idMovie, modalMoviInfoBtnQueue);

  textCurentBtnWatched(modalMoviInfoBtnWatched);
  textCurentBtnQueue(modalMoviInfoBtnQueue);
}

// Додає та видаляє з локального сховища id картки
function changeWatched(e, targetEl) {
  return function () {
    // console.log(targetEl.dataset.ls);

    if (targetEl.dataset.ls === 'false') {
      localStorageMovi.watched.push(e.target.dataset.id);
      localStorage.setItem('watched', JSON.stringify(localStorageMovi));
      // console.log(JSON.stringify(localStorageMovi));
      addCurentBtn(targetEl);
    } else {
      const ingexEl = localStorageMovi.watched.indexOf(e.target.dataset.id);

      localStorageMovi.watched.splice(ingexEl, 1);
      localStorage.setItem('watched', JSON.stringify(localStorageMovi));

      removeCurentBtn(targetEl);
    }
    textCurentBtnWatched(targetEl);
  };
}

function changeQueue(e, targetEl) {
  return function () {
    // console.log(targetEl.dataset.ls);

    if (targetEl.dataset.ls === 'false') {
      localStorageMovi.queue.push(e.target.dataset.id);
      localStorage.setItem('watched', JSON.stringify(localStorageMovi));
      // console.log(JSON.stringify(localStorageMovi));
      addCurentBtn(targetEl);
    } else {
      const ingexEl = localStorageMovi.queue.indexOf(e.target.dataset.id);

      localStorageMovi.queue.splice(ingexEl, 1);
      localStorage.setItem('watched', JSON.stringify(localStorageMovi));
      removeCurentBtn(targetEl);
    }
    textCurentBtnQueue(targetEl);
  };
}

// Додає/видаляє класс з кнопки

function addCurentInBtn(arr, element, btn) {
  if (arr.includes(element)) {
    addCurentBtn(btn);
  } else {
    removeCurentBtn(btn);
  }
}

function addCurentBtn(btn) {
  btn.classList.add('modal-movie__btn--curent');
  btn.dataset.ls = 'true';
}

function removeCurentBtn(btn) {
  btn.classList.remove('modal-movie__btn--curent');
  btn.dataset.ls = 'false';
}

// Змінює текст кнопки
function textCurentBtnWatched(btn) {
  if (btn.dataset.ls === 'false') {
    btn.innerHTML = 'add to Watched';
  } else {
    btn.innerHTML = 'remove Watched';
  }
}
function textCurentBtnQueue(btn) {
  if (btn.dataset.ls === 'false') {
    btn.innerHTML = 'add to Queue';
  } else {
    btn.innerHTML = 'remove Queue';
  }
}

// Закриває модалку
function closeModalInfo() {
  modalMovi.innerHTML = '';
  modalMoviInfo.classList.add('is-hidden');
}

// створює розмітку для модалки
function CardFilminHtml(data) {
  return `
    <img class="modal-movie__img" src="${
      data.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + data.poster_path
        : 'https://via.placeholder.com/395x574'
    }" alt="${
    data.original_title || data.original_name
  }" width="240" height="357" />
    <div>
      <h2 class="modal-movie__title">${
        data.original_title || data.original_name
          ? data.original_title || data.original_name
          : ''
      }</h2>
      <ul class="modal-movie__list">
        <li class="modal-movie__item">
          <p class="modal-movie__item-categories">Vote / Votes</p>
          <p class="modal-movie__item-inf">
            <span class="modal-movie__item-vote">${data.vote_average}</span> /
            <span class="modal-movie__item-votes">${data.vote_count}</span>
          </p>
        </li>
        <li class="modal-movie__item">
          <p class="modal-movie__item-categories">Popularity</p>
          <p class="modal-movie__item-inf">${data.popularity}</p>
        </li>
        <li class="modal-movie__item">
          <p class="modal-movie__item-categories">Original Title </p>
          <p class="modal-movie__item-inf modal-movie__item-inf--uppercase">
            ${data.original_title}
          </p>
        </li>
        <li class="modal-movie__item">
          <p class="modal-movie__item-categories">Genre</p>
          <p class="modal-movie__item-inf">${data.genres[0].name}</p>
        </li>
      </ul>
      <h3 class="modal-movie__about">About</h3>
      <p class="modal-movie__about-text">
        ${data.overview}
      </p>
      <div class="modal-movie__btn-section">
        <button
            class="modal-movie__btn modal-movie__btn--margin modal-movie__btn-watched"
            type="button" data-ls='false'
          >
            add to Watched
          </button>
          <button class="modal-movie__btn modal-movie__btn-queue" type="button" data-ls='false'>add to queue</button>
      </div>
    </div>
    <button type="button" class="modal-movie__btn-close">
      <svg class="icon" width="14" height="14">
        <use xlink:href="/symbol-defs.a8b2e413.svg#icon-close"></use>
      </svg>
    </button>
      `;
}
// створює розмітку для модалки у випадку помилки
function CardFilminHtmlIfError() {
  return `<button type="button" class="modal-movie__btn-close">
      <svg class="icon" width="14" height="14">
        <use xlink:href="/symbol-defs.a8b2e413.svg#icon-close"></use>
      </svg>
    </button>
    <p>try later</p>
      `;
}