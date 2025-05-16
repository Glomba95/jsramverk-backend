/**═══════════════════════════════════════════════════
 **                    ENTRY POINT
 *════════════════════════════════════════════════════**/

require('dotenv').config();

const express = require("express");
const middleware = require("./middleware/index.js");
const cors = require("cors");

const routeDocs = require("./route/docs.js");
const routeAuth = require("./route/auth.js");

const app = express();
const httpServer = require("http").createServer(app);

const port = process.env.PORT || 1337;


// ─── Middleware ─────────────────────────────────────

app.use(cors());
middleware.manageLogging(app);
app.use(express.json());


// ─── Routes and Connections ─────────────────────

// app.get("/", (req, res) => res.redirect("/docs"));
app.get("/", (req, res) => res.json({ message: "JS-Editor docs API" }));


app.use("/docs", routeDocs);

app.use("/auth", routeAuth);

// Setup server
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Eventlistener catches client request. Connection established!
io.sockets.on('connection', (socket) => {
    // Log socket id
    console.log("\nA user connected. Socket ID: ", socket.id);

    // Room created or joined
    socket.on('create', (room) => {
        socket.join(room);
        console.log("\nRoom joined: ", room);
    });

    socket.on("doc", function (data) {
        console.log("Server recieved and forwards: ", data.content)
        socket.to(data["_id"]).emit("doc", data);
    });
});


const server = httpServer.listen(port, middleware.logStartUpInfo(port));


// ─── Error Handling ─────────────────────────────────

app.use(middleware.catch404);
app.use(middleware.handleError);

// ────────────────────────────────────────────────────

module.exports = server;