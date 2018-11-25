window.onload = function() {
  var query = "I'm just feeling pretty bad"

  var parse = new Parse('visualization');

  fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      parse.render(json.tokens);
    });

  parse.network.on('click', function(properties) {
    if (properties.nodes.length > 0) {
      parse.toggle(properties.nodes[0]);
    }
  });
}
