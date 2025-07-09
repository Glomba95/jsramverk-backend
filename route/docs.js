
/**═════════════════════════════════════════════
 **                DOCS ROUTES
 *══════════════════════════════════════════════**/

"use strict";

const express = require("express");
const router = express.Router();
const docs = require("../src/docs.js");
const middleware = require('../middleware/index.js');


module.exports = router;


// GET ─── Read All ───────────────────────────────────────

router.get("/",
    middleware.checkToken,
    async (req, res) => {
        try {
            const username = req.user.username;

            const data = await docs.execute('read', username, null);

            res.status(200).json(data);
        } catch (e) {
            return writeError(req.method, res, e);
        }
    });


// POST ─── Create ────────────────────────────────────────

router.post("/",
    middleware.checkToken,
    async (req, res) => {
        try {
            const doc = req.body;
            doc["owner"] = req.user.username;
            const result = await docs.execute('create', null, doc);

            res.status(201).send(result);
        } catch (e) {
            return writeError(req.method, res, e);
        }
    });


// PUT ─── Update ─────────────────────────────────────────

router.put("/:id",
    middleware.checkToken,
    async (req, res) => {
        try {
            const username = req.user.username;
            const docId = req.params.id;
            const document = req.body;

            await docs.execute('update', username, [docId, document]);

            res.status(204).send();
        } catch (e) {
            return writeError(req.method, res, e);
        }
    });


// DEL ─── Delete ─────────────────────────────────────────

router.delete("/:id",
    middleware.checkToken,

    async (req, res) => {
        try {
            const username = req.user.username;
            const docId = req.params.id;
            await docs.execute('delete', username, docId);

            res.status(204).send();
        } catch (e) {
            return writeError(req.method, res, e);
        }
    });


// ─── Error Handler ──────────────────────────────────────

function writeError(method, res, e) {
    return res.status(500).json({
        errors: {
            method: `req method ${method}`,
            status: 500,
            source: "/",
            title: "Database error",
            detail: e.message
        }
    });
}


