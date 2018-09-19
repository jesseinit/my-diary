import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
// import webpush from 'web-push';
import app from '../server/app';
import { pool } from '../server/helpers/connection';
import { input, entry /* , profile */ } from './testData';

const { expect } = chai;

chai.use(chaiHttp);

// Cache the token
let authToken = '';
// Cache the entry
let cachedEntry = '';

describe('My Diary Application', () => {
  after(() => {
    pool.query('Truncate users, diaries restart identity');
  });

  // Signup
  describe('When the user tries to signup an account', () => {
    it('It should return an error for an unprocessable input { Status 422 }', done => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(input.invalidSignUpInput)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          done();
        });
    });

    it('It should create a user and generate token when they enters valid inputs { Status 201 }', done => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(input.validSignUpInput)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('token');
          authToken = res.body.token;
          done();
        });
    });

    it('It should return a conflit error if the user exists { Status 409 }', done => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(input.validSignUpInput)
        .end((err, res) => {
          expect(res.status).to.equal(409);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(pool, 'query').callsFake(() => Promise.reject());
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(input.validSignUpInput)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });
  // Login
  describe('When the user tries to login into their account', () => {
    it('It should return an error for an unprocessable input { Status 422 }', done => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.invalidLoginInput)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          done();
        });
    });

    it('It should log in the user for valid email and password credentials { Status 200 } ', done => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.validUser)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('It should login the user and generate a new token', done => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.validUser)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('It should return an error when a user enters a wrong password { Status 401 } ', done => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.wrongPassword)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return an error when a user enters an unregistered email { Status 404 }', done => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.wrongEmail)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(pool, 'query').callsFake(() => Promise.reject());
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.validUser)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });

  // GET /entries
  describe('When users tries to view all their diaries', () => {
    it('It should return an error when the token header is not set { Status 401 } ', done => {
      chai
        .request(app)
        .get('/api/v1/entries')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return an error when the token is invalid or expired { Status 401 }', done => {
      chai
        .request(app)
        .get('/api/v1/entries')
        .set('Authorization', `Bearer invalidToken`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return statusCode 200 when an authorised users have no diary entry', done => {
      chai
        .request(app)
        .get('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(pool, 'query').callsFake(() => Promise.reject());
      chai
        .request(app)
        .get('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });

  // POST /entries
  describe('When the user tries to create a new entry', () => {
    it('It should return - 401 - unauthorised access when a token is not sent', done => {
      chai
        .request(app)
        .post('/api/v1/entries')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return - 401 - forbidden when token is expired or invalid', done => {
      chai
        .request(app)
        .post('/api/v1/entries')
        .set('Authorization', `Bearer invalidToken`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return - 201 - and create an entry when user enter valid values', done => {
      chai
        .request(app)
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(entry.validEntry)
        .end((err, res) => {
          cachedEntry = res.body.result;
          expect(res.status).to.equal(201);
          done();
        });
    });

    it('It should return statusCode 200 to confirm the saved entry', done => {
      chai
        .request(app)
        .get('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('It should return statusCode 200 when an authorised users have no diary entry', done => {
      chai
        .request(app)
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(entry.validEntry)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          chai
            .request(app)
            .get('/api/v1/entries?id=2')
            .set('Authorization', `Bearer ${authToken}`)
            .end((err1, res1) => {
              expect(res1.status).to.equal(200);
              done();
            });
        });
    });

    it('It should return statusCode 200 when an authorised users tries to fetch more diary entry', done => {
      chai
        .request(app)
        .get('/api/v1/entries?id=1')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(pool, 'query').callsFake(() => Promise.reject());
      chai
        .request(app)
        .post('/api/v1/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(entry.validEntry)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });

  // Get with Params
  describe('When the user tries to view a specific diary', () => {
    it('It should return - 403 - unauthorised access when a token is not sent', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${cachedEntry.id}`)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
    });

    it('It should return - 401 - forbidden when token is expired or invalid', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer invalidToken`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    it('It should return no diary entry to the user with - a status of 404', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${cachedEntry.id + 1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('It should return the requested diary entry to the user with - a status of 200', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('It should return an error - Status 422 -  for an unprocessable query', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/eee}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(db, 'query').rejects();
      chai
        .request(app)
        .get(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });

  // UPDATE
  describe('When the user tries to UPDATE a specific diary', () => {
    // Test if token is set
    it('It should return - 403 - unauthorised access when a token is not sent', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${cachedEntry.id}`)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
    });

    // Test if token is invalid
    it('It should return - 401 - forbidden when token is expired or invalid', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer invalidToken`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    // Test if it the story does not exist
    it('It should return - 404 - forbidden if it the story does not exist', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${cachedEntry.id + 1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    // Test if the story is same day
    it('It should return - 200 - and update story if the story is same day', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(entry.validEntry)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    // Test if the story is not same day
    it('It should return - 403 - if the story is not same day', done => {
      const clock = sinon.useFakeTimers(new Date(cachedEntry.created_on).getTime());
      clock.tick(24.01 * 3600 * 1000);
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(input.validUser)
        .end((err, res) => {
          const { token } = res.body;
          chai
            .request(app)
            .put(`/api/v1/entries/${cachedEntry.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(entry.yesterdayStory)
            .end((errr, result) => {
              expect(result.status).to.equal(403);
              clock.reset();
              done();
            });
        });
    });
    // This is highly unlikely
    it('It should return statusCode 422 when a user tries to UPDATE a story passing bad query', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/eee`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(db, 'query').rejects();
      chai
        .request(app)
        .put(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(entry.validEntry)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });

  // DELETE
  describe('When the user tries to DELETE a specific diary', () => {
    // Test if token is set
    it('It should return - 403 - unauthorised access when a token is not sent', done => {
      chai
        .request(app)
        .del(`/api/v1/entries/${cachedEntry.id}`)
        .end((err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
    });

    // Test if token is invalid
    it('It should return - 401 - forbidden when token is expired or invalid', done => {
      chai
        .request(app)
        .del(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer invalidToken`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });

    // Test for if the story exist
    it('It should return statusCode 500 when a user tries to DELETE a story that exist', done => {
      chai
        .request(app)
        .del(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });

    // Test for if the story does not exist
    it('It should return statusCode 404 when a user tries to DELETE a story that does not exist', done => {
      chai
        .request(app)
        .del(`/api/v1/entries/${cachedEntry.id + 1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('It should return statusCode 500 when a user tries to DELETE a story passing ', done => {
      chai
        .request(app)
        .del(`/api/v1/entries/0`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          done();
        });
    });

    it('It should return internal server error for a connection error to the database { Status 500 } ', done => {
      const stub = sinon.stub(db, 'query').rejects();
      chai
        .request(app)
        .del(`/api/v1/entries/${cachedEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(500);
          stub.restore();
          done();
        });
    });
  });
});
