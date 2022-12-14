import { Loading } from 'notiflix/build/notiflix-loading-aio';
import * as basicLightbox from 'basiclightbox';
// import { paginationWatchid, paginationQueue } from "./pagination-lib";
import { rWatched, rQueue } from './lib';
import svgYoutube from '../images/symbol-defs.svg';
import {
  getWatchedFb,
  addToWatchedFb,
  removeFromWatchedFb,
  getQueueFb,
  addToQueueFb,
  removeFromQueueFb,
} from './firebase';

//імпорт Запиту на сервер
import { Api } from './url';
const ApiP = new Api();

//імпорт ModalClassic для відкриття/закриття модального вікна
import ModalClassic from './modalClassic';
const Modal = new ModalClassic(
  '.modal-movie__backdrop',
  '.modal-movie__btn-close'
);

const modalMovi = document.querySelector('.modal-movie__container');
const movieDiv = document.querySelector('.movie-list');

// робота з локальним сховищем
const localUserId = localStorage.getItem('id-user');

let localStorageMovi = {
  watched: [],
  queue: [],
};

async function getOnlineOrOfflineStorage() {
  if (localUserId) {
    try {
      localStorageMovi.watched = await getWatchedFb(localUserId);
      localStorageMovi.queue = await getQueueFb(localUserId);
    } catch (error) {
      console.log(error);
    }
  } else {
    if (localStorage.getItem('watched')) {
      localStorageMovi = JSON.parse(localStorage.getItem('watched'));
    } else {
      localStorage.setItem('watched', JSON.stringify(localStorageMovi));
    }
  }
}

getOnlineOrOfflineStorage();

// обробка натискання на фільм
movieDiv.addEventListener('click', onMoviClick);

async function onMoviClick(e) {
  e.preventDefault();
  if (e.target.nodeName !== 'LI') {
    return;
  }
  Loading.custom('Loading...', {
    customSvgCode:
      '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><linearGradient id="myG"  fy="0" gradientTransform="rotate(60 .5 .5)"><stop offset="0" stop-color="#f15361"></stop><stop offset=".25" stop-color="#ffffff"><animate attributeName="offset" dur="2s" values="0;1;0"repeatCount="indefinite" /></stop><stop offset="1" stop-color="#f15361"/></linearGradient><path d="M0 0V12H16V0H0ZM3 11H1V9H3V11ZM3 7H1V5H3V7ZM3 3H1V1H3V3ZM12 11H4V1H12V11ZM15 11H13V9H15V11ZM15 7H13V5H15V7ZM15 3H13V1H15V3ZM6 3V9L10 6L6 3Z" fill="url(#myG)"/></svg>',
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
  });
  // console.log(e.target);
  // modalMovi.innerHTML = spinerInMovi();
  modalMovi.innerHTML = ' ';

  Modal.openModal();

  const idMovie = e.target.dataset.id;

  try {
    const Seach = await ApiP.fetchCardFilm(idMovie);
    console.log(Seach);
    modalMovi.innerHTML = CardFilminHtml(Seach);
    onBtnInModalMovi(e);
    Loading.remove(0);
    try {
      const Movies = await ApiP.fetchMovies(idMovie);
      if (Movies.results[0]) {
        const imageContainer = document.querySelector(
          '.modal-movie__img-container'
        );
        imageContainer.insertAdjacentHTML('beforeend', movieBtnHtml());
        const moviesBtn = document.querySelector('.modal-movie__movie');
        moviesBtn.addEventListener(
          'click',
          openModalMovi(e, Movies.results[0])
        );
      }
    } catch (error) {
      console.log(error);
      console.log('no movie');
    }
  } catch (error) {
    Loading.remove(0);
    console.log(error);
    modalMovi.innerHTML = CardFilminHtmlIfError(error);
  }
}

function openModalMovi(e, Movie) {
  return async function () {
    // console.log(e);
    // console.log(Movie);
    //  modalMovi.innerHTML = returnMovie(Movie);
    const options = {
      className: 'basicLightbox__placeholder--transparent',
      onShow: () => {
        window.addEventListener('keydown', onLightboxKeydown);
      },
      onClose: () => {
        window.removeEventListener('keydown', onLightboxKeydown);
        const modalMoviListener = document.querySelector(
          '.basicLightbox__placeholder'
        );
        modalMoviListener.classList.remove(
          'basicLightbox__placeholder--transparent'
        );
      },
    };
    const instance = basicLightbox.create(returnMovie(Movie), options);
    instance.show();

    function onLightboxKeydown(e) {
      if (e.code === 'Escape') {
        instance.close();
      }
    }
  };
}

async function onBtnInModalMovi(e) {
  const idMovie = e.target.outerHTML;
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

  let localStorageWatched = [];
  let localStorageQueue = [];

  try {
    if (localUserId) {
      localStorageWatched = await getWatchedFb(localUserId);
      localStorageQueue = await getQueueFb(localUserId);
    } else {
      localStorageWatched = JSON.parse(localStorage.getItem('watched')).watched;
      localStorageQueue = JSON.parse(localStorage.getItem('watched')).queue;
    }

    addCurentInBtn(localStorageWatched, idMovie, modalMoviInfoBtnWatched);
    addCurentInBtn(localStorageQueue, idMovie, modalMoviInfoBtnQueue);

    textCurentBtnWatched(modalMoviInfoBtnWatched);
    textCurentBtnQueue(modalMoviInfoBtnQueue);
  } catch (e) {
    console.log(e);
    localStorageWatched = JSON.parse(localStorage.getItem('watched')).watched;
    localStorageQueue = JSON.parse(localStorage.getItem('watched')).queue;

    addCurentInBtn(localStorageWatched, idMovie, modalMoviInfoBtnWatched);
    addCurentInBtn(localStorageQueue, idMovie, modalMoviInfoBtnQueue);

    textCurentBtnWatched(modalMoviInfoBtnWatched);
    textCurentBtnQueue(modalMoviInfoBtnQueue);
  }
}

// Додає та видаляє з локального сховища HTML картки
function changeWatched(e, targetEl) {
  return async function () {
    const modalMoviInfoBtnQueue = document.querySelector(
      '.modal-movie__btn-queue'
    );
    // console.log(targetEl.dataset.ls);
    // !JSON.parse(localStorage.getItem('watched')).watched.includes(e.target.outerHTML)
    if (targetEl.dataset.ls === 'false') {
      if (localUserId) {
        try {
          await addToWatchedFb(localUserId, e.target.outerHTML);
          addCurentBtn(targetEl);
          rebootLib();
        } catch (error) {
          console.log(error);
        }
      } else {
        localStorageMovi.watched.push(e.target.outerHTML);
        localStorage.setItem('watched', JSON.stringify(localStorageMovi));
        // console.log(JSON.stringify(localStorageMovi));
        addCurentBtn(targetEl);
        rebootLib();
      }
    } else {
      if (localUserId) {
        try {
          await removeFromWatchedFb(localUserId, e.target.outerHTML);
          removeCurentBtn(targetEl);
          rebootLib();
        } catch (error) {
          console.log(error);
        }
      } else {
        const ingexEl = localStorageMovi.watched.indexOf(e.target.outerHTML);

        localStorageMovi.watched.splice(ingexEl, 1);
        localStorage.setItem('watched', JSON.stringify(localStorageMovi));
        removeCurentBtn(targetEl);
        rebootLib();
      }
    }
    if (localUserId) {
      try {
        const getDataQueue = await getQueueFb(localUserId);
        if (getDataQueue.includes(e.target.outerHTML)) {
          await removeFromQueueFb(localUserId, e.target.outerHTML);
          removeCurentBtn(modalMoviInfoBtnQueue);
          rebootLib();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      if (
        JSON.parse(localStorage.getItem('watched')).queue.includes(
          e.target.outerHTML
        )
      ) {
        // const modalMoviInfoBtnWatched = document.querySelector(
        //   '.modal-movie__btn-watched'
        // );
        // const modalMoviInfoBtnQueue = document.querySelector(
        //   '.modal-movie__btn-queue'
        // );
        const ingexElrem = localStorageMovi.queue.indexOf(e.target.outerHTML);

        localStorageMovi.queue.splice(ingexElrem, 1);
        localStorage.setItem('watched', JSON.stringify(localStorageMovi));
        removeCurentBtn(modalMoviInfoBtnQueue);
        rebootLib();
      }
    }

    textCurentBtnWatched(targetEl);
    modalMoviInfoBtnQueue.innerHTML = 'add to Queue';
  };
}

function changeQueue(e, targetEl) {
  return async function () {
    try {
      const modalMoviInfoBtnWatched = document.querySelector(
        '.modal-movie__btn-watched'
      );
      // console.log(targetEl.dataset.ls);
      // !JSON.parse(localStorage.getItem('watched')).queue.includes(e.target.outerHTML)
      if (targetEl.dataset.ls === 'false') {
        if (localUserId) {
          try {
            await addToQueueFb(localUserId, e.target.outerHTML);
            addCurentBtn(targetEl);
            rebootLib();
          } catch (error) {
            console.log(error);
          }
        } else {
          localStorageMovi.queue.push(e.target.outerHTML);
          localStorage.setItem('watched', JSON.stringify(localStorageMovi));
          // console.log(JSON.stringify(localStorageMovi));
          addCurentBtn(targetEl);
          rebootLib();
        }
      } else {
        if (localUserId) {
          try {
            await removeFromQueueFb(localUserId, e.target.outerHTML);
            removeCurentBtn(targetEl);
            rebootLib();
          } catch (error) {
            console.log(error);
          }
        } else {
          const ingexEl = localStorageMovi.queue.indexOf(e.target.outerHTML);

          localStorageMovi.queue.splice(ingexEl, 1);
          localStorage.setItem('watched', JSON.stringify(localStorageMovi));
          removeCurentBtn(targetEl);
          rebootLib();
        }
      }
      if (localUserId) {
        try {
          const fetchDataWatched = await getWatchedFb(localUserId);
          if (fetchDataWatched.includes(e.target.outerHTML)) {
            await removeFromWatchedFb(localUserId, e.target.outerHTML);
            removeCurentBtn(modalMoviInfoBtnWatched);
            rebootLib();
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        if (
          JSON.parse(localStorage.getItem('watched')).watched.includes(
            e.target.outerHTML
          )
        ) {
          // const modalMoviInfoBtnWatched = document.querySelector(
          //   '.modal-movie__btn-watched'
          // );
          // const modalMoviInfoBtnQueue = document.querySelector(
          //   '.modal-movie__btn-queue'
          // );
          const ingexElrem = localStorageMovi.watched.indexOf(
            e.target.outerHTML
          );

          localStorageMovi.watched.splice(ingexElrem, 1);
          localStorage.setItem('watched', JSON.stringify(localStorageMovi));
          removeCurentBtn(modalMoviInfoBtnWatched);
          rebootLib();
        }
      }
      textCurentBtnQueue(targetEl);
      modalMoviInfoBtnWatched.innerHTML = 'add to Watched';
    } catch {}
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
    btn.innerHTML = 'remove from Watched';
  }
}

function textCurentBtnQueue(btn) {
  if (btn.dataset.ls === 'false') {
    btn.innerHTML = 'add to Queue';
  } else {
    btn.innerHTML = 'remove from Queue';
  }
}

// створює розмітку для модалки
function CardFilminHtml(data) {
  const genresArr = [];
  data.genres.length
    ? data.genres.map(genre => {
        genresArr.push(genre.name);
      })
    : '';
  return `
  <div class="modal-movie__img-container">
  <img class="modal-movie__img" loading="lazy" src="${
    data.poster_path
      ? 'https://image.tmdb.org/t/p/w500' + data.poster_path
      : 'https://i.postimg.cc/6pzyh7Wc/pngwing-com.png'
  }" alt="${
    data.original_title || data.original_name
  }" width="240" height="357" />
  ${
    data.production_companies.length
      ? data.production_companies[0].logo_path
        ? ` <img class="modal-movie__img-company" loading="lazy" src="${
            data.production_companies[0].logo_path
              ? 'https://image.tmdb.org/t/p/w500' +
                data.production_companies[0].logo_path
              : '-'
          }" alt="${
            data.production_companies[0].name || 'logo company'
          }" width="240" height="357" />`
        : ''
      : ' '
  }
  
  </div>
    
    <div>
      <h1 class="modal-movie__title">${
        data.original_title || data.original_name
          ? data.original_title || data.original_name
          : '-'
      }</h1>
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
          <p class="modal-movie__item-inf">${
            genresArr.length > 0 ? genresArr.join(', ') : '-'
          }</p>
        </li>
      </ul>
      <h2 class="modal-movie__about">About</h2>
      <p class="modal-movie__about-text">
        ${data.overview.length > 0 ? data.overview : 'Absent...'}
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
      `;
}

// створює розмітку для модалки у випадку помилки
function CardFilminHtmlIfError(Error) {
  return `
    <div class="error-message">
    <h1>${Error.response.status}</h1>
    <h2>${Error.name}</h2>
    <h3>${Error.message}</h3>
<p>try later</p>
    </div>
    
      `;
}

function movieBtnHtml() {
  return `
      <button type="button" class="modal-movie__movie">
      <svg class="icon modal-movie__icon" width="40" height="40">
      <use xlink:href="${svgYoutube}#icon-youtube"></use>
      </svg>
    </button>  
      `;
}

function returnMovie(Movie) {
  return `
  <div class='movie-iframe'>
<iframe frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="${Movie.name}" width="100%" height="100%" src="https://www.youtube.com/embed/${Movie.key}"></iframe>
  </div>
  `;
}

function rebootLib() {
  const btnWatched = document.querySelector('.button-watched');
  const btnQueue = document.querySelector('.button-queue');

  if (btnWatched.dataset.active === 'true') {
    rWatched();
    // paginationWatchid();
  }
  if (btnQueue.dataset.active === 'true') {
    rQueue();
    // paginationQueue();
  }
}
