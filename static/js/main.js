window.onload = function() {

  query = 'John went to the snow.'
  fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      console.log(JSON.stringify(json));
      nodes = json.nodes
      edges = json.edges

      var container = document.getElementById('visualization');
      var data = json;
      var options = {};
      var network = new vis.Network(container, data, options)
      console.log('heyo')
    });
}
