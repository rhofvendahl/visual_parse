var ParseTree = function() {
  var self = this;

  self.nodes = new vis.DataSet();
  self.edges = new vis.DataSet();

  self.tokenNodes = []
  self.root = null;

  var container = document.getElementById('visual');
  var data = {nodes: self.nodes, edges: self.edges};
  var options = {};
  self.network = new vis.Network(container, data, options);

  self.tokens = [];
  self.root = undefined;

  // RETURN TOKENNODE BY ID
  self.getTokenNode = function(id) {
    var match = null;
    self.tokenNodes.forEach(function(tokenNode) {
      if (tokenNode.id == id) match =  tokenNode;
    });
    return match;
  }

  // TURN TOKENS INTO TOKENNODES
  self.import = function(tokens) {
    self.tokenNodes = [];
    self.root = null;

    if (tokens.length > 0) {
      var rootId;
      tokens.forEach(function(token) {
        if (token.dep == 'ROOT') rootId = token.id;
      });

      // create tokenNodes
      var importSubtree = function(token) {
        self.tokenNodes.push(new TokenNode(self, token))
        token.child_ids.forEach(function(childId) {
          importSubtree(tokens[childId])
        });
      };
      importSubtree(tokens[rootId]);

      self.root = self.getTokenNode(rootId);
    }
    // remove additional nodes
    self.nodes.getIds().forEach(function(id) {
      if (!self.getTokenNode(id)) {
        self.nodes.remove(id);
      }
    });
  }

  // RENDER TOKENNODES
  self.render = function(tokenNode=self.root) {
    if (tokenNode) {
      tokenNode.render();
      tokenNode.children.forEach(function(child) {
        self.render(child)
      })
    }
  }

  // PROCESS QUERY, DISPLAY RESULTS
  self.process = function(query) {
    fetch('/parse?query=' + query)
    .then(function(response) {
      return response.json();
    })
    .then(function(tokens) {
      self.import(tokens);
      self.render();
    });
  };

  // COLLAPSE SUBTREE WHEN CLICKED
  self.network.on('click', function(properties) {
    if (properties.nodes.length > 0) {
      tokenNode = self.getTokenNode(properties.nodes[0]);
      tokenNode.collapsed = !tokenNode.collapsed;
      self.render();
    }
  });
}
