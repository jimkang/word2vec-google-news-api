var test = require('tape');
var FindNearestNeighbors = require('../find-nearest-neighbors');
var assertNoError = require('assert-no-error');
var level = require('level');

const annoyIndexPath = '../annoy-node/tests/data/very-big-test.annoy';
const wordIndexDbPath = '../annoy-node/tests/data/word-index-google-news.db';

var testCases = [
  {
    name: 'One word',
    words: ['triangulation'],
    expected: [
      {
        'word': 'unilateralists',
        'distance': 3.7333741188049316
      },
      {
        'word': 'datum',
        'distance': 3.8950395584106445
      },
      {
        'word': 'reflexivity',
        'distance': 3.897528648376465
      },
      {
        'word': 'empiricism',
        'distance': 3.9503653049468994
      },
      {
        'word': 'financialisation',
        'distance': 3.956968069076538
      },
      {
        'word': 'CheneyBush',
        'distance': 3.9689197540283203
      },
      {
        'word': 'Authoritarian_regimes',
        'distance': 3.981210231781006
      },
      {
        'word': 'leftwards',
        'distance': 4.008560657501221
      },
      {
        'word': 'Keynesian_stimulus',
        'distance': 4.014692783355713
      },
      {
        'word': 'neo_liberal_globalization',
        'distance': 4.015151023864746
      }      
    ]
  },
  {
    name: 'Two words',
    words: ['woman', 'king'],
    expected: [
      {
        'word': 'girl',
        'distance': 3.3799474239349365
      },
      {
        'word': 'boy',
        'distance': 3.505894184112549
      },
      {
        'word': 'teenage_girl',
        'distance': 3.5664563179016113
      },
      {
        'word': 'Yannick_Brea',
        'distance': 3.8133106231689453
      },
      {
        'word': 'sexually_propositioning',
        'distance': 3.876760721206665
      },
      {
        'word': 'Alleged_mobster',
        'distance': 3.881298303604126
      },
      {
        'word': 'Meir_Amar',
        'distance': 3.900414228439331
      },
      {
        'word': 'practiced_witchcraft',
        'distance': 3.905587911605835
      },
      {
        'word': 'Galperina',
        'distance': 3.9068102836608887
      },
      {
        'word': 'Laura_Nager',
        'distance': 3.915722608566284
      },
      {
        'word': 'immolated_herself',
        'distance': 3.918130397796631
      }
    ]
  },
  {
    name: 'No words',
    words: [],
    expected: []
  }
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
      findNearestNeighbors(testCase.words, 10, checkResult);
    }

    function checkResult(error, neighbors) {
      assertNoError(t.ok, error, 'No error while finding neighbors.');
      console.log(JSON.stringify(neighbors, null, '  '));
      t.deepEqual(neighbors, testCase.expected, 'Neighbors are correct.');
      db.close(t.end);
    }
  }
}
