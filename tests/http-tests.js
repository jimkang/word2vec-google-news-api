/* global __dirname */

var test = require('tape');
var W2VServer = require('../word2vec-google-news-api-server');
var request = require('request');
var assertNoError = require('assert-no-error');
var curry = require('lodash.curry');

const annoyIndexPath = __dirname + '/../../annoy-node/tests/data/google-news-angular.annoy';
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
        'word': 'Junked_cars',
        'distance': 1.1381120681762695
      },
      {
        'word': 'unshredded',
        'distance': 1.1411900520324707
      },
      {
        'word': 'dump',
        'distance': 1.1701158285140991
      },
      {
        'word': 'debris',
        'distance': 1.1711379289627075
      },
      {
        'word': 'scrap_metal',
        'distance': 1.186811923980713
      },
      {
        'word': 'oceangoing_barges',
        'distance': 1.1875700950622559
      },
      {
        'word': 'Improperly_disposed',
        'distance': 1.1886181831359863
      },
      {
        'word': 'muck_dredged',
        'distance': 1.1945849657058716
      },
      {
        'word': 'street_sweepings',
        'distance': 1.1953155994415283
      },
      {
        'word': 'sofas_mattresses',
        'distance': 1.196775197982788
      },
      {
        'word': 'cesspool',
        'distance': 1.2009966373443604
      },
      {
        'word': 'radioactive_tailings',
        'distance': 1.2052302360534668
      },
      {
        'word': 'waste',
        'distance': 1.2078100442886353
      },
      {
        'word': 'navigational_hazard',
        'distance': 1.209350824356079
      },
      {
        'word': 'landfill',
        'distance': 1.2094756364822388
      },
      {
        'word': 'kiln_dust',
        'distance': 1.2097811698913574
      },
      {
        'word': 'polystyrene_trays',
        'distance': 1.2133753299713135
      },
      {
        'word': 'Chokai_Maru_ship',
        'distance': 1.214137077331543
      },
      {
        'word': 'oily_wastes',
        'distance': 1.2148865461349487
      },
      {
        'word': 'recycling_bin',
        'distance': 1.2169530391693115
      },
      {
        'word': 'sludge',
        'distance': 1.2186381816864014
      },
      {
        'word': 'dog_poop',
        'distance': 1.2186740636825562
      },
      {
        'word': 'Modesto_Tallow',
        'distance': 1.220155119895935
      },
      {
        'word': 'Septic_tanks',
        'distance': 1.2252464294433594
      },
      {
        'word': 'incinerator_ash',
        'distance': 1.225832223892212
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
        'word': 'critter',
        'distance': 0.9984074234962463
      },
      {
        'word': 'grasshopper',
        'distance': 1.0556964874267578
      },
      {
        'word': 'researcher_Jerry_Bromenshenk',
        'distance': 1.0587835311889648
      },
      {
        'word': 'insect_eater',
        'distance': 1.0758469104766846
      },
      {
        'word': 'critters',
        'distance': 1.0859291553497314
      },
      {
        'word': 'creepy_crawly',
        'distance': 1.0869266986846924
      },
      {
        'word': 'beaver',
        'distance': 1.0891964435577393
      },
      {
        'word': 'squirrel',
        'distance': 1.092586874961853
      },
      {
        'word': 'Madagascar_hissing_cockroaches',
        'distance': 1.092700481414795
      },
      {
        'word': 'creepy_critters',
        'distance': 1.1036840677261353
      },
      {
        'word': 'furry_critter',
        'distance': 1.1178911924362183
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
      {
        'word': 'Masontown_W.Va.',
        'distance': 1.2772890329360962
      },
      {
        'word': 'Cootharaba',
        'distance': 1.2835707664489746
      },
      {
        'word': 'TODAY_\'S_FOCUS',
        'distance': 1.3033920526504517
      },
      {
        'word': 'WEEKLY_PLANNER',
        'distance': 1.3102312088012695
      },
      {
        'word': 'By_KIT_BAGAIPO',
        'distance': 1.3159219026565552
      },
      {
        'word': 'HANALEI',
        'distance': 1.3164889812469482
      },
      {
        'word': 'CHAZY',
        'distance': 1.3169907331466675
      },
      {
        'word': 'Snowshoe_Mountain',
        'distance': 1.3171107769012451
      },
      {
        'word': 'Higginsville_Mo.',
        'distance': 1.3190114498138428
      },
      {
        'word': 'CAPE_CARTERET',
        'distance': 1.3220096826553345
      },
      {
        'word': 'ROSSBURG',
        'distance': 1.32235848903656
      },
      {
        'word': 'LAKE_ANNA',
        'distance': 1.3247861862182617
      }
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
