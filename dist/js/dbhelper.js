class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(t){fetch(DBHelper.DATABASE_URL).then(function(t){if(t.ok)return t.json();throw new Error("Fetch repsponse Error")}).then(function(e){t(null,e)}).catch(function(e){console.log("In fetchRestaurants catch, error:",e.message),idb.open("restaurantReviews",1).then(t=>t.transaction("restaurantData").objectStore("restaurantData").getAll()).then(e=>{t(null,e)})})}static fetchRestaurantById(t,e){DBHelper.fetchRestaurants((n,r)=>{if(n)e(n,null);else{const n=r.find(e=>e.id==t);n?e(null,n):e("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(t,e){DBHelper.fetchRestaurants((n,r)=>{if(n)e(n,null);else{const n=r.filter(e=>e.cuisine_type==t);e(null,n)}})}static fetchRestaurantByNeighborhood(t,e){DBHelper.fetchRestaurants((n,r)=>{if(n)e(n,null);else{const n=r.filter(e=>e.neighborhood==t);e(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(t,e,n){DBHelper.fetchRestaurants((r,a)=>{if(r)n(r,null);else{let r=a;"all"!=t&&(r=r.filter(e=>e.cuisine_type==t)),"all"!=e&&(r=r.filter(t=>t.neighborhood==e)),n(null,r)}})}static fetchNeighborhoods(t){DBHelper.fetchRestaurants((e,n)=>{if(e)t(e,null);else{const e=n.map((t,e)=>n[e].neighborhood),r=e.filter((t,n)=>e.indexOf(t)==n);t(null,r)}})}static fetchCuisines(t){DBHelper.fetchRestaurants((e,n)=>{if(e)t(e,null);else{const e=n.map((t,e)=>n[e].cuisine_type),r=e.filter((t,n)=>e.indexOf(t)==n);t(null,r)}})}static urlForRestaurant(t){return`./restaurant.html?id=${t.id}`}static imageUrlForRestaurant(t){return`/img/${t.photograph}`}static mapMarkerForRestaurant(t,e){return new google.maps.Marker({position:t.latlng,title:t.name,url:DBHelper.urlForRestaurant(t),map:e,animation:google.maps.Animation.DROP})}}