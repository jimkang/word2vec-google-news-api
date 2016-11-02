#!/usr/bin/env node

/* global process */

var W2VServer = require('./word2vec-google-news-api-server');
var logFormat = require('log-format');
const port = 6666;

const annoyIndexPath = '/opt/google-news-w2v/google-news-w2v.annoy';
const wordIndexDbPath = '/opt/google-news-w2v/word-index-google-news.db';

W2VServer(
  {
    annoyIndexPath: annoyIndexPath,
    wordIndexDbPath: wordIndexDbPath
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
    }
    else {
      process.stdout.write(logFormat(server.name, 'listening at', server.url));
    }
  }
}
