let restaurant;
var map;

/*
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
  DBHelper.pushUpdates();
}

/*
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    let error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      //console.log(restaurant);
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/*
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  // Inserting favorite here
  const favButton = document.createElement('button');
  favButton.className = 'favButton';
  let isFavorite = (restaurant.is_favorite && restaurant.is_favorite.toString() === "true") ? true : false;
  //console.log(`${restaurant.name}, ${restaurant.is_favorite}`);
  favButton.setAttribute('aria-pressed', isFavorite);
  favButton.setAttribute('aria-label', `Make ${restaurant.name} a favorite!`);
  favButton.innerHTML = isFavorite ? '&#9829;' : '&#9825;'; 
  favButton.onclick = event => favoriteClicked(restaurant, favButton);

  name.appendChild(favButton);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = `/img/${restaurant.id}@1x.webp`;
  image.srcset = `/img/${restaurant.id}@1x.webp 300w,
                  /img/${restaurant.id}@2x.webp 600w,
                  /img/${restaurant.id}@3x.webp 900w`;
  image.alt = `Image of ${restaurant.name} restaurant`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  console.log(`In fillRestaurantHTML, about to call fetch then fill with id: ${restaurant.id}`);
  DBHelper.fetchReviewsById(restaurant.id).then(fillReviewsHTML);
}

 /*
  * Handling favorite button clicked.
  */
favoriteClicked = (restaurant, button) => {

  // Get current fav state
  let fav = (button.getAttribute("aria-pressed") && button.getAttribute("aria-pressed") === "true") ? true : false;

  let requestURL = `${DBHelper.DATABASE_URL}/${restaurant.id}/?is_favorite=${!fav}`;
  let requestMethod = "PUT";
  DBHelper.updateRestaurantCache(restaurant.id, {"is_favorite": !fav});
  DBHelper.addToUpdateQueue(requestURL, requestMethod);
  button.setAttribute('aria-pressed', !fav);
  button.innerHTML = !fav ? '&#9829;' : '&#9825;'; 
  button.onclick = event => favoriteClicked(restaurant, button);
}

/*
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('th');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/*
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  console.log("In fillReviewsHTML ", reviews);
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  const addReview = document.createElement('button');
  addReview.innerHTML = 'Add a Review';
  addReview.id = "reviewButton";
  addReview.onclick = addReviewForm;
  container.appendChild(addReview);

  if (!reviews) {
    const noReviews = document.createElement('h3');
    noReviews.innerHTML = '<br>No reviews yet!<br>';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/*
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.id = "reviewer-name";
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const stars = document.createElement('p');
  var starString = "";
  for (i = 0; i < review.rating; i++){
    starString += "&#9733 ";
  }
  stars.innerHTML = starString;
  li.appendChild(stars);

  const line = document.createElement('hr');
  li.appendChild(line);

  const comments = document.createElement('p');
  comments.id = "reviewer-comments";
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/*
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/*
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Adding Reviews ==========================================================

/*
 * Handle button click for adding a review
 */
addReviewForm = () => {
  let addReviewButton = document.getElementById("reviewButton");
  addReviewButton.style.display = "none";
  const reviewList = document.getElementById('reviews-list');
  reviewList.appendChild(reviewForm());
  document.getElementById("name").focus();

}

/*
 * Returns a form to append to th list of reviews for input.
 */
reviewForm = () => {
  let formContainer = document.createElement('li');
  let form = document.createElement('form');
  form.id = "reviewForm";

  let title = document.createElement('p');
  title.innerHTML = "New Review";
  title.id = "reviewer-name";
  form.appendChild(title);

  let p = document.createElement('p');
  let name = document.createElement('input');
  let nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'name');
  nameLabel.innerHTML = 'First Name: '; 
  name.id = "name"
  name.setAttribute('type', 'text');
  p.appendChild(nameLabel);
  p.appendChild(name);
  form.appendChild(p);

  p = document.createElement('p');
  let selectLabel = document.createElement('label');
  selectLabel.setAttribute('for', 'rating');
  selectLabel.innerText = "Your rating: ";
  p.appendChild(selectLabel);
  let select = document.createElement('select');
  select.id = "rating";
  select.name = "rating";
  select.classList.add('rating');
  ["--", 1,2,3,4,5].forEach(number => {
    const option = document.createElement('option');
    option.value = number;
    option.innerHTML = number;
    if (number === "--") option.selected = true;
    select.appendChild(option);
  });
  p.appendChild(select);
  form.appendChild(p);

  p = document.createElement('p');
  let comments = document.createElement('textarea');
  let commentsLabel = document.createElement('label');
  commentsLabel.setAttribute('for', 'comments');
  commentsLabel.innerHTML = 'Comments: ';
  comments.id = "comments";
  comments.setAttribute('rows', '10');
  p.appendChild(commentsLabel);
  p.appendChild(comments);
  p.style.display = "flex";
  p.style.alignItems = "center";
  form.appendChild(p);

  p = document.createElement('p');
  let submitButton = document.createElement('button');
  submitButton.id = "submitReview";
  submitButton.setAttribute('type', 'submit');
  submitButton.innerHTML = "Submit Review";
  p.appendChild(submitButton);
  form.appendChild(p);

  form.onsubmit = handleSubmit;
  formContainer.appendChild(form);
  return formContainer;
}

handleSubmit = (e) => {
  // Takes care of submission cancelation
  e.preventDefault();
  let id        = self.restaurant.id;
  let name      = document.getElementById("name").value;
  let rating    = document.getElementById("rating").value - 0;
  let comments  = document.getElementById("comments").value;
  // Add the new review to the reviews list
  const ul = document.getElementById('reviews-list');
  
  // Put new review in reviews list on site ---
  const li = document.createElement('li');
  const newName = document.createElement('p');
  newName.id = "reviewer-name";
  newName.innerHTML = name;
  li.appendChild(newName);

  const date = document.createElement('p');
  let now = Date.now();
  date.innerHTML = now.toLocaleDateString();
  li.appendChild(date);

  const newRating = document.createElement('p');
  newRating.innerHTML = `Rating: ${rating}`;
  li.appendChild(newRating);

  const stars = document.createElement('p');
  var starString = "";
  for (i = 0; i < rating; i++){
    starString += "&#9733 ";
  }
  stars.innerHTML = starString;
  li.appendChild(stars);

  const line = document.createElement('hr');
  li.appendChild(line);

  const newComments = document.createElement('p');
  newComments.id = "reviewer-comments";
  newComments.innerHTML = comments;
  li.appendChild(newComments);
  //---

  ul.appendChild(li);

  DBHelper.saveReview(id, name, rating, comments, Date.now());
    // Get rid of the form
    let form = document.getElementById("reviewForm");
    form.parentNode.removeChild(form);
    // Put the 'Add Review' button back.
    let addReviewButton = document.getElementById("reviewButton");
    addReviewButton.style.display = "block"; 

}


