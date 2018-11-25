var Parse = function(container) {
  var self = this;

  self.nodes = new vis.DataSet();
  self.edges = new vis.DataSet();

  var container = document.getElementById('visualization');
  var data = {nodes: self.nodes, edges: self.edges};
  var options = {};
  self.network = new vis.Network(container, data, options);

  self.tokens = undefined;

  self.render = function(tokens) {
    self.tokens = tokens;
    tokens.forEach(function(token) {
      self.nodes.add({
        id: token.id,
        label: token.text,
        hover: token.pos
      });
      self.edges.add({
        from: token.head_id,
        to: token.id,
        label: token.dep,
        arrows: 'to'
      });
    });
  };

  self.toggle = function(id, head=true, collapsing=undefined) {
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
        self.toggle(child_id, false, collapsing)
      }
    });
  };
}
