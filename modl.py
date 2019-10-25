import spacy
from spacy.tokens import Span # Doc, Span, Token
import textacy
from event2mind_hack import load_event2mind_archive
from allennlp.predictors.predictor import Predictor
import math
import re

Span.set_extension('entity_id', default=None, force=True)

archive = load_event2mind_archive('data/event2mind.tar.gz')
event2mind_predictor = Predictor.from_archive(archive)

print('loading en_coref_sm...')
nlp = spacy.load('en_coref_sm')
print('done')

class Entity:
    def __init__(self, id_, text, class_):
        self.id = id_
        self.text = text
        self.class_ = class_

class Statement:
    def __init__(self, id_, subject_text, predicate_text, subject_id=None, object_text=None, object_id=None, source=None):
        self.id = id_
        self.subject_text = subject_text
        self.subject_id = subject_id
        self.predicate_text = predicate_text
        self.object_text = object_text
        self.object_id = object_id

        self.statement_text = self.get_statement_text()
        self.keyphrase_text = self.get_keyphrase_text()
        print('source at source is ', source)
        self.source = source

    def get_statement_text(self):
        statement_text = self.subject_text + ' ' + self.predicate_text
        if self.object_text != None:
            statement_text += self.object_text
        return statement_text

    def get_keyphrase_text(self):
        if self.predicate_text == 'feels':
            return self.object_text + ' ' + self.subject_text
        return None

class Inference:
    def __init__(self, id_, to, from_, weight, source):
        self.id = id_
        self.to = to
        self.from_ = from_
        self.weight = weight
        self.source = source

# memoryless for now; each change to text means a whole new model
class Model:
    def __init__(self):
        pass

    def process(text):
        self.raw = text
        preprocessed = textacy.preprocess.normalize_whitespace(text)
        preprocessed = textacy.preprocess.fix_bad_unicode(preprocessed)
        preprocessed = textacy.preprocess.unpack_contractions(preprocessed)
        preprocessed = textacy.preprocess.remove_accents(preprocessed)
