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

  describe('The user', () => {
    it('1). should be able to view a diary story if it exists', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/1`)
        .end((err, res) => {
          if (res.status === 200) {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('post');
          }
          done();
        });
    });
    it('2). should get an error if the story does not exit', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/10`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body).to.property('err');
          done();
        });
    });
  });

  describe('The user should be able to create a diary story', () => {
    const numberOfStories = db.length;
    const story = 'Happy People';
    it('should CREATE a new diary entry', done => {
      chai
        .request(app)
        .post('/api/v1/entries/')
        .send({ title: 'We Live', post: story })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body[res.body.length - 1].post).to.equal(story);
          expect(res.body[numberOfStories - 1]).to.have.property('id');
          expect(res.body[numberOfStories - 1]).to.have.property('post');
          expect(res.body.length).to.equal(numberOfStories + 1);
        });
      done();
    });
  });

  describe('When the user tries to update a diary story', () => {
    const updateStory = 'Let me go in already!';

    it('1). It should update the story if the story exists', done => {
      const storyId = 5;
      chai
        .request(app)
        .put(`/api/v1/entries/${storyId}`)
        .send({ title: 'We Live', post: updateStory })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body[storyId - 1].post).to.equal(updateStory);
          expect(res.body[storyId - 1])
            .to.have.property('id')
            .to.equal(storyId);
          done();
        });
    });
    it('2). It should NOT update the story if the story does not exist', done => {
      const storyId = 80;
      chai
        .request(app)
        .put(`/api/v1/entries/${storyId}`)
        .send({ title: 'We Live', post: 'Done' })
        .end((err, res) => {
          expect(res.body.err).to.equal('Diary story not found');
          expect(res.body.length).to.equal(undefined);
          done();
        });
    });
  });
});
