
/**═════════════════════════════════════════════
 **           INVITES DB CONTROLLER
 *══════════════════════════════════════════════**/

"use strict";

const database = require("../db/database.js");
let db;


// ─── Execute ──────────────────────────────────────────────────────

async function execute(action, data = null) {
    try {
        db = await database.getDb("invites");
        let result;

        switch (action) {
            case 'add':
                result = await addInvite(data[0], data[1], data[2]);
                return result;
            case 'verify':
                result = await verifyInvite(data);
                return result;
            case 'use':
                result = await useInvite(data);
                return result;
        }
    } catch (e) {
        throw e;
    } finally {
        db.client.close();
    }
}

// ─── Add New Invite ────────────────────────────────────────────────────

async function addInvite(token, toEmail, docId) {
    try {
        await db.collection.insertOne({
            token,
            docId,
            toEmail,
            used: false,
        });

        console.log("Invite stored in db");
        return { success: true }
    } catch (e) {
        console.error(e);
        console.log("DB store invite error");
        console.log(e.message);
        return { success: false, message: e.message };
    }
}


// ─── Verify Recieved Token ────────────────────────────────────────────────────

async function verifyInvite(token) {
    console.log("backend src verify invite");
    const invite = await db.collection.findOne({ token });

    if (!invite || invite.used) {
        console.log("Invalid or used invite");
        return { success: false, message: "Invalid or used invite" };
    }

    console.log("backend src verify invite: SUCCESS");

    return { success: true, docId: invite.docId }
}


// ─── Use Invite ────────────────────────────────────────────────────

async function useInvite(token) {
    const res = await db.collection.updateOne(
        { token: token },
        { $set: { used: true } }
    );

    if (res.matchedCount === 1) {
        console.log("Successfully updated one document.");
        return { success: true }
    } else {
        console.log("Failed updating invite in db");
        return { success: false, message: "Failed updating invite in db" };
    }
}

module.exports = { execute: execute };