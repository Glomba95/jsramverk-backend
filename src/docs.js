
/**═════════════════════════════════════════════
 **             DOCS DB CONTROLLER
 *══════════════════════════════════════════════**/

"use strict";

const ObjectId = require("mongodb").ObjectId;
const database = require("../db/database.js");
let db;


// ─── Execute ──────────────────────────────────────────────────────

async function execute(action, username = null, data = null) {
    try {
        db = await database.getDb("docs");
        let result;

        switch (action) {
            case 'read':
                result = await readDocs(username);
                return result;
            case 'create':
                result = await createDoc(data);
                return result;
            case 'update':
                await updateDoc(username, data[0], data[1]);
                break;
            case 'delete':
                await deleteDoc(username, data);
                break;
            case 'share':
                result = await shareDoc(username, data[0], data[1]);
                return result;
        }
    } catch (e) {
        throw e;
    } finally {
        db.client.close();
    }
}


// ─── Get Owner ────────────────────────────────────────────────────

async function getDocOwner(id) {
    const document = await db.collection.findOne(
        { _id: new ObjectId(id) },
        // Dont include id in res
        { projection: { owner: 1, _id: 0 } }
    );

    // Return owner or null if not found
    return document?.owner || null;
}


// ─── Get Shared With ────────────────────────────────────────────────────

async function getSharedWith(id) {
    const document = await db.collection.findOne(
        { _id: new ObjectId(id) },
        // Dont include id in res
        { projection: { sharedWith: 1, _id: 0 } }
    );

    // Return sharedWith list or empty if not found
    return document?.sharedWith || [];
}


// ─── Get All ──────────────────────────────────────────────────────

async function readDocs(username) {
    const res = await db.collection.find({
        $or: [
            { owner: username },
            { sharedWith: username }
        ]
    }).toArray();

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

async function updateDoc(username, docId, doc) {
    // Find doc and get owner in db
    const docOwner = await getDocOwner(docId);
    const sharedWithList = await getSharedWith(docId);

    // Check document exists
    if (!docOwner) {
        console.log("No documents matched the query. Updated 0 documents.");
        throw Error("No document match found");
    }

    // Check user is authorized to edit
    const authorized = (docOwner === username || sharedWithList.includes(username));

    if (!authorized) {
        console.log("Forbidden: Not authorized to edit this document");
        throw Error("You do not have permission to edit this item.")
    }


    let data = {};

    if (doc.name) {
        data["name"] = doc.name;
    }
    if (doc.content) {
        data["content"] = doc.content;
    }

    // Update document in db with new data
    const res = await db.collection.updateOne(
        { _id: new ObjectId(docId) },
        { $set: data }
    );

    // Throw error if not successful
    if (res.matchedCount === 1) {
        console.log("Successfully updated one document.");
    } else {
        throw Error("Database error");
    }
}


// ─── Delete ───────────────────────────────────────────────────────

async function deleteDoc(username, docId) {
    // Find doc in db
    const docOwner = await getDocOwner(docId);

    // Check acting user is owner of doc
    if (!docOwner) {
        console.log("No documents matched the query. Deleted 0 documents.");
        throw Error("No document match found");
    } else if (docOwner !== username) {
        console.log("Forbidden: Not authorized to delete resources owned by another user.");
        throw Error("You do not have permission to delete this item. Only the owner can perform this action.")
    }

    // Delete doc from db
    const res = await db.collection.deleteOne({ _id: new ObjectId(docId) });

    // Throw error if not successful
    if (res.deletedCount === 1) {
        console.log("Successfully deleted one document.");
    } else {
        console.log("Database error.");
        throw Error("Database error");
    }
}


// ─── Share ───────────────────────────────────────────────────────

async function shareDoc(username, docId, shareUsername) {
    // Find doc in db
    const docOwner = await getDocOwner(docId);

    // Check document exists
    if (!docOwner) {
        return {
            success: false,
            message: "No document match found"
        }
    }

    // Check acting user is owner of doc
    if (docOwner !== username) {
        return {
            success: false,
            message: "You do not have permission to share this item. Only the owner can perform this action."
        }
    }

    let sharedWithList = await getSharedWith(docId);
    let sharedWithStr;

    if (sharedWithList.includes(shareUsername)) {
        sharedWithStr = sharedWithList.join(", ");

        return {
            success: false,
            message: `Document already shared with users: ${sharedWithStr}`
        }
    } else {
        const res = await db.collection.updateOne(
            { _id: new ObjectId(docId) },
            { $addToSet: { sharedWith: shareUsername } }
        );

        sharedWithList = await getSharedWith(docId);
        sharedWithStr = sharedWithList.join(", ");

        if (res.modifiedCount === 1) {
            return {
                success: true,
                message: `This document is now shared with users: ${sharedWithStr}`
            }
        } else {
            return {
                success: false,
                message: `Something went wrong. Document is currently shared with users: ${sharedWithStr}`
            }
        }
    }
}


// ──────────────────────────────────────────────────────────────────

module.exports = { execute: execute };