
/**═════════════════════════════════════════════
 **             AUTH DB CONTROLLER
 *══════════════════════════════════════════════**/
 
"use strict";

const   ObjectId      = require("mongodb").ObjectId;
const   database      = require("../db/database.js");
const   bcrypt        = require('bcryptjs');
const   jwt           = require('jsonwebtoken');
const   jwtSecret     = process.env.JWT_SECRET;
const   saltRounds    = 10;
let db;


 
// ─── Execute ──────────────────────────────────────────────────────
 
async function execute(action, data=null) {
    try {
        db = await database.getDb(users);
        let result;
         
        switch(action) {
            case 'register':
                result = await register(data);
                return result;
            case 'create':
                result = await login(data);
                return result;
        }
    } catch (e) {
        throw e;
    } finally {
        db.client.close();
    }
}
 
 
// ─── Get one ──────────────────────────────────────────────────────

async function getUser(username) {
    console.log("src/getUser");
    const exists = await database.collection.findOne({ username: username });
    if (exists) {
        return exists;
    } else {
        return false;
    }
}
 
 
// ─── Register ───────────────────────────────────────────────────────
 
async function register(user) {
    const existingUser = await getUser(user.username);
    if (existingUser) {
        console.log("user already exists");
        // TODO Add option to login instead?
        // REVIEW throw Error eller throw new Error??
        throw new Error("User with this email already exists.");
    }

    console.log("username avaliable");
    
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const res = await db.collection.insertOne({
        username: user.username,
        password: hashedPassword
    });

    console.log(`res:\n ${res}\n`);
    console.log(`res.result.ok: ${res.result.ok}`);
    console.log(`res.ops: ${res.ops}`);
    console.log(`result.ops: ${result.ops}`);
    console.log(`res.result.ops: ${res.result.ops}`);

    if (res.result.ok) {
        console.log(`User registered successfully: ${user.username}`);
        return res.status(201).json({ /*data: result.ops, */message: "User registered successfully" });
    } else {
        console.log("Failed to register user to database.");
        throw Error("Insert user to database failed");
    }
     
    // return {
    //     ...document,
    //     _id: res.insertedId,
    // };
}
 
 
// ─── Login ───────────────────────────────────────────────────────
 
async function login(user) {
    const registeredUser = await getUser(user.username);
    if(!registeredUser) {
        // TODO Add option to register instead?
        // REVIEW Ta bort felhantering här eftersom den finns i routes?
        // REVIEW Specifik nog i routes? Specificerar fel tydligare här, routes täcker isf routningsfel endast
        throw new Error(`No record of user with username: ${user.username}`);
    }

    bcrypt.compare(user.password, registeredUser.password, function(err, res) {
        if(!res) {
            throw new Error("Incorrect password");
        }
    });

    const payload = {
        username: foundUser.email, _id: foundUser._id
    };
    const token = jwt.sign(payload, jwtSecret, {expiresIn: '1h'});
    
    console.log(`User logged in successfully: ${user.email}`);
    return res.status(201).json({ token });
}

// ─────────────────────────────────────────────────────────────────────────────


module.exports = {execute: execute};