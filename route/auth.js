
/**═════════════════════════════════════════════
 **                AUTH ROUTES
 *══════════════════════════════════════════════**/

"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../src/auth.js");

module.exports = router;


// GET ─── Get All ────────────────────────────────────────

router.get("/", async (req, res) => {
    try {
        const users = await auth.execute('list');

        res.status(200).json(users);
    } catch (e) {
        return writeError(req.method, res, e);
    }
});


// POST ─── Register ───────────────────────────────────────

router.post("/register", async (req, res) => {
    const user = req.body;
    const result = await auth.execute('register', user);

    if (!result.success) {
        return res.status(401).json({ success: result.success, errorType: result.errorType, errorMessage: result.message });
    }

    // 201: created
    return res.status(201).json(result);
});


// POST ─── Login ────────────────────────────────────────

router.post("/login", async (req, res) => {
    try {
        const user = req.body;
        const result = await auth.execute('login', user);

        if (!result.success) {
            return res.status(401).json({ success: result.success, errorType: result.errorType, errorMessage: result.message });
        }

        // Returns token if login is successful
        return res.status(200).json({ token: result.token });

    } catch (e) {
        return writeError(req.method, res, e);
    }
});


// POST ─── Verify user ───────────────────────────────────

router.post("/verifyuser", async (req, res) => {
    try {
        const username = req.body.username;

        const result = await auth.execute('verify', username);

        // Returns user if registred or false 
        return res.status(200).send(result);
    } catch (e) {
        return writeError(req.method, res, e);
    }

})


// ─── Error Handler ──────────────────────────────────────

function writeError(method, res, e) {
    return res.status(500).json({
        errors: {
            method: `req method ${method}`,
            status: 500,
            source: "/",
            title: "Server or Database error",
            detail: e.message
        }
    });
}