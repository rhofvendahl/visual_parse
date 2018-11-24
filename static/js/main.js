window.onload = function(){
  query = 'John went to the snow.'
  fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      console.log(JSON.stringify(json));
    });
}
