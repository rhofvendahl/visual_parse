# visualParse

#### Flask NLP Application, Oct 2019

#### By Russell Hofvendahl

## Description

VisualParse is intended as an exploration and visualization of modern technologies for cleaning, parsing, and making inferences on unstructured text.

## Features
#### Dependency Parse Graph
Dependency parse trees, a common tool in NLP and linguistics, represent a sentences syntactic structure as a branching tree, with the main verb as the root and each modifying chunk connected with a labeled arrow.

Traditionally, dependency parse trees are visualize the words in the order written, with relations jumping back and forth between. I've never been able to make sense of this, so I instead used vis.js to represent the parse tree as an interactive graph. I find this much easier to read.

Arrows are labeled with the relation type they represent, noun-chunks are colored red, verbs are colored blue, each word's tool-tip reveals the part of speech and any sub-tree may be collapsed by clicking.

#### Inferential Graph [Experimental]
To the right of the resize-able divider, a number of inferred relations are visualized as a separate graph.

Red nodes again represent noun chunks, now with all co-references ('this', 'that', 'him', 'it', etc.) consolidated into a single entity. Entities recognized as persons are connected with 'statement' nodes derived from the unstructured text. Lastly, for select statements the relevant person's possible state of mind is inferred and represented a series of additional statements, each labeled with the inferential weight.

## Pipeline

## Requirements (WIP)
(requires python3, pip, venv; instructions presume linux)
```
git clone https://github.com/rhofvendahl/visual_parse
cd visual_parse
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt
pip install https://github.com/huggingface/neuralcoref-models/releases/download/en_coref_md-3.0.0/en_coref_md-3.0.0.tar.gz
curl -o data/event2mind.tar.gz https://s3-us-west-2.amazonaws.com/allennlp/models/event2mind-2018.09.17.tar.gz
```

## Setup/Installation

First, clone repository and navigate to directory:
```
git clone https://github.com/rhofvendahl/simcellular_qt
cd simcellular_qt
```
To run:
```
cd simcellular_qt_build
./simcellular_qt
```
To test:
```
cd simcellular_googletest_build
./simcellular_googlet
```
To develop:
1. install Qt Creator with Qt5 ([guide](https://doc.qt.io/qt-5/gettingstarted.html here)).
2. In Qt Creator select "file -> open file or project -> simcellular_qt.pro".

## Technologies Used

Qt, Google Test

### License

Copyright (c) 2018 Russell Hofvendahl

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
