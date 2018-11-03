const port=1337,dbPromise=idb.open("restaurantReviews",3,e=>{switch(e.oldVersion){case 0:e.createObjectStore("restaurantData",{keyPath:"id"});case 1:e.createObjectStore("reviewData",{keypath:"id"}).createIndex("restaurant_id","restaurant_id");case 2:e.createObjectStore("updateData",{keyPath:"id",autoIncrement:!0})}});class DBHelper{static get DATABASE_URL(){return`http://localhost:${port}/restaurants`}static get DATABASE_URL_REVIEWS(){return`http://localhost:${port}/reviews`}static fetchRestaurants(e){let t=DBHelper.DATABASE_URL;fetch(t,{method:"GET"}).then(function(e){if(e.ok)return e.json()}).then(function(t){e(null,t)}).catch(function(e){console.log("In fetchRestaurants catch, error: ",e.message)})}static fetchRestaurantById(e,t){console.log(`In fetchRestaurantsById - id: ${e}`),DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.find(t=>t.id==e);a?t(null,a):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DBHelper.fetchRestaurants((n,r)=>{if(n)a(n,null);else{let n=r;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),a(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph}`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}static fetchReviewsById(e){let t=DBHelper.DATABASE_URL_REVIEWS+"/?restaurant_id="+e;return console.log(`In DBHelper.fetchReviewsById - request: ${t}, id: ${e}`),fetch(t,{method:"GET"}).then(function(e){if(console.log("response: ",e),e.ok)return e.json()}).then(function(e){return console.log("reviewData: ",e),e}).catch(function(e){console.log("In fetchReviewsBy...ID catch, error:",e.message)})}static updateRestaurantCache(e,t){console.log(`In updateRestaurantCache - id: ${e}, update: ${t}`);let a=idb.open("restaurantReviews");a.then(function(n){n.transaction("restaurantData","readwrite").objectStore("restaurantData").get("-1").then(function(n){if(!n)return void console.log("No value, update all, in updateRestaurantCache");let r=n.data.filter(t=>t.id===e)[0];r&&(Object.keys(t).forEach(e=>{r[e]=t[e]}),a.then(function(e){return e.transaction("restaurantData","readwrite").objectStore("restaurantData").put({id:"-1",data:n.data}).complete}))})}),a.then(function(n){n.transaction("restaurantData","readwrite").objectStore("restaurantData").get(e+"").then(function(n){if(!n)return void console.log("No value, update individual, in updateRestaurantCache");let r=n.data;r&&(Object.keys(t).forEach(e=>{r[e]=t[e]}),a.then(function(t){return t.transaction("restaurantData","readwrite").objectStore("restaurantData").put({id:e+"",data:n.data}).complete}))})})}static updateReviewCache(e,t){console.log(`In updateReviewCache - id: ${e}, update: ${t}`),idb.open("restaurantReviews").then(function(a){return a.transaction("reviewData","readwrite").objectStore("reviewData").put({id:Date.now(),restaurant_id:e,data:t}).complete})}static addToUpdateQueue(e,t,a){console.log(`In addToUpdateQueue - url: ${e}, method: ${t}, update: ${a}`),idb.open("restaurantReviews").then(function(n){n.transaction("updateData","readwrite").objectStore("updateData").put({data:{url:e,method:t,update:a}})}).catch(function(e){console.log("In addToUpdateQueue catch, error: ",e.message)})}static pushUpdates(){console.log("In pushUpdates"),idb.open("restaurantReviews").then(function(e){e.transaction("updateData","readwrite").objectStore("updateData").openCursor().then(function(t){if(!t)return;let a=t.value.data,n={body:JSON.stringify(a.body),method:a.method};fetch(a.url,n).then(function(e){e.ok}).then(function(){e.transaction("updateData","readwrite").objectStore("updateData").openCursor().then(function(e){e.delete().then(function(){console.log("Record deleted, calling next...")})})})}).catch(function(e){console.log("In pushUpdates catch, error: ",e.message)})})}static saveReview(e,t,a,n,r){let o=`${DBHelper.DATABASE_URL_REVIEWS}`,s={restaurant_id:e,name:t,rating:a,comments:n,createdAt:r};console.log(`In saveReview - url: ${o}, method: POST, body: ${s}`),DBHelper.updateReviewCache(e,s),DBHelper.addToUpdateQueue(o,"POST",s)}}