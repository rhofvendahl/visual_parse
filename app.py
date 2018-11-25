from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

import spacy

nlp = spacy.load('en_core_web_sm')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/parse')
def parse():
    query = request.args.get('query')
    doc = nlp(query)

    tokens = []
    for token in doc:
        tokens  += [{
            'id': token.i,
            'text': token.text,
            'pos': token.pos_,
            'head_id': token.head.i,
            'dep': token.dep_,
            'collapsed': False,
            'collapsed_text': ' '.join([token.text for token in token.subtree]),
            'child_ids': [child.i for child in token.subtree if child != token]
        }]
    return jsonify({'tokens': tokens})

if __name__ == "__main__":
    app.run()
