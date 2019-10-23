var UpdateManager = function(input) {
    var self = this;

    self.parseTree = new ParseTree();
    self.experiment = new Experiment();

    self.input = input;

    self.dirty = false;
    self.updating = false;

    self.startUpdating = function() {
        self.updating = true;
        self.dirty = false;
        fetch('/parse', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: input.val()
            })
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            // console.log(json);
            self.parseTree.render(json.tokens);
        }).then(function() {
            if (self.dirty)  {
                self.startUpdating();
            } else {
                self.finishUpdating();
            }
        });
    }

    self.finishUpdating = function() {
        self.updating = false;
        fetch('/parse_experimental_only', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: input.val()
            })
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            // console.log(json);
            self.experiment.render(json.model);
        });
    }

    self.input.on('input', function(event) {
        self.dirty = true;
        if (!self.updating) {
            self.startUpdating();
        }
    });
}
