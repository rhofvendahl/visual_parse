var Parse = function() {
  var self = this;

  self.nodes = new vis.DataSet();
  self.edges = new vis.DataSet();

  var container = document.getElementById('visualization');
  var data = {nodes: self.nodes, edges: self.edges};
  var options = {};
  self.network = new vis.Network(container, data, options);

  self.tokens = [];
  self.root = undefined;



  self.render = function(data) {
    new_tokens = [];
    data.forEach(function(token) {
      token.collapsed = token.noun_chunk_head;
      if (token.pos == 'NOUN' || token.pos == 'PRON') {
        token.color = 'pink';
      } else if (token.pos == 'VERB') {
        token.color = 'lightblue';
      } else {
        token.color = 'lightgrey'
      }
      new_tokens.push(token);
      if (token.dep == 'ROOT') self.root_id = token.id;

      self.nodes.update({
        id: token.id,
        label: token.text,
        title: token.pos,
        color: token.color,
      });
      self.edges.update({
        id: token.id,
        from: token.head_id,
        to: token.id,
        label: token.dep,
        arrows: 'to'
      });
      if (token.noun_chunk_head) {
      }
    });
    for (var i = new_tokens.length; i < self.tokens.length; i++) {
      self.nodes.remove(i);
    }
    self.tokens = new_tokens;
    if (self.tokens.length > 0) self.apply_collapse();
  };

  self.apply_collapse = function(id=self.root_id, head=true, hidden=false) {
    token = this.tokens[id]
    if (head) {
      self.nodes.update({
        id: id,
        label: (token.collapsed ? token.collapsed_text : token.text),
        hidden: false
      })
    }

    if (token.collapsed) hidden = true;

    token.child_ids.forEach(function(child_id) {
      child = self.tokens[child_id]
      self.nodes.update({
        id: child_id,
        label: (child.collapsed ? child.collapsed_text : child.text),
        hidden: hidden
      });

      self.apply_collapse(child_id, false, hidden)
    });
  };

  self.network.on('click', function(properties) {
    if (properties.nodes.length > 0) {
      token = self.tokens[properties.nodes[0]];
      token.collapsed = !token.collapsed;
      self.apply_collapse(properties.nodes[0]);
    }
  });

  self.update = function(query) {
    console.log('update!')
    fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      parse.render(json.data);
    });
  };
}
