# from https://github.com/chartbeat-labs/textacy/blob/master/textacy/constants.py
AUX_DEPS = {"aux", "auxpass", "neg"}


# from https://chartbeat-labs.github.io/textacy/_modules/textacy/spacier/utils.html
import itertools
import re

def get_span_for_verb_auxiliaries(verb):
    """
    Return document indexes spanning all (adjacent) tokens
    around a verb that are auxiliary verbs or negations.
    """
    min_i = verb.i - sum(
        1
        for _ in itertools.takewhile(
            lambda x: x.dep_ in AUX_DEPS, reversed(list(verb.lefts))
        )
    )
    max_i = verb.i + sum(
        1
        for _ in itertools.takewhile(
            lambda x: x.dep_ in AUX_DEPS, verb.rights
        )
    )
    return (min_i, max_i)

# from https://github.com/chartbeat-labs/textacy/blob/master/textacy/preprocessing/resources.py
RE_LINEBREAK = re.compile(r"(\r\n|[\n\v])+")
RE_NONBREAKING_SPACE = re.compile(r"[^\S\n\v]+", flags=re.UNICODE)

# from https://github.com/chartbeat-labs/textacy/blob/master/textacy/preprocessing/normalize.py
import unicodedata

def normalize_unicode(text, *, form="NFC"):
    """
    Normalize unicode characters in ``text`` into canonical forms.
    Args:
        text (str)
        form ({"NFC", "NFD", "NFKC", "NFKD"}): Form of normalization applied to
            unicode characters. For example, an "e" with accute accent "´" can be
            written as "e´" (canonical decomposition, "NFD") or "é" (canonical
            composition, "NFC"). Unicode can be normalized to NFC form
            without any change in meaning, so it's usually a safe bet. If "NFKC",
            additional normalizations are applied that can change characters' meanings,
            e.g. ellipsis characters are replaced with three periods.
    See Also:
        https://docs.python.org/3/library/unicodedata.html#unicodedata.normalize
    """
    return unicodedata.normalize(form, text)


def normalize_whitespace(text):
    """
    Replace all contiguous line-breaking whitespaces with a single newline and
    all contiguous non-breaking whitespaces with a single space, then
    strip any leading/trailing whitespace.
    Args:
        text (str)
    Returns:
        str
    """
    return RE_NONBREAKING_SPACE.sub(" ", RE_LINEBREAK.sub(r"\n", text)).strip()

# from https://github.com/cbaziotis/ekphrasis/blob/master/ekphrasis/utils/nlp.py
def unpack_contractions(text):
    """
    Replace *English* contractions in ``text`` str with their unshortened forms.
    N.B. The "'d" and "'s" forms are ambiguous (had/would, is/has/possessive),
    so are left as-is.
    ---------
    ---------
    Important Note: The function is taken from textacy (https://github.com/chartbeat-labs/textacy).
    See textacy.preprocess.unpack_contractions(text)
    -> http://textacy.readthedocs.io/en/latest/api_reference.html#textacy.preprocess.unpack_contractions
    The reason that textacy is not added as a dependency is to avoid having the user to install it's dependencies (such as SpaCy),
    in order to just use this function.
    """
    # standard
    text = re.sub(
        r"(\b)([Aa]re|[Cc]ould|[Dd]id|[Dd]oes|[Dd]o|[Hh]ad|[Hh]as|[Hh]ave|[Ii]s|[Mm]ight|[Mm]ust|[Ss]hould|[Ww]ere|[Ww]ould)n't",
        r"\1\2 not", text)
    text = re.sub(
        r"(\b)([Hh]e|[Ii]|[Ss]he|[Tt]hey|[Ww]e|[Ww]hat|[Ww]ho|[Yy]ou)'ll",
        r"\1\2 will", text)
    text = re.sub(r"(\b)([Tt]hey|[Ww]e|[Ww]hat|[Ww]ho|[Yy]ou)'re", r"\1\2 are",
                  text)
    text = re.sub(
        r"(\b)([Ii]|[Ss]hould|[Tt]hey|[Ww]e|[Ww]hat|[Ww]ho|[Ww]ould|[Yy]ou)'ve",
        r"\1\2 have", text)
    # non-standard
    text = re.sub(r"(\b)([Cc]a)n't", r"\1\2n not", text)
    text = re.sub(r"(\b)([Ii])'m", r"\1\2 am", text)
    text = re.sub(r"(\b)([Ll]et)'s", r"\1\2 us", text)
    text = re.sub(r"(\b)([Ww])on't", r"\1\2ill not", text)
    text = re.sub(r"(\b)([Ss])han't", r"\1\2hall not", text)
    text = re.sub(r"(\b)([Yy])(?:'all|a'll)", r"\1\2ou all", text)
    return text

# from https://github.com/chartbeat-labs/textacy/blob/master/textacy/preprocessing/remove.py
def remove_accents(text, *, fast=False):
    """
    Remove accents from any accented unicode characters in ``text``, either by
    replacing them with ASCII equivalents or removing them entirely.
    Args:
        text (str)
        fast (bool): If False, accents are removed from any unicode symbol
            with a direct ASCII equivalent ; if True, accented chars
            for all unicode symbols are removed, regardless.
            .. note:: ``fast=True`` can be significantly faster than ``fast=False``,
               but its transformation of ``text`` is less "safe" and more likely
               to result in changes of meaning, spelling errors, etc.
    Returns:
        str
    Raises:
        ValueError: If ``method`` is not in {"unicode", "ascii"}.
    See Also:
        For a more powerful (but slower) alternative, check out ``unidecode``:
        https://github.com/avian2/unidecode
    """
    if fast is False:
        return "".join(
            char
            for char in unicodedata.normalize("NFKD", text)
            if not unicodedata.combining(char)
        )
    else:
        return (
            unicodedata.normalize("NFKD", text)
            .encode("ascii", errors="ignore")
            .decode("ascii")
        )
