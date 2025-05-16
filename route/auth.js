
/**═════════════════════════════════════════════
 **                AUTH ROUTES
 *══════════════════════════════════════════════**/

"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../src/auth.js");

module.exports = router;
 
 
// POST ─── Register ───────────────────────────────────────

router.post("/register", async (req, res) => {
    try {
        const user = {
            username: req.body.username,
            password: req.body.password
        };
        const result = await auth.execute('register', user);

        res.status(201).send(result);
    } catch (e) {
        return writeError(req.method, res, e);
    }
});
 
 
// POST ─── Login ────────────────────────────────────────
 
router.post("/login", async (req, res) => {
    try {
        const user = {
            username: req.body.username,
            password: req.body.password
        };

        const result = await auth.execute('login', user);

        res.status(201).send(result);
    } catch (e) {
        return writeError(req.method, res, e);
    }
});