const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
   let rawHTML = ''
   data.forEach((item) => {
      // title, image
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
         }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
   })
   dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
   const modalTitle = document.querySelector('#movie-modal-title')
   const modalDate = document.querySelector('#movie-modal-date')
   const modalDescription = document.querySelector('#movie-modal-description')
   const modalImage = document.querySelector('#movie-modal-image')

   axios.get(INDEX_URL + id).then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
   })
}

function addToFavorite(id) {
   const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []  //取目前在 local storage 的資料，放進list
   const movie = movies.find((movie) => movie.id === id)  //利用 find 去電影總表中查看，找出 id 相同的電影物件回傳，暫存在 movie
   if (list.some((movie) => movie.id === id)) {  //防重複加入
      return alert('重複加入到已收藏的電影!')
   }
   list.push(movie)  //接著呼叫 localStorage.setItem，把更新後的list同步到 local storage
   localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
   if (event.target.matches('.btn-show-movie')) {  // 監聽More
      showMovieModal(event.target.dataset.id)
   } else if (event.target.matches('.btn-add-favorite')) {  // 監聽+
      addToFavorite(Number(event.target.dataset.id))
   }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
   event.preventDefault() //防頁面重新整理
   const keyword = searchInput.value.trim().toLowerCase()
   let = filteredMovies = [] //比對清單

   // 舊式搜尋偵錯
   // if (!keyword.length) {
   //    return alert('查無電影，請重新搜尋！')
   // }

   // 把關鍵字在清單裡做比對
   filteredMovies = movies.filter((movies) =>
      movies.title.toLowerCase().includes(keyword)
   )
   // 新式搜尋偵錯
   if (filteredMovies.length === 0) {
      return alert('查無此關鍵字：「' + keyword + '」的相關電影，請重新搜尋！')
   }

   renderMovieList(filteredMovies)
})

axios.get(INDEX_URL).then((response) => {
   movies.push(...response.data.results)
   renderMovieList(movies) //電影清單
   console.log(movies)
})
   .catch((err) => console.log(err))