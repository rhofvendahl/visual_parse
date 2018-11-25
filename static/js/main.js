window.onload = function() {

  var query = "I'm just feeling pretty bad, yeah I just feel like you know how you have plans that you set for yourself and you think, oh by 30 this will happen and I feel like it was going in the right direction and then everything just got messed up and it's mostly my fault so..."
  fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      var tokens = json.tokens;
      var nodes = new vis.DataSet();
      var edges = new vis.DataSet();
      tokens.forEach(function(token) {
        nodes.add({
          id: token.id,
          label: token.text,
          hover: token.pos
        });
        edges.add({
          from: token.head_id,
          to: token.id,
          label: token.dep,
          arrows: 'to'
        })
      });

      var container = document.getElementById('visualization');
      var data = {nodes: nodes, edges: edges};
      var options = {};
      var network = new vis.Network(container, data, options)

      network.on('click', function(properties) {
        if (properties.nodes.length > 0) {
          var id = properties.nodes[0];
          if (tokens[id].collapsed) {
            nodes.update({id: id, label: tokens[id].text});
          } else {
            nodes.update({id: id, label: tokens[id].collapsed_text});
          };

          tokens[id].child_ids.forEach(function(child_id) {
            nodes.update({id: child_id, hidden: !tokens[id].collapsed});
          });

          tokens[id].collapsed = !tokens[id].collapsed
        };
      });
    });
}
