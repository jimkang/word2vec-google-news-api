word2vec-google-news-api
==================

A REST API for the Google News word2vec model provided by the word2vec project.

Installation
------------

Clone this repo.

To build the annoy file that it reads (yes, this is kind of dumb):

- Clone [annoy-node](https://github.com/jimkang/annoy-node) and npm install and follow the instructions to set it up.
- Edit `tests/basictests.js` to use the metric you want (Angular, Euclidean, Manhattan - Angular is what was meant to be used).
- Run `make big-test`.
- It will build an annoy file: `tests/data/very-big-tests.annoy`. That is actually the annoy index for the Google News model. Rename it and copy it to where you need it. (You should probably tar it first.)
- Edit start-word2vec-google-news-api.js to point to your annoy file. Make sure the metric you use (Angular, Euclidean, Manhattan) matches the way you built the file.

Usage
-----

    make run

Tests
-----

Run tests with `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2016 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
