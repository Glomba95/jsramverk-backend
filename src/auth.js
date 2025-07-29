
/**═════════════════════════════════════════════
 **             AUTH DB CONTROLLER
 *══════════════════════════════════════════════**/

"use strict";

// const ObjectId = require("mongodb").ObjectId;
const database = require("../db/database.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;
let db;



// ─── Execute ──────────────────────────────────────────────────────

async function execute(action, data = null) {
    try {
        db = await database.getDb("users");
        let result;

        switch (action) {
            case 'list':
                result = await getAll();
                return result;
            case 'verify':
                result = await checkUser(data);
                return result;
            case 'register':
                result = await register(data);
                return result;
            case 'login':
                result = await login(data);
                return result;
        }
    } catch (e) {
        throw e;
    } finally {
        db.client.close();
    }
}


// ─── Get all ──────────────────────────────────────────────────────

async function getAll() {
    const res = await db.collection.find({}).toArray();

    return res;
}



// ─── Get one ──────────────────────────────────────────────────────

async function checkUser(username) {
    console.log("src auth username: ");
    console.log(username);
    const exists = await db.collection.findOne({ username: username });

    console.log("src auth user exists: ");
    console.log(exists);

    if (exists) {
        console.log(exists);
        return exists;
    } else {
        console.log("false");
        return false;
    }
}



// ─── Register ───────────────────────────────────────────────────────

/** register
*?  Verifies username availability and hashes password.
*?  Stores user with hashed password in db collection 'users'.
*
*@param {Object} user - An object containing username and password.
*
*@return {Object} - An object with success status (bool)
*        and an optional error message (str) if registration fails.
**/
// ─────────────────────────────────────────────────────────────────────

async function register(user) {

    const existingUser = await checkUser(user.username);
    if (existingUser) {
        return { success: false, errorType: "username", message: "User already exists." };
    }

    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const res = await db.collection.insertOne({
        username: user.username,
        password: hashedPassword,
    });

    if (!res.acknowledged) {
        return { success: false, errorType: "database", message: "Database write error" };
    }

    return { success: true };
}



// ───── Login ─────────────────────────────────────────────────────────

/** login
*?  Authenticates a user by verifying username and password.
*?  Creates and returns JWT token on success
*
*@param {Object} user - An object containing username and password.
* 
*@return {Object} - An object with success status (bool)
*        and either a <token> (str) or error message <message>
**/
// ─────────────────────────────────────────────────────────────────────


async function login(user) {
    const dbUser = await checkUser(user.username);

    if (!dbUser) {
        return { success: false, errorType: 'username', message: `No record of user with username: ${user.username}` };
    }

    const correctPassword = await bcrypt.compare(user.password, dbUser.password);

    if (!correctPassword) {
        return { success: false, errorType: 'password', message: "Incorrect password" };
    }

    const payload = {
        username: dbUser.username, _id: dbUser._id
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    return { success: true, token }
}

// ─────────────────────────────────────────────────────────────────────


module.exports = { execute: execute };