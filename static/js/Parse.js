var Parse = function(container) {
  var self = this;

  self.nodes = new vis.DataSet();
  self.edges = new vis.DataSet();

  var container = document.getElementById('visualization');
  var data = {nodes: self.nodes, edges: self.edges};
  var options = {};
  self.network = new vis.Network(container, data, options);

  self.tokens = [];



  self.render = function(data) {
    new_tokens = [];
    data.forEach(function(token) {
      token.collapsed = false;
      console.log(token.text, token.noun_chunk_head);
      if (token.pos == 'NOUN' || token.pos == 'PRON') {
        token.color = 'pink';
      } else if (token.pos == 'VERB') {
        token.color = 'lightblue';
      } else {
        token.color = 'lightgrey'
      }
      new_tokens.push(token);

      self.nodes.update({
        id: token.id,
        label: token.text,
        title: token.pos,
        color: token.color
      });
      self.edges.update({
        id: token.id,
        from: token.head_id,
        to: token.id,
        label: token.dep,
        arrows: 'to'
      });
      if (token.noun_phrase_head) self.toggle(token.id);
    });
    for (var i = new_tokens.length; i < self.tokens.length; i++) {
      self.nodes.remove(i);
    }
    self.tokens = new_tokens;
  };

  self.toggle = function(id, collapsing=undefined, head=true) {
    token = this.tokens[id]
    if (head) {
      token.collapsed = !token.collapsed
      collapsing = token.collapsed
      self.nodes.update({
        id: token.id,
        label: (token.collapsed ? token.collapsed_text : token.text)
      })
    }

    token.child_ids.forEach(function(child_id) {
      self.nodes.update({id: child_id, hidden: collapsing});
      if (!self.tokens[child_id].collapsed) {
        self.toggle(child_id, collapsing, false)
      }
    });
  };

  self.network.on('click', function(properties) {
    if (properties.nodes.length > 0) {
      self.toggle(properties.nodes[0]);
    }
  });
}
