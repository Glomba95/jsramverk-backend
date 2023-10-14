/**═══════════════════════════════════════════════════
 **                    ENTRY POINT
 *════════════════════════════════════════════════════**/

"use strict";

const express       = require("express");
const cors          = require("cors");
const app           = express();
const middleware    = require("./middleware/index.js");
const routeDocs     = require("./route/docs.js");
const port          = process.env.PORT || 1337;

require('dotenv').config();


// ─── Middleware ─────────────────────────────────────

app.use(cors());
middleware.manageLogging(app);
app.use(express.json());


// ─── Routes And Port Connection ─────────────────────

app.use('/', routeDocs);

app.listen(port, middleware.logStartUpInfo(port));


// ─── Error Handling ──────────────────────────────────

app.use(middleware.catch404);
app.use(middleware.handleError);
