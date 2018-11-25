from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

import spacy
from spacy import displacy

print('loading en_core_web_sm...')
nlp = spacy.load('en_core_web_sm')
print('done')

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
            'collapsed': False,
            'collapsed_text': ' '.join([token.text for token in token.subtree]),
            'child_ids': [child.i for child in token.subtree if child != token],
            'head_id': token.head.i,
            'dep': token.dep_
        }]
    print(tokens)
    return jsonify({'tokens': tokens})

if __name__ == "__main__":
    app.run()

# @socketio.on('msg_user', namespace='/chat')
# def test_message(msg):
#     content = msg['content']
#     session = session_client.session_path(PROJECT_ID, msg['session_id'])
#     text_input = dialogflow.types.TextInput(text=msg['content'], language_code='en')
#     query_input = dialogflow.types.QueryInput(text=text_input)
#     response = session_client.detect_intent(session=session, query_input=query_input)
#
#     emit('msg_agent', {'content': response.query_result.fulfillment_text})
#
#     doc = nlp(content)
#
#     nodes = []
#     edges = []
#     for token in doc:
#         if token.pos_ in ['PRON', 'NOUN']:
#             color = 'pink'
#         elif token.pos_ == 'VERB':
#             color = 'lightblue'
#         else:
#             color = 'lightgrey'
#         nodes += [{
#             'id': token.idx,
#             'label': token.text,
#             'title': token.pos_,
#             'color': color
#         }]
#         edges += [{
#             'from': token.head.idx,
#             'to': token.idx,
#             'label': token.dep_,
#             'arrows': 'to'
#         }]
#
#     print(type([token for token in doc]))
#
#     clauses = clausie.clausie(content)
#     for clause in clauses:
#         print(clause)
#     propositions = clausie.extract_propositions(clauses)
#     # print(type(propositions[0]['subject']))
#     # print('AAAAAAAAAAAAAAAAAAAAAAAAA')A
#     for proposition in propositions:
#         print(proposition)
#     clausie.print_propositions(propositions)
#
#     emit('msg_agent', {
#         'content': ' ,'.join([chunk.text for chunk in doc.noun_chunks]),
#         'parse': displacy.parse_deps(doc),
#     })
#
#     emit('dependency_network', {
#         'nodes': nodes,
#         'edges': edges
#     })
#
#     for
#
# if __name__ == "__main__":
# #     socketio.run(app)
#     app.run()
