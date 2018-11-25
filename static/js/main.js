window.onload = function() {
  var query = "I'm just feeling pretty bad"

  var parse = new Parse('visualization');

  var input = document.getElementById('query')
  input.oninput = function(event) {
    // if (event.key == ' ') {
    //
    // };
    console.log(event.key)
    fetch('/parse?query=' + input.value)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      parse.render(json.tokens);
    });
  };
}
