var request = require('request');
var assert = require('assert');

var core = require('../../core/core.js');

var baseurl = 'http://localhost:3000';

describe('server', function () {
    before(function () {
        GLOBAL.Domey = new core();

        Domey.init();
     });

    after(function () {
        //server.close();
    });

    describe('scene', function(){
        it('statuscode should be 200', function(){
            request(baseurl + '/api/scene', function (error, response, body) {
                assert.equal(response.statusCode, 200);
            });
        });

        it('Get specific scene', function(){
            request(baseurl + '/api/scene/1', function (error, response, body) {
                assert.equal(response.statusCode, 404);
            });
        });

        it('Get unknown scene, should return 404', function(){
            request(baseurl + '/api/scene/11111', function (error, response, body) {
                  assert.equal(response.statusCode, 404);
            });
        });
    });
});