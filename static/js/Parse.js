var Parse = function() {
  var self = this;

  self.nodes = new vis.DataSet();
  self.edges = new vis.DataSet();

  var container = document.getElementById('visual');
  var data = {nodes: self.nodes, edges: self.edges};
  var options = {};
  self.network = new vis.Network(container, data, options);

  self.tokens = [];
  self.root = undefined;

  // collapse nodes where collapse=true
  self.update_visual = function(id=self.rootId, head=true, hidden=false) {
    token = this.tokens[id]
    if (head) {
      self.nodes.update({
        id: id,
        label: (token.collapsed ? token.collapsedText : token.text),
        hidden: false
      })
    }

    // start hidden if collapsed, call recursively
    if (token.collapsed) hidden = true;
    token.childIds.forEach(function(childId) {
      child = self.tokens[childId]
      self.nodes.update({
        id: childId,
        label: (child.collapsed ? child.collapsedText : child.text),
        hidden: hidden
      });
      self.update_visual(childId, false, hidden)
    });
  };

  // collapse when clicked
  self.network.on('click', function(properties) {
    if (properties.nodes.length > 0) {
      token = self.tokens[properties.nodes[0]];
      token.collapsed = !token.collapsed;
      self.update_visual(properties.nodes[0]);
    }
  });

  // update from query
  self.update = function(query) {
    fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      self.tokens = json;
      self.tokens.forEach(function(token) {

        // collapse noun chunks
        token.collapsed = token.nounChunkHead;

        // color nouns pink and verbs blue
        if (token.pos == 'NOUN' || token.pos == 'PRON') {
          token.color = 'pink';
        } else if (token.pos == 'VERB') {
          token.color = 'lightblue';
        } else {
          token.color = 'lightgrey'
        }

        // set root of parse tree
        if (token.dep == 'ROOT') self.rootId = token.id;
        self.nodes.update({
          id: token.id,
          label: token.text,
          title: tagDescriptions[token.tag],
          color: token.color,
        });
        self.edges.update({
          id: token.id,
          from: token.headId,
          to: token.id,
          label: token.dep,
          title: depDescriptions[token.dep],
          arrows: 'to'
        });
      });

      // remove extra nodes
      for (var i = self.tokens.length; i < self.nodes.length; i++) {
        self.nodes.remove(i);
      }

      if (self.tokens.length > 0) self.update_visual();
    });
  };
}
