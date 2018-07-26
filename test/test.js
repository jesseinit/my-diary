import { expect } from 'chai';
import app from '../server/server';
import db from '../server/config/db';

const chai = require('chai');

const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Diary', () => {
  describe('GET: /api/v1/entries', () => {
    it('should GET all diary entries', done => {
      chai
        .request(app)
        .get('/api/v1/entries/')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res).to.be.an('object');
        });
      done();
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
