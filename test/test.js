import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../server/app';
import db from '../server/helpers/connection';
import { input } from './testData';

const { expect } = chai;

chai.use(chaiHttp);

// Cache the token
let authToken = '';

describe('My Diary Application', () => {
  after(() => {
    db.query('DROP TABLE users, diaries');
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
          expect(res.body).to.have.property('error');
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
          expect(res.body)
            .to.have.property('message')
            .that.equal('Registration Successful');
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
      const stub = sinon.stub(db, 'query').rejects();
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
          expect(res.body).to.have.property('error');
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
      const stub = sinon.stub(db, 'query').rejects();
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
});
