/* global __dirname */

var test = require('tape');
var W2VServer = require('../word2vec-google-news-api-server');
var request = require('request');
var assertNoError = require('assert-no-error');
var curry = require('lodash.curry');

const annoyIndexPath = __dirname + '/../../annoy-node/tests/data/very-big-test.annoy';
const wordIndexDbPath = __dirname + '/../../annoy-node/tests/data/word-index-google-news.db';
const testPort = 9090;
const serverBaseURL = 'http://localhost:' + testPort + '/';

var endpointTests = [
  {
    path: '/neighbors',
    qs: {
      words: 'junk',
      quantity: 25
    },
    expectedStatus: 200,
    expectedBody: [
      {
        'word': 'gewgaw',
        'distance': 3.2417352199554443
      },
      {
        'word': 'scummiest',
        'distance': 3.258899688720703
      },
      {
        'word': 'gullable',
        'distance': 3.332505702972412
      },
      {
        'word': 'intellectual_snobs',
        'distance': 3.343379259109497
      },
      {
        'word': 'hifalutin',
        'distance': 3.345424175262451
      },
      {
        'word': 'fraidy_cats',
        'distance': 3.3454360961914062
      },
      {
        'word': 'overbloated',
        'distance': 3.3494911193847656
      },
      {
        'word': 'pea_brains',
        'distance': 3.353668212890625
      },
      {
        'word': 'jock_sniffing',
        'distance': 3.3537871837615967
      },
      {
        'word': 'fuddy',
        'distance': 3.364696979522705
      },
      {
        'word': 'dopier',
        'distance': 3.3662054538726807
      },
      {
        'word': 'thinky',
        'distance': 3.3696341514587402
      },
      {
        'word': 'sciencey',
        'distance': 3.3835248947143555
      },
      {
        'word': 'fuckwits',
        'distance': 3.3900511264801025
      },
      {
        'word': 'brown_nosers',
        'distance': 3.390284538269043
      },
      {
        'word': 'bass_ackwards',
        'distance': 3.396451711654663
      },
      {
        'word': 'gum_flapping',
        'distance': 3.399639368057251
      },
      {
        'word': 'book_learnin',
        'distance': 3.4015183448791504
      },
      {
        'word': 'nudge_wink',
        'distance': 3.4076735973358154
      },
      {
        'word': 'phoneys',
        'distance': 3.419229745864868
      },
      {
        'word': 'wisecrackers',
        'distance': 3.4270575046539307
      },
      {
        'word': 'geeks_nerds',
        'distance': 3.427283763885498
      },
      {
        'word': 'proctologists',
        'distance': 3.4329566955566406
      },
      {
        'word': 'snarkiest',
        'distance': 3.4349915981292725
      },
      {
        'word': 'dissappear',
        'distance': 3.4360713958740234
      }
    ]
  },

  {
    path: '/neighbors',
    qs: {
      words: [
        'robot',
        'bee'
      ]
      .join(',')
    },
    expectedStatus: 200,
    expectedBody: [
      {
        'word': 'Pond_Karen_Gillan',
        'distance': 5.025093078613281
      },
      {
        'word': 'ventriloquist_dummy',
        'distance': 5.036064147949219
      },
      {
        'word': 'chipmunks',
        'distance': 5.05729341506958
      },
      {
        'word': 'Nearly_Headless',
        'distance': 5.078697681427002
      },
      {
        'word': 'Smokemonster',
        'distance': 5.095157146453857
      },
      {
        'word': 'Eloise_Hawking',
        'distance': 5.10952091217041
      },
      {
        'word': 'Squidward',
        'distance': 5.123725414276123
      },
      {
        'word': 'Eleventh_Doctor',
        'distance': 5.127771854400635
      },
      {
        'word': 'Ted_Mosby',
        'distance': 5.150912761688232
      },
      {
        'word': 'Deangelo_Vickers',
        'distance': 5.151463031768799
      },
      {
        'word': 'Tenma',
        'distance': 5.151813507080078
      },
      {
        'word': 'Margo_Edith',
        'distance': 5.153524875640869
      }
    ]
  },

  {
    path: '/neighbors',
    qs: {
      words: [
        'earth',
        'humanity'
      ]
      .join(','),
      operation: 'subtract'
    },
    expectedStatus: 200,
    expectedBody: [
    { distance: 3.1845037937164307, word: 'cryogenic_freezer' },
      {distance: 3.1923558712005615, word: 'Squirreled_away' },
      { distance: 3.195155143737793, word: 'Big_Bang_Illingworth' },
      { distance: 3.204150438308716, word: 'sneaker_soles' },
      { distance: 3.2056021690368652, word: 'Leta_Shy' },
      { distance: 3.206554889678955, word: 'spicier_fare' },
      { distance: 3.2080447673797607, word: 'doorknob_hanger' },
      { distance: 3.211636543273926, word: '####.That_s' },
      { distance: 3.2187767028808594, word: 'lug_wrenches' },
      { distance: 3.2216498851776123, word: 'Mercury_Prockter' },
      { distance: 3.222452163696289, word: 'Kacyra' },
      { distance: 3.2233524322509766, word: 'anagama_kiln' }
    ]
  },  

  {
    path: '/neighbors',
    qs: {
      words: ''
    },
    expectedStatus: 500,
    expectedBody: { message: 'No words provided to /neighbors.' }
  }
];

test('HEAD', headTest);

function checkHeadResponse(t, server, error, response) {
  assertNoError(t.ok, error, 'No error from request.');
  t.equal(response.statusCode, 200, 'Received 200.');
  server.shutDown(t.end);
}

endpointTests.forEach(testEndpoint);

function headTest(t) {
  W2VServer(
    {
      annoyIndexPath: annoyIndexPath,
      wordIndexDbPath: wordIndexDbPath
    },
    useServer
  );

  function useServer(error, server) {
    assertNoError(t.ok, error, 'No server creation error.');
    server.listen(testPort, makeHeadRequest);

    function makeHeadRequest(error) {
      assertNoError(t.ok, error, 'No server starting error.');
      var reqOpts = {
        method: 'HEAD',
        url: serverBaseURL + '/neighbors'
      };
      request(reqOpts, curry(checkHeadResponse)(t, server));
    }
  }
}

function testEndpoint(testCase) {
  test(testCase.path, endpointTest);

  function endpointTest(t) {
    W2VServer(
      {
        annoyIndexPath: annoyIndexPath,
        wordIndexDbPath: wordIndexDbPath
      },
      useServer
    );

    function useServer(error, server) {
      assertNoError(t.ok, error, 'No server creation error.');
      server.listen(testPort, makeRequest);

      function makeRequest(error) {
        assertNoError(t.ok, error, 'No server starting error.');
        var reqOpts = {
          method: 'GET',
          url: serverBaseURL + testCase.path,
          qs: testCase.qs,
          json: true
        };
        request(reqOpts, checkResponse);
      }

      function checkResponse(error, response, body) {
        assertNoError(t.ok, error, 'No error from request.');
        t.equal(response.statusCode, testCase.expectedStatus, 'Status code is correct..');
        t.equal(response.headers['content-type'], 'application/json', 'MIME type is correct.');
        // t.ok(body.length > 0, 'Body is not empty');
        t.deepEqual(body, testCase.expectedBody, 'Results are correct.');
        // console.log(JSON.stringify(body, null, '  '));

        server.shutDown(t.end);
      }
    }
  }
}
