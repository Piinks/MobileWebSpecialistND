"serviceWorker"in navigator&&navigator.serviceWorker.register("sw.js").then(function(e){console.log("Registration successful, scope is: ",e.scope)}).catch(function(e){console.log("Service worker registration failed, error: ",e)});