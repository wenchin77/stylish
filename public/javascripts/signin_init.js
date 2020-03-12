// Load the Facebook Javascript SDK asynchronously
(function(d, s, id) {
  let js; 
  let fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
  FB.init({
    appId: '585389135552757', // FB appID
    cookie: true, // enable cookies to allow the server to access the session
    xfbml: true, // parse social plugins on this page
    version: 'v4.0', // use graph api version
  });
  FB.AppEvents.logPageView();
};
