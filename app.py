from flask import Flask, render_template, request, jsonify
from modl import Model

app = Flask(__name__)

import spacy
print('Loading en_core_web_lg...')
nlp = spacy.load('en_core_web_lg')
print('Load complete.')

model = Model()

def get_token_list(doc_instance):
    noun_chunk_tokens = [chunk.root for chunk in doc_instance.noun_chunks]
    token_list = [{
            'id': token.i,
            'text': token.text,
            'tag': token.tag_,
            'pos': token.pos_,
            'head_id': token.head.i,
            'dep': token.dep_,
            'noun_chunk_head': token in noun_chunk_tokens,
            'collapsed_text': ' '.join([token.text for token in token.subtree]),
            'child_ids': [child.i for child in token.children]
        } for token in doc_instance]
    return token_list

def get_model_dict(model_instance):
    model_dict = {
        'entities': [{
            'id': entity.id,
            'text': entity.text,
            'class': entity.class_
        } for entity in model.entities],
        'statements': [{
            'id': statement.id,
            'subject_text': statement.subject_text,
            'subject_id': statement.subject_id,
            'predicate_text': statement.predicate_text,
            'object_text': statement.object_text,
            'object_id': statement.object_id,
            'statement_text': statement.statement_text,
            'kephrase_text': statement.keyphrase_text,
            'source': statement.source
        } for statement in model.statements],
        'inferences': [{
            'id': inference.id,
            'to': inference.to,
            'from': inference.from_,
            'weight': inference.weight,
            'source': inference.source
        } for inference in model_instance.inferences]
    }
    return model_dict

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/parse', methods=['POST'])
def parse():
    content = request.get_json()
    doc = nlp(content['text'])

    return jsonify({
        'tokens': get_token_list(doc)
    })

@app.route('/parse_experimental_also', methods = ['POST'])
def parse_experimental_also():
    content = request.get_json()
    model.process(content['text'])
    doc = model.doc

    return jsonify({
        'tokens': get_token_list(doc),
        'model': get_model_dict(model)
    })

@app.route('/parse_experimental_only', methods = ['POST'])
def parse_experimental_only():
    content = request.get_json()
    model.process(content['text'])

    return jsonify({
        'model': get_model_dict(model)
    })

if __name__ == "__main__":
    app.run()

# from flask import Flask, render_template, request, jsonify
# from modl import Model
#
# app = Flask(__name__)
#
# @app.route('/')
# def index():
#     return render_template('index.html')
#
# @app.route('/model', methods = ['POST'])
# def model():
#     content = request.get_json()
#     model = Model(content['text'])
#
#     model_dict = {
#         'entities': [{
#             'id': entity.id,
#             'text': entity.text,
#             'class': entity.class_
#         } for entity in model.entities],
#         'statements': [{
#             'id': statement.id,
#             'subject_text': statement.subject_text,
#             'subject_id': statement.subject_id,
#             'predicate_text': statement.predicate_text,
#             'object_text': statement.object_text,
#             'object_id': statement.object_id,
#             'statement_text': statement.statement_text,
#             'kephrase_text': statement.keyphrase_text,
#             'source': statement.source
#         } for statement in model.statements],
#         'inferences': [{
#             'id': inference.id,
#             'to': inference.to,
#             'from': inference.from_,
#             'weight': inference.weight,
#             'source': inference.source
#         } for inference in model.inferences]
#     }
#     return jsonify({'model': model_dict})
#
# if __name__ == "__main__":
#     app.run()