#         preprocessed = textacy.preprocess.preprocess_text(preprocessed, fix_unicode=True, no_contractions=True, no_accents=True)
        self.doc = nlp(preprocessed)
        self.named_entities = [ent for ent in self.doc.ents]
        self.noun_chunks = [chunk for chunk in self.doc.noun_chunks]

        self.user = None
        # TODO: named entity recognition sometimes doesn't recognize people? add in a name recognizer.
        self.entities = []
        self.extract_user_entity()
        self.extract_coref_entities()

        # create entities for the rest of the noun chunks
        for noun_chunk in self.noun_chunks:
            print('noun_chunk_entity_id_is', noun_chunk._.entity_id)
            if noun_chunk._.entity_id == None:
                entity = Entity(id_=len(self.entities), text=noun_chunk.text, class_='THINGfromnchunk')
                # print('noun chunk to entity', entity.text, entity.class_)
                self.entities.append(entity)
                noun_chunk._.entity_id = entity.id

        # assumes all subjects come before verbs...or at least, only extracts where true
        self.statements = []
        for sent in self.doc.sents:
            self.extract_statements(sent)

        self.inferences = []
        self.generate_event2mind_statements()


    def get_entity_refs(self, entity_id):
        entity_refs = []
        for nc in self.noun_chunks:
            if nc._.entity_id == entity_id:
                entity.refs.append(nc)
        return entity_refs

    def get_entity(self, entity_id):
        for entity in self.entities:
            if entity.id == entity_id:
                return entity
        return None

    def get_statement(self, statement_id):
        for statement in self.statements:
            if statement.id == statement_id:
                return statement
        return None

    def get_or_create_statement(self, subject_text, predicate_text, subject_id=None, object_text=None, object_id=None, source=None):
        print('source is ', source)
        for s in self.statements:
            if s.subject_text == subject_text and s.subject_id == subject_id and s.predicate_text == predicate_text and s.object_text == object_text and s.object_id == object_id:
                return s
        else:
            statement = Statement(
                id_=len(self.statements),
                subject_text = subject_text,
                subject_id = subject_id,
                predicate_text = predicate_text,
                object_text = object_text,
                object_id = object_id,
                source = source
            )
            self.statements.append(statement)
            return statement

    def get_inference(self, inference_id):
        for inference in self.inferences:
            if inference.id == inference_id:
                return inference
        return None

    def extract_user_entity(self):
        text = 'User'
        class_ = 'PERSON'
        entity = Entity(id_=len(self.entities), text = text, class_=class_)
        self.user = entity
        self.entities.append(entity)

        for chunk in self.doc.noun_chunks:
            if chunk.root.text.lower() in ['i', 'me', 'myself']:
                chunk._.entity_id = entity.id

            # TODO: catch possessives, create 'belongs to' & entity

    def extract_coref_entities(self):
        def get_match(span_to_match, spans):
            for span in spans:
                if span.root.i == span_to_match.root.i:
                    return span # TODO: what if there are somehow multiple named entities with same root as mention?
            return None

        if self.doc._.coref_clusters != None:
            for cluster in self.doc._.coref_clusters:

                # find named entity w same root as main mention
                entity_ref = get_match(cluster.main, self.named_entities)

                # else find named entity w same root as any mention
                if entity_ref == None:
                    for mention in cluster.mentions:
                        entity_ref = get_match(mention, self.named_entities) # TODO: what if different mentions have different entities?

                # else use main mention for named entity match
                if entity_ref == None:
                    entity_ref = cluster.main

                # don't work with corefs that are user or don't have noun chunk
                # TODO: is it dumb to not work with corefs that don't have noun chunk?
                not_user = entity_ref.root.text.lower() not in ['i', 'me', 'myself'] #TODO: replace with something that doesn't allow duplicate entities (unless I want them order independent?)
                nc_match = get_match(entity_ref, self.noun_chunks) # TODO: if no nc matched it might be possessive or something, in which case add that then 'belong to'
                if not_user and nc_match != None:
                    text = entity_ref.text
                    if entity_ref.label_ == '':
                        class_ = 'THINGfromcoref'
                    else:
                        class_ = entity_ref.label_

                    id_ = len(self.entities)
                    entity = Entity(id_=id_, text = text, class_=class_)
                    self.entities.append(entity)

                    # TODO: I'm setting some of these twice - is that bad?
                    for mention in cluster.mentions:
                        if mention.root.pos_ in ['NOUN', 'PROPN', 'PRON']:

                            # only set extension for mentions with noun chunk matches
                            # TODO: is it dumb to set extension for noun chunk, not direct? it's usually the same..when is it not?
                            nc_match = get_match(mention, self.noun_chunks)
                            if nc_match != None:
                                nc_match._.entity_id = entity.id

    # TODO: needs fine tuning, strips a lot out and adds some that shouldn't be
    def extract_statements(self, span, previous_subject=None, previous_predicate=None):
        # TODO: I think sometimes conjunctions are missing predicates? maybe not
        # TODO: some subjects are 'they' or 'mary and sue' - split into two statements, one for each.
        first, last = textacy.spacier.utils.get_span_for_verb_auxiliaries(span.root)
        beginning = self.doc[span.start:first]
        middle = self.doc[first:last+1]
        end = self.doc[last+1:span.end]

        # if beginning has nsubj token and that token is in a noun chunk, set noun chunk as subject entity
        # assumes there aren't two nsubj in beginning, safe?
        subjects = []
        for token in beginning:
            # token gets added as a subject no matter what
            # for now assumes that all noun chunks get added, as well as all with dep_ 'subj'
            # if token.dep_ == 'nsubj':
            is_chunk = False
            for noun_chunk in self.noun_chunks:
                if noun_chunk.root == token:
                    is_chunk = True
                    break
            if is_chunk or token.dep_ == 'nsubj':
                # so that every subject has an entity
                # TODO: but not all objects have entities
                subject = self.doc[token.i:token.i+1]
                if subject._.entity_id == None:
                    entity = Entity(id_=len(self.entities), text = subject.text, class_=None)
                    self.entities.append(entity)
                subjects.append(subject)

        # TODO: just use it if you can't find noun chunk

        # if this is being called on remainder (conjunction) with no subject, use previous subject
        # eg 'I need to drink, and to drink': 'and to eat' borrows 'I' for subject
        if len(subjects) == 0 and previous_subject != None:
            subjects.append(previous_subject)

        # TODO: process the verb phrase a little to consolidate statements
        # use textacy's consolidate?
        predicate = middle

        conjuncted = None
        for token in end:
            if token.dep_ == 'conj':
                object_ = self.doc[last+1:token.left_edge.i]
                conjuncted = self.doc[token.left_edge.i:token.right_edge.i+1]
                break
        else:
            object_ = end

        while self.doc[object_.end-1].dep_ in ['cc', 'punct']:
            object_ = self.doc[object_.start:object_.end-1]

        if len(subjects) > 0 and predicate != None:
            if predicate.text == '\'s':
                predicate_text = 'is'
            else:
                predicate_text = predicate.text
            if object_ == None:
                object_text = None
            else:
                object_text = object_.text
            for subject in subjects:
                statement = self.get_or_create_statement(
                    subject_text = subject.text,
                    subject_id = subject._.entity_id, # sometimes None, is that bad form?
                    predicate_text = predicate.text,
                    object_text = object_text,
                    object_id = None, # for now, later might extract entity from subject phrase
                    source = 'extractor'
                )

                # TODO: this might make duplicates if multiple subjects, fix that
                if conjuncted != None:
                    self.extract_statements(conjuncted, previous_subject=subject)

    def generate_event2mind_statements(self):
        # TODO: sub PersonY for people in subject
        # TODO: needs refactoring generally (everything does..)
        # TODO: the differening text all over the place is a nightmare, fix

        # for turning emotion string texts into proper emotion strings
        def str_to_list(emotion_str):
            emotion_str = emotion_str[2:-2]
            if emotion_str[-1] == '.':
                emotion_str = emotion_str[:-1]
            return re.split('","|", "|, ',emotion_str)

        person_statements = []
        # TODO: with a db this would be an sql query or something
        for statement in self.statements:
             if statement.subject_id != None:
                subject_entity = self.get_entity(statement.subject_id)
                if subject_entity != None and subject_entity.class_ == 'PERSON':
                    person_statements.append(statement)
        for statement in person_statements:
            subject_entity = self.get_entity(statement.subject_id)
            prediction = event2mind_predictor.predict(
              source='PersonX ' + str(statement.predicate_text) + ' ' + str(statement.object_text)
            )

            for emotion, log_p in zip(
                prediction['xreact_top_k_predicted_tokens'],
                prediction['xreact_top_k_log_probabilities']
            ):
                emotion = ' '.join(emotion)
                p = math.exp(log_p)

                feels_statement = self.get_or_create_statement(
                    subject_text = subject_entity.text,
                    subject_id = subject_entity.id,
                    predicate_text = 'feels',
                    object_text = emotion,
                    object_id = None,
                    source = 'event2mind'
                )

                inference = Inference(
                    id_ = len(self.inferences),
                    to = feels_statement.id,
                    from_ = statement.id,
                    weight = p,
                    source = 'event2mind'
                )
                self.inferences.append(inference)

    # def generate_emotional_inferences(self):
    #     feeling_statements = [statement for statement]
    #     emotions = [statement.subject_text for statement in self.statements if statement.predicate_text == 'feels']




#     def get_resolved_text(self):
#         resolved_text = [token.text_with_ws for token in self.doc]
#         for person in self.people:
#             for ref in person.refs:

#                 # determine resolved value
#                 # resolved_value = '[' + person.name.upper() + ']'
#                 resolved_value = person.name.upper()
#                 if ref.root.tag_ == 'PRP$':
#                     resolved_value += '\'s'
#                 if ref.text_with_ws[-1] == ' ':
#                     resolved_value += ' '

#                 # set first token to value, remaining tokens to ''
#                 resolved_text[ref.start] = resolved_value
#                 for i in range(ref.start+1, ref.end):
#                     resolved_text[i] = ''
#         return ''.join(resolved_text)
