function Parse() {
  this.nodes = []
  this.edges = []
  this.parseJson - function(json) {
    for (var i; i < json.words.length; i++) {
      node = {
        id: i,
        label: json.words[i].text,
        title: json.words[i].tag
      }
      this.nodes.append(node)
    }
    for (var i; i < json.arcs.length; i++) {
      edge = {
        from
      }
    }
  }
}
