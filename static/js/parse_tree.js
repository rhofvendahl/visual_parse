var ParseTree = function() {
    var self = this;

    self.nodes = new vis.DataSet();
    self.edges = new vis.DataSet();

    var container = document.getElementById('visualization');
    var data = {nodes: self.nodes, edges: self.edges};
    var options = {};
    self.network = new vis.Network(container, data, options);

    self.tokenNodes = []

    //// DOESN'T BELONG
    // RETURN TOKENNODE BY ID
    self.getTokenNode = function(id) {
        var match = null;
        self.tokenNodes.forEach(function(tokenNode) {
            if (tokenNode.id == id) match = tokenNode;
        });
        return match;
    }

    // GENERATE TOKENNODES FROM TOKENS, render
    self.importSubtree = function(tokens, token) {
        tokenNode = new TokenNode(self, token);
        self.tokenNodes.push(tokenNode);
        token.child_ids.forEach(function(childId) {
            self.importSubtree(tokens, tokens[childId])
        });
    }

    self.renderSubtree = function(tokenNode) {
        tokenNode.render();
        tokenNode.children.forEach(function(child) {
            self.renderSubtree(child);
        });
    }
    //// BELONS HERE
    // PROCESS QUERY, DISPLAY RESULTS
    self.process = function(text) {
        console.log('Processing...')
        fetch('/parse', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            console.log(json);

            self.tokenNodes = []
            json.tokens.forEach(function(token) {
                if (token.dep == 'ROOT') {
                    self.importSubtree(json.tokens, token);
                    self.renderSubtree(self.getTokenNode(token.id));
                }
            });

            // remove additional nodes
            self.nodes.getIds().forEach(function(id) {
                if (!self.getTokenNode(id)) {
                    self.nodes.remove(id);
                }
            });

            // var nodeIds = [];
            //
            // // create reference entities
            // json.model.entities.forEach(function(entity) {
            //     node_ids.push('e' + entity.id);
            //     self.nodes.update({
            //         id: 'e' + entity.id,
            //         label: entity.text,
            //         title: entity.class,
            //         color: 'pink'
            //     });
            // });
            //
            // // create propositions
            // json.model.statements.forEach(function(statement) {
            //     console.log(statement.source)
            //     if (statement.source == 'extractor') {
            //         node_ids.push('s' + statement.id);
            //         self.nodes.update({
            //             id: 's' + statement.id,
            //             label: statement.subject_text + ' ' + statement.predicate_text + ' ' + statement.object_text,
            //             title: statement.source,
            //             color: 'lightgrey'
            //         });
            //
            //         self.edges.update({
            //             id: 's' + statement.id + '_e' + statement.subject_id,
            //             to: 's' + statement.id,
            //             from: 'e' + statement.subject_id
            //         });
            //     }
            // });
            //
            // // create event2mind stuff
            // json.model.inferences.forEach(function(inference) {
            //     if (inference.weight > .04) {
            //         e2m_statement = undefined
            //         json.model.statements.forEach(function(statement) {
            //             if (statement.id == inference.to) {
            //                 e2m_statement = statement
            //             }
            //         });
            //         node_ids.push('s' + e2m_statement.id);
            //         self.nodes.update({
            //             id: 's' + e2m_statement.id,
            //             label: e2m_statement.subject_text + ' ' + e2m_statement.predicate_text + ' ' + e2m_statement.object_text,
            //             title: e2m_statement.source,
            //             color: 'lightblue'
            //         });
            //
            //         self.edges.update({
            //             id: 'i' + inference.id,
            //             to: 's' + inference.to,
            //             from: 's' + inference.from,
            //             arrows: 'to',
            //             label: (Math.round(inference.weight * 100) / 100).toString(),
            //             title: inference.source
            //         });
            //     }
            // });
            //
            // // remove additional nodes
            // self.nodes.getIds().forEach(function(id) {
            //     remove = true
            //     node_ids.forEach(function(node_id) {
            //         if (id == node_id) remove = false;
            //     });
            //     if (remove) {
            //         self.nodes.remove(id);
            //     }
            // });
        });
    };

    //// BELONGS HERE
    // COLLAPSE SUBTREE WHEN CLICKED
    self.network.on('click', function(properties) {
        if (properties.nodes.length > 0) {
            tokenNode = self.getTokenNode(properties.nodes[0]);
            tokenNode.collapsed = !tokenNode.collapsed;
            self.renderSubtree(tokenNode);
        }
    });
}
