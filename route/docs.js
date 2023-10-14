
/**═════════════════════════════════════════════
 **                  ROUTES
 *══════════════════════════════════════════════**/

"use strict";

const express       = require("express");
const router        = express.Router();
const docs          = require("../src/docs.js");

module.exports      = router;


// GET ─── Read All ───────────────────────────────────────

router.get("/", async (req, res) => {
    try {
        const data = await docs.execute('read');
        
        res.json(data);
    } catch (e) {
        return writeError(req.method, res, e);
    }
});


// POST ─── Create ────────────────────────────────────────

router.post("/", async (req, res) => {
    try {
        const doc = req.body;
        const result = await docs.execute('create', doc);
    
        res.status(201).send(result);
    } catch (e) {
        return writeError(req.method, res, e);
    }
});


// PUT ─── Update ─────────────────────────────────────────

router.put("/", async (req, res) => {
    try {
        const document = req.body;  
        await docs.execute('update', document);

        res.status(204).send();
    } catch (e) {
        return writeError(req.method, res, e);
    }  
});


// DEL ─── Delete ─────────────────────────────────────────

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await docs.execute('delete', id);
        
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


