let restaurant;var map;window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");if(t)DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)});else{e("No restaurant id in URL",null)}}),fillRestaurantHTML=((e=self.restaurant)=>{const t=document.getElementById("restaurant-name");t.innerHTML=e.name;const n=document.createElement("button");n.className="favButton";let r=!(!e.is_favorite||"true"!==e.is_favorite.toString());n.setAttribute("aria-pressed",r),n.setAttribute("aria-label",`Make ${e.name} a favorite!`),n.innerHTML=r?"&#9829;":"&#9825;",n.onclick=(t=>favoriteClicked(e,n)),t.appendChild(n),document.getElementById("restaurant-address").innerHTML=e.address;const a=document.getElementById("restaurant-img");a.className="restaurant-img",a.src=`/img/${e.id}@1x.webp`,a.srcset=`/img/${e.id}@1x.webp 300w,\n                  /img/${e.id}@2x.webp 600w,\n                  /img/${e.id}@3x.webp 900w`,a.alt=`Image of ${e.name} restaurant`,document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),console.log(`In fillRestaurantHTML, about to call fetch then fill with id: ${e.id}`),DBHelper.fetchReviewsById(e.id).then(fillReviewsHTML)}),favoriteClicked=((e,t)=>{let n=!(!t.getAttribute("aria-pressed")||"true"!==t.getAttribute("aria-pressed")),r=`${DBHelper.DATABASE_URL}/${e.id}/?is_favorite=${!n}`;DBHelper.updateRestaurantCache(e.id,{is_favorite:!n}),DBHelper.addToUpdateQueue(r,"PUT"),t.setAttribute("aria-pressed",!n),t.innerHTML=n?"&#9825;":"&#9829;",t.onclick=(n=>favoriteClicked(e,t))}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("th");a.innerHTML=n,r.appendChild(a);const i=document.createElement("td");i.innerHTML=e[n],r.appendChild(i),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{console.log("In fillReviewsHTML ",e);const t=document.getElementById("reviews-container"),n=document.createElement("h3");n.innerHTML="Reviews",t.appendChild(n);const r=document.createElement("button");if(r.innerHTML="Add a Review",r.id="reviewButton",r.onclick=addReviewForm,t.appendChild(r),!e){const e=document.createElement("h3");return e.innerHTML="<br>No reviews yet!<br>",void t.appendChild(e)}const a=document.getElementById("reviews-list");e.forEach(e=>{a.appendChild(createReviewHTML(e))}),t.appendChild(a)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.id="reviewer-name",n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=new Date(e.createdAt).toLocaleDateString(),t.appendChild(r);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const l=document.createElement("p");var d="";for(i=0;i<e.rating;i++)d+="&#9733 ";l.innerHTML=d,t.appendChild(l);const m=document.createElement("hr");t.appendChild(m);const o=document.createElement("p");return o.id="reviewer-comments",o.innerHTML=e.comments,t.appendChild(o),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.setAttribute("aria-current","page"),n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}),addReviewForm=(()=>{document.getElementById("reviewButton").style.display="none",document.getElementById("reviews-list").appendChild(reviewForm()),document.getElementById("name").focus()}),reviewForm=(()=>{let e=document.createElement("li"),t=document.createElement("form");t.id="reviewForm";let n=document.createElement("p");n.innerHTML="New Review",n.id="reviewer-name",t.appendChild(n);let r=document.createElement("p"),a=document.createElement("input"),i=document.createElement("label");i.setAttribute("for","name"),i.innerHTML="First Name: ",a.id="name",a.setAttribute("type","text"),r.appendChild(i),r.appendChild(a),t.appendChild(r),r=document.createElement("p");let l=document.createElement("label");l.setAttribute("for","rating"),l.innerText="Your rating: ",r.appendChild(l);let d=document.createElement("select");d.id="rating",d.name="rating",d.classList.add("rating"),["--",1,2,3,4,5].forEach(e=>{const t=document.createElement("option");t.value=e,t.innerHTML=e,"--"===e&&(t.selected=!0),d.appendChild(t)}),r.appendChild(d),t.appendChild(r),r=document.createElement("p");let m=document.createElement("textarea"),o=document.createElement("label");o.setAttribute("for","comments"),o.innerHTML="Comments: ",m.id="comments",m.setAttribute("rows","10"),r.appendChild(o),r.appendChild(m),r.style.display="flex",r.style.alignItems="center",t.appendChild(r),r=document.createElement("p");let c=document.createElement("button");return c.id="submitReview",c.setAttribute("type","submit"),c.innerHTML="Submit Review",r.appendChild(c),t.appendChild(r),t.onsubmit=handleSubmit,e.appendChild(t),e}),handleSubmit=(e=>{e.preventDefault();let t=self.restaurant.id,n=document.getElementById("name").value,r=document.getElementById("rating").value-0,a=document.getElementById("comments").value;const l=document.getElementById("reviews-list"),d=document.createElement("li"),m=document.createElement("p");m.id="reviewer-name",m.innerHTML=n,d.appendChild(m);const o=document.createElement("p");o.innerHTML="Date",d.appendChild(o);const c=document.createElement("p");c.innerHTML=`Rating: ${r}`,d.appendChild(c);const s=document.createElement("p");var u="";for(i=0;i<r;i++)u+="&#9733 ";s.innerHTML=u,d.appendChild(s);const p=document.createElement("hr");d.appendChild(p);const h=document.createElement("p");h.id="reviewer-comments",h.innerHTML=a,d.appendChild(h),l.appendChild(d),DBHelper.saveReview(t,n,r,a,Date.now());let E=document.getElementById("reviewForm");E.parentNode.removeChild(E),document.getElementById("reviewButton").style.display="block"});