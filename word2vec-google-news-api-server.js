var restify = require('restify');
var FindNearestNeighbors = require('./find-nearest-neighbors');
var level = require('level');

const maxNeighbors = 100;

function Word2VecGoogleNewsAPIServer(
  { annoyIndexPath, wordIndexDbPath },
  done
) {
  // console.log(annoyIndexPath, wordIndexDbPath);
  var findNearestNeighbors;
  var db = level(wordIndexDbPath);

  var server = restify.createServer({
    name: 'word2vec-google-news-api-server'
  });

  server.use(restify.CORS());
  server.use(restify.queryParser());

  server.get('/neighbors', neighborsEndpoint);
  server.get('/health', respondOK);
  server.head(/.*/, respondHead);

  server.shutDown = shutDown;

  var nnOpts = {
    annoyIndexPath: annoyIndexPath,
    wordIndexDb: db
  };

  FindNearestNeighbors(nnOpts, saveFindNN);

  function saveFindNN(error, fnn) {
    if (error) {
      done(error);
    } else {
      findNearestNeighbors = fnn;
      done(null, server);
    }
  }

  function neighborsEndpoint(req, res, next) {
    var words;
    var operation;

    if (req.query.words) {
      words = req.query.words.split(',');
    }
    if (req.query.operation) {
      operation = req.query.operation;
    }

    if (!words || words.length < 1) {
      next(new Error('No words provided to /neighbors.'));
    } else {
      var numberOfNeighbors = 10;
      if (!isNaN(req.query.quantity)) {
        numberOfNeighbors = parseInt(req.query.quantity);
      }
      if (numberOfNeighbors > maxNeighbors) {
        numberOfNeighbors = maxNeighbors;
      }
      findNearestNeighbors(words, operation, numberOfNeighbors, checkNeighbors);
    }

    function checkNeighbors(error, neighbors) {
      if (error) {
        next(error);
      } else {
        respondWithJSON(neighbors, res, next);
      }
    }
  }

  function shutDown(done) {
    db.close(closeServer);

    function closeServer(error) {
      if (error) {
        done(error);
      } else {
        server.close(done);
      }
    }
  }
}

function respondOK(req, res, next) {
  res.send(200, 'OK!');
  next();
}

function respondWithJSON(jsonObject, res, next) {
  res.json(jsonObject);
  res.end();
  next();
}

function respondHead(req, res, next) {
  res.writeHead(200, {
    'content-type': 'application/json'
  });
  res.end();
  next();
}

module.exports = Word2VecGoogleNewsAPIServer;
