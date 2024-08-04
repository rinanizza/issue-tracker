const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // Use a specific issue ID from MongoDB for tests
let issueId;

  // Create an issue with every field
  test('Create an issue with every field', function(done) {
	  this.timeout(10000);
    chai.request(server)
      .post('/api/issues/yourProjectName')
      .send({
        issue_title: 'Test Issue Title',
        issue_text: 'Test Issue Text',
        created_by: 'Test Creator',
        assigned_to: 'Test Assignee',
        status_text: 'Test Status'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        issueId = res.body._id; // Store the ID for future tests
        done();
      });
  });

  // Create an issue with only required fields
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/yourProjectName')
      .send({
        issue_title: 'Another Issue Title',
        issue_text: 'Another Issue Text',
        created_by: 'Another Creator'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        done();
      });
  });

  // Create an issue with missing required fields
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/yourProjectName')
      .send({
        issue_title: 'Incomplete Issue Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  // View issues on a project
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/yourProjectName')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.issues);
        done();
      });
  });

  // View issues on a project with one filter
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/yourProjectName')
      .query({ open: 'true' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.issues);
        done();
      });
  });

  // View issues on a project with multiple filters
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/yourProjectName')
      .query({
        open: 'true',
        issue_title: 'Test Issue Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.issues);
        done();
      });
  });

  // Update one field on an issue
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/yourProjectName')
      .send({
        _id: issueId,
        issue_title: 'Updated Issue Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: issueId });
        done();
      });
  });

  // Update multiple fields on an issue
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/yourProjectName')
      .send({
        _id: issueId,
        issue_text: 'Updated Issue Text',
        status_text: 'Updated Status Text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: issueId });
        done();
      });
  });

  // Update an issue with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/yourProjectName')
      .send({
        issue_title: 'Title Without ID'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // Update an issue with no fields to update
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/yourProjectName')
      .send({
        _id: issueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: issueId });
        done();
      });
  });

  // Update an issue with an invalid _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/yourProjectName')
      .send({
        _id: 'invalidId',
        issue_title: 'Title with Invalid ID'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidId' });
        done();
      });
  });

  // Delete an issue
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/yourProjectName')
      .send({ _id: issueId })
      .end(function(err, res) {
        assert.deepEqual(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', _id: issueId });
        done();
      });
  });

  // Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/yourProjectName')
      .send({ _id: 'invalidId' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalidId' });
        done();
      });
  });

 
  // Delete an issue with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/yourProjectName')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
		done();
      });
  });
  
 
})
