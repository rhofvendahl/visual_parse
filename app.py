# #############################################################
# import os
# _proc_status = '/proc/%d/status' % os.getpid()
#
# _scale = {'kB': 1024.0, 'mB': 1024.0*1024.0,
#           'KB': 1024.0, 'MB': 1024.0*1024.0}
#
# def _VmB(VmKey):
#     '''Private.
#     '''
#     global _proc_status, _scale
#      # get pseudo file  /proc/<pid>/status
#     try:
#         t = open(_proc_status)
#         v = t.read()
#         t.close()
#     except:
#         return 0.0  # non-Linux?
#      # get VmKey line e.g. 'VmRSS:  9999  kB\n ...'
#     i = v.index(VmKey)
#     v = v[i:].split(None, 3)  # whitespace
#     if len(v) < 3:
#         return 0.0  # invalid format?
#      # convert Vm value to bytes    global _proc_status, _scale
#
#     return float(v[1]) * _scale[v[2]]
#
#
# def memory(since=0.0):
#     '''Return memory usage in bytes.
#     '''
#     return _VmB('VmSize:') - since
#
#
# def resident(since=0.0):
#     '''Return resident memory usage in bytes.
#     '''
#     return _VmB('VmRSS:') - since
#
#
# def stacksize(since=0.0):
#     '''Return stack size in bytes.
#     '''
#     return _VmB('VmStk:') - since
#     ################################################################
# print('pre flask and stuff:', memory() / 1000000, "MB")

from flask import Flask, render_template, request, jsonify
# print('post flask, pre modl:', memory() / 1000000, "MB")

from modl import Model, nlp
# print('post modl:', memory() / 1000000, "MB")

import requests

app = Flask(__name__)

# import spacy
# print('Loading en_core_web_sm...')
# nlp = spacy.load('en_core_web_sm')
# print('Load complete.')

model = Model()
print('pre flask and stuff:', memory() / 1000000, "MB")

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

def fetch_predictions(sources):
    response = requests.post(
        url = 'https://vp-event2mind.herokuapp.com/predict',
        headers={
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data = {'sources': sources})
    print('RESPONSE:', response)
    content = response.json()
    print('CONTENT:', content)
    return content['predictions']

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
    doc = model.doc
    model.process(content['text'])
    sources = model.get_event2mind_sources()
    predictions = fetch_predictions(sources)
    model.generate_event2mind_statements_from_predictions(predictions)

    return jsonify({
        'tokens': get_token_list(doc),
        'model': get_model_dict(model)
    })

@app.route('/parse_experimental_only', methods = ['POST'])
def parse_experimental_only():
    content = request.get_json()
    model.process(content['text'])
    sources = model.get_event2mind_sources()
    predictions = fetch_predictions(sources)
    model.generate_event2mind_statements_from_predictions(predictions)

    return jsonify({
        'model': get_model_dict(model)
    })

# print('right about to run:', memory() / 1000000, "MB")

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
