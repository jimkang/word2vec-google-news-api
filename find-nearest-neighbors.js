var Annoy = require('annoy');
var Sublevel = require('level-sublevel');
var sb = require('standard-bail')(); // TODO: Provide non-blocking logger here.
var callNextTick = require('call-next-tick');
var queue = require('d3-queue').queue;
var waterfall = require('async-waterfall');

function FindNearestNeighbors({annoyIndexPath, wordIndexDb}, createDone) {
  var annoyIndex = new Annoy(300, 'Angular');
  var indexesForWords;
  var wordsForIndexes;

  if (!annoyIndex.load(annoyIndexPath)) {
    callNextTick(createDone, new Error('Could not load Annoy index.'));
    return;
  }

  var subleveledDB = Sublevel(wordIndexDb);
  indexesForWords = subleveledDB.sublevel('indexes');
  wordsForIndexes = subleveledDB.sublevel('words');
  callNextTick(createDone, null, findNearestNeighbors);

  function findNearestNeighbors(words, operation, numberOfNeighbors, done) {
    if (words.length === 1) {
      indexesForWords.get(words[0], sb(getNeighborsToIndex, done));
    }
    else if (words.length > 1) {
      var op = 'add';
      if (operation && operation === 'subtract') {
        op = operation;
      }

      waterfall(
        [
          getIndexesForWords,
          getVectorsForIndexes,
          sumVectors,
          getNeighborsForVector,
          translateAnnoyResults
        ],
        done
      );
    }
    else {
      callNextTick(done, null, []);
    }

    function getIndexesForWords(getIndexesDone) {
      var q = queue(100);
      words.forEach(queueIndexLookup);
      q.awaitAll(getIndexesDone);

      function queueIndexLookup(word) {
        q.defer(indexesForWords.get, word);
      }
    }

    function getNeighborsForVector(v, done) {
      callNextTick(
        done,
        null,
        annoyIndex.getNNsByVector(v, numberOfNeighbors + words.length, -1, true)
      );
    }

    function getNeighborsToIndex(index, done) {
      translateAnnoyResults(
        annoyIndex.getNNsByItem(
          index, numberOfNeighbors + words.length, -1, true
        ),
        done
      );
    }

    function translateAnnoyResults(results, done) {
      // console.log(results);
      lookUpWordsForIndexes(results.neighbors, sb(assembleTranslation, done));

      function assembleTranslation(foundWords) {
        var translation = [];
        for (var i = 0; i < foundWords.length; ++i) {
          var foundWord = foundWords[i];
          // Exclude original words.
          if (words.indexOf(foundWord) === -1) {
            translation.push({
              word: foundWord,
              distance: results.distances[i]
            });
          }
        }
        callNextTick(done, null, translation);
      }
    }

    function sumVectors(vectors, done) {
      var sum = [];

      if (vectors.length > 1 && vectors[0].length > 0) {
        let reduceOp = (op === 'subtract') ? subtractVector : addVector;
        sum = vectors.slice(1).reduce(reduceOp, vectors[0]);
      }
      callNextTick(done, null, sum);
    }
  }

  function getVectorsForIndexes(indexStrings, done) {
    callNextTick(
      done, null, indexStrings.map(toInt).map(annoyIndex.getItem.bind(annoyIndex))
    );
  }

  function lookUpWordsForIndexes(indexes, done) {
    var q = queue(100);
    indexes.forEach(queueLookup);
    q.awaitAll(done);

    function queueLookup(index) {
      q.defer(wordsForIndexes.get, index);
    }
  }
}

function toInt(s) {
  return parseInt(s, 10);
}

function addVector(currentSum, v) {
  for (var i = 0; i < currentSum.length; ++i) {
    currentSum[i] += v[i];
  }
  return currentSum;
}

function subtractVector(currentDifference, v) {
  for (var i = 0; i < currentDifference.length; ++i) {
    currentDifference[i] -= v[i];
  }
  return currentDifference;
}

module.exports = FindNearestNeighbors;
