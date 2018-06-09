#!/usr/bin/env node

/* global process */

var W2VServer = require('./word2vec-google-news-api-server');
var logFormat = require('log-format');
const port = 9666;

const annoyIndexPath =
  '/opt/google-news-w2v/google-news-angular-2018-build.annoy';
const wordIndexDbPath = '/opt/google-news-w2v/word-index-google-news.db';

//const annoyIndexPath =
//  '../annoy-node/tests/data/google-news-manhattan-2018-build.annoy';
//const wordIndexDbPath = '../annoy-node/tests/data/word-index-google-news.db';

W2VServer(
  {
    annoyIndexPath,
    wordIndexDbPath,
    metric: 'Angular'
  },
  useServer
);

function useServer(error, server) {
  if (error) {
    process.stderr.write(error);
    process.exit(1);
    return;
  }

  server.listen(port, onReady);

  function onReady(error) {
    if (error) {
      process.stderr.write(error);
    } else {
      process.stdout.write(logFormat(server.name, 'listening at', server.url));
    }
  }
}
