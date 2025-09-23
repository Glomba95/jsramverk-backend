process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index.js');
chai.should();

chai.use(chaiHttp);

const database = require("../db/database.js");
const colName = "docs";

describe('Docs', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();

            db.db.listCollections(
                { name: colName }
            )
                .next()
                .then(async function (info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
                .finally(async function () {
                    await db.client.close();
                    resolve();
                });
        });
    });


    // ─── Test GET Route ──────────────────────────────

    describe('GET /docs', () => {
        it('it should GET all documents', (done) => {
            chai.request(server)
                .get("/docs/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.equal(0);

                    done();
                });
        });
    });

    // ─── Test POST Route ─────────────────────────────

    describe('POST /docs', () => {
        it('it should POST a new document', (done) => {
            let document = {
                title: "Document title",
                content: "Document content"
            };

            chai.request(server)
                .post("/docs/")
                .send(document)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("_id");
                    res.body.should.have.property("title");
                    res.body.should.have.property("content");
                    res.body.title.should.equal("Document title");

                    done();
                });
        });

        it('it should GET all documents', (done) => {
            chai.request(server)
                .get("/docs/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.equal(1);

                    done();
                });
        });
    });

    describe('PUT/:id /docs', () => {
        it('it should GET all documents', (done) => {
            chai.request(server)
                .get("/docs")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.length.should.be.equal(1);

                    done();
                });
        });

        it('it should UPDATE a document given the id', (done) => {
            chai.request(server)
                .get("/docs")
                .end((err, res) => {
                    let ogDocument = res.body[0];

                    let document = {
                        title: "New Title",
                        content: "New Content"
                    };

                    chai.request(server)
                        .put('/docs/' + ogDocument._id)
                        .send(document)
                        .end((err, res) => {
                            res.should.have.status(204);

                            chai.request(server)
                                .get("/docs")
                                .end((err, res) => {
                                    res.should.have.status(200);

                                    let resDoc = res.body[0];

                                    resDoc.should.have.property("_id");
                                    resDoc._id.should.be.equal(ogDocument._id);
                                    resDoc.should.have.property("title");
                                    resDoc.title.should.not.equal(ogDocument.title);
                                    resDoc.title.should.be.equal(document.title)
                                });
                        });
                    done();
                });
        });
    });
});