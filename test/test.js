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
});
