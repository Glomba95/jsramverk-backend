
/**═════════════════════════════════════════════
 **            GENERAL MIDDLEWARE
 *══════════════════════════════════════════════**/

"use strict";

// const express   = require("express");
const morgan = require("morgan");
const jwt = require('jsonwebtoken');


// ─── Logging ───────────────────────────────────────────────

// Writes logs to command line while not in test-mode
function manageLogging(app, req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
        // 'combined' sets Apache style logs
        app.use(morgan('combined'));
    }
}

// Print API port and DSN to command line at startup
function logStartUpInfo(port) {
    let dsn = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@jsramverk.hhuinjd.mongodb.net/docsDB?retryWrites=true&w=majority`;

    if (process.env.NODE_ENV === 'test') {
        dsn = "mongodb://localhost:27017/test";
    }

    console.log(`API listening on ${port}`);
    console.log(`DSN is: ${dsn}`);
}

// ─── Verify Jwt ──────────────────────────────────────────────────────────────

async function verifyToken(req) {
    const token = req.headers['x-access-token'];
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        return decoded;
    } catch (err) {
        throw new Error("Invalid token");
    }
};

// ─── Error Handling ────────────────────────────────────────

function catch404(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;

    next(err);
}

function handleError(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title": err.message,
                "detail": err.message
            }
        ]
    });
}

// ───────────────────────────────────────────────────────────

module.exports = {
    manageLogging: manageLogging,
    logStartUpInfo: logStartUpInfo,
    verifyToken: verifyToken,
    catch404: catch404,
    handleError: handleError
};