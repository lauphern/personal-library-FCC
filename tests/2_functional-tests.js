/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');
const ObjectId = require("mongodb").ObjectId;


chai.use(chaiHttp);

suite('Functional Tests', function() {

  let validBookId;

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title: "create book object/expect book object"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.include(res.body, {'title': 'create book object/expect book object'});
          assert.include(res.body, {'commentcount': 0});
          assert.isArray(res.body.comments, "comments should be an array");
          assert.isEmpty(res.body.comments);
          assert.property(res.body, "_id");
          validBookId = res.body._id;
          done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 500, "Status should equal 500");
          assert.equal(res.text, "Please provide a title", "Text should equal 'Please provide a title'");
          done();
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get("/api/books")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.isArray(res.body[0].comments, "comments should be an array");
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        let deletedBookId;
        const requester = chai.request(server)
        requester.post('/api/books')
        .send({title: "book to delete"})
        .end(function(err, res) {
          deletedBookId = new ObjectId(res.body._id).toString();
          requester.delete(`/api/books/${deletedBookId}`)
          .end(function(err, res) {
            requester.get(`/api/books/${deletedBookId}`)
            .end(function(err, res) {
              if(err) console.error(err)
              assert.equal(res.status, 200)
            })
          })
          done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get(`/api/books/${validBookId}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.isArray(res.body.comments, "comments should be an array");
          assert.property(res.body, '_id', 'Books in array should contain _id');
          done();
        })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post(`/api/books/${validBookId}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.isArray(res.body.comments, "comments should be an array");
          assert.isNotEmpty(res.body.comments, "comments should not be empty");
          assert.property(res.body, '_id', 'Books in array should contain _id');
          done();
        })
      });
      
    });

  });

});
