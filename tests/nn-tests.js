var test = require('tape');
var FindNearestNeighbors = require('../find-nearest-neighbors');
var assertNoError = require('assert-no-error');
var level = require('level');

const annoyIndexPath = '../annoy-node/tests/data/google-news-angular.annoy';
const wordIndexDbPath = '../annoy-node/tests/data/word-index-google-news.db';

var testCases = [
  {
    name: 'One word',
    words: ['triangulation'],
    expected: [
      {
        "word": "Clintonian",
        "distance": 1.0059351921081543
      },
      {
        "word": "Clintonism",
        "distance": 1.0545074939727783
      },
      {
        "word": "liberal_internationalism",
        "distance": 1.0681909322738647
      },
      {
        "word": "Rubinomics",
        "distance": 1.0820257663726807
      },
      {
        "word": "liberal_interventionism",
        "distance": 1.1076396703720093
      },
      {
        "word": "Clintonite",
        "distance": 1.1194398403167725
      },
      {
        "word": "Rooseveltian",
        "distance": 1.1276379823684692
      },
      {
        "word": "Kissingerian",
        "distance": 1.129833698272705
      },
      {
        "word": "multilateralist",
        "distance": 1.133465051651001
      },
      {
        "word": "compassionate_conservatism",
        "distance": 1.1389541625976562
      }
    ]
  },
  {
    name: 'Two words',
    words: ['woman', 'king'],
    expected: [
      {
        "word": "prince",
        "distance": 0.8950392603874207
      },
      {
        "word": "PRINCESS_Diana",
        "distance": 1.0395269393920898
      },
      {
        "word": "princes",
        "distance": 1.0412087440490723
      },
      {
        "word": "playboy_prince",
        "distance": 1.045539140701294
      },
      {
        "word": "Balian_Orlando_Bloom",
        "distance": 1.0489743947982788
      },
      {
        "word": "expert_Dickie_Arbiter",
        "distance": 1.0665950775146484
      },
      {
        "word": "mistress",
        "distance": 1.0721772909164429
      },
      {
        "word": "Queen_Cassiopeia",
        "distance": 1.080484390258789
      },
      {
        "word": "conquered_Annapurna",
        "distance": 1.0813522338867188
      },
      {
        "word": "Daenerys",
        "distance": 1.0842951536178589
      },
      {
        "word": "Queen_Vashti",
        "distance": 1.0870975255966187
      },
      {
        "word": "heir",
        "distance": 1.0899335145950317
      }
    ]
  },
  {
    name: 'No words',
    words: [],
    expected: []
  },
  {
    name: 'Subtraction',
    words: ['smell', 'good'],
    operation: 'subtract',
    expected: [
      {
        "word": "stench",
        "distance": 0.8359224796295166
      },
      {
        "word": "pungent_odor",
        "distance": 0.9058054685592651
      },
      {
        "word": "overpowering_smell",
        "distance": 0.9204326272010803
      },
      {
        "word": "sulfurous_odor",
        "distance": 0.9459594488143921
      },
      {
        "word": "acrid_odor",
        "distance": 0.9682427644729614
      },
      {
        "word": "smells_emanating",
        "distance": 0.9750202298164368
      },
      {
        "word": "rancid_odor",
        "distance": 0.9977137446403503
      },
      {
        "word": "stenches",
        "distance": 1.0022343397140503
      },
      {
        "word": "rotten_eggs_smell",
        "distance": 1.0070266723632812
      },
      {
        "word": "acrid_stench",
        "distance": 1.023805856704712
      },
      {
        "word": "fumes_emanating",
        "distance": 1.0247372388839722
      },
      {
        "word": "acrid_aroma",
        "distance": 1.0283162593841553
      }
    ]
  },
   {
    name: 'Tolerate words not in index',
    words: ['asdf234dsfwert24', 'woman', '_______||||', 'king'],
    expected: [
      {
        "word": "prince",
        "distance": 0.8950392603874207
      },
      {
        "word": "PRINCESS_Diana",
        "distance": 1.0395269393920898
      },
      {
        "word": "princes",
        "distance": 1.0412087440490723
      },
      {
        "word": "playboy_prince",
        "distance": 1.045539140701294
      },
      {
        "word": "Balian_Orlando_Bloom",
        "distance": 1.0489743947982788
      },
      {
        "word": "expert_Dickie_Arbiter",
        "distance": 1.0665950775146484
      },
      {
        "word": "mistress",
        "distance": 1.0721772909164429
      },
      {
        "word": "Queen_Cassiopeia",
        "distance": 1.080484390258789
      },
      {
        "word": "conquered_Annapurna",
        "distance": 1.0813522338867188
      },
      {
        "word": "Daenerys",
        "distance": 1.0842951536178589
      },
      {
        "word": "Queen_Vashti",
        "distance": 1.0870975255966187
      },
      {
        "word": "heir",
        "distance": 1.0899335145950317
      },
      {
        word: 'Tessa_Rachel_Weisz',
        distance: 1.0973091125488281,
      },
      {
        word: 'god_Zeus',
        distance: 1.1002873182296753
      }
    ]
  },
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, runTest);

  function runTest(t) {
    var db = level(wordIndexDbPath);

    FindNearestNeighbors(
      {
        annoyIndexPath: annoyIndexPath,
        wordIndexDb: db
      },
      runFind
    );

    function runFind(error, findNearestNeighbors) {
      assertNoError(t.ok, error, 'No error while creating findNearestNeighbors');
      findNearestNeighbors(testCase.words, testCase.operation, 10, checkResult);
    }

    function checkResult(error, neighbors) {
      assertNoError(t.ok, error, 'No error while finding neighbors.');
      // console.log(JSON.stringify(neighbors, null, '  '));
      t.deepEqual(neighbors, testCase.expected, 'Neighbors are correct.');
      db.close(t.end);
    }
  }
}
