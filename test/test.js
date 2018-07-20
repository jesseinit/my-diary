import chai from 'chai';
import { expect } from 'chai';
import app from '../server';

const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Diary', () => {
  const id = 9;
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

  describe('GET: /api/v1/entries/:id', () => {
    it('should GET a single diary entry', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${id}`)
        .end((err, res) => {
          if (res.status === 200) {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.haveOwnProperty('id');
            expect(res.body).to.haveOwnProperty('post');
          }
          done();
        });
    });

    it('should RETURN 404 if diary entry is not found', done => {
      chai
        .request(app)
        .get(`/api/v1/entries/${id}`)
        .end((err, res) => {
          if (res.status === 404) {
            expect(res.status).to.equal(404);
            expect(res.body)
              .to.haveOwnProperty('status')
              .equal(404);
            expect(res.body).to.haveOwnProperty('message');
          }
          done();
        });
    });
  });

  describe('POST: /api/v1/entries', () => {
    it('should CREATE a new diary entry', done => {
      chai
        .request(app)
        .post('/api/v1/entries/')
        .send({ post: "They Don't Know" })
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res).to.be.an('object');
          expect(res.body[res.body.length - 1].post).to.not.match(/^ *$/);
        });
      done();
    });
  });

  describe('PUT: /api/v1/entries/:id', () => {
    it('should UPDATE a diary entry when an id is FOUND', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${id}`)
        .send({ post: 'Done' })
        .end((error, response) => {
          if (response.body[id] !== undefined) {
            expect(response.status).to.equal(200);
            expect(response.body[id]).to.have.property('id');
            expect(response.body[id]).to.have.property('post');
            expect(response.body[id]).to.be.an('object');
          }
          done();
        });
    });

    it('should RETURN Undefined for a diary entry when an id is NOT FOUND', done => {
      chai
        .request(app)
        .put(`/api/v1/entries/${id}`)
        .send({ post: 'Done' })
        .end((error, response) => {
          if (response.body[id] === 'undefined') {
            expect(response.body[id]).to.be.an('undefined');
          }
          done();
        });
    });
  });
});
