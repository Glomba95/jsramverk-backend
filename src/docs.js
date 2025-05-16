
/**═════════════════════════════════════════════
 **             DOCS DB CONTROLLER
 *══════════════════════════════════════════════**/

"use strict";

const ObjectId = require("mongodb").ObjectId;
const database = require("../db/database.js");
let db;


// ─── Execute ──────────────────────────────────────────────────────

async function execute(action, data = null) {
    try {
        db = await database.getDb();
        let result;

        switch (action) {
            case 'read':
                result = await readDocs();
                return result;
            case 'create':
                result = await createDoc(data);
                return result;
            case 'update':
                await updateDoc(data[0], data[1]);
                break;
            case 'delete':
                await deleteDoc(data);
                break;
        }
    } catch (e) {
        throw e;
    } finally {
        db.client.close();
    }
}


// ─── Get All ──────────────────────────────────────────────────────

async function readDocs() {
    const res = await db.collection.find({}).toArray();

    return res;
}


// ─── Create ───────────────────────────────────────────────────────

async function createDoc(document) {
    const res = await db.collection.insertOne(document);

    return {
        ...document,
        _id: res.insertedId,
    };
}


// ─── Update ───────────────────────────────────────────────────────

async function updateDoc(id, doc) {
    let data = {};

    if (doc.name) {
        data["name"] = doc.name;
    }
    if (doc.content) {
        data["content"] = doc.content;
    }

    const res = await db.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
    );

    if (res.matchedCount === 1) {
        console.log("Successfully updated one document.");
    } else {
        console.log("No documents matched the query. Updated 0 documents.");
        throw Error("No document match found");
    }
}


// ─── Delete ───────────────────────────────────────────────────────

async function deleteDoc(id) {
    const res = await db.collection.deleteOne({ _id: new ObjectId(id) });

    if (res.deletedCount === 1) {
        console.log("Successfully deleted one document.");
    } else {
        console.log("No documents matched the query. Deleted 0 documents.");
        throw Error("No document match found");
    }
}


// ──────────────────────────────────────────────────────────────────

module.exports = { execute: execute };