/**═══════════════════════════════════════════════════
 **                    ENTRY POINT
 *════════════════════════════════════════════════════**/

require('dotenv').config();

const express = require("express");
const middleware = require("./middleware/index.js");
const cors = require("cors");

const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema } = require("graphql");

const RootQueryType = require("./graphql/root.js");
const RootMutationType = require("./graphql/mutation.js")

const app = express();
const httpServer = require("http").createServer(app);

const port = process.env.PORT || 1337;

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
});



// ─── Middleware ─────────────────────────────────────

app.use(cors());
middleware.manageLogging(app);
app.use(express.json());


// ─── Routes and Connections ─────────────────────

app.use('/graphql', graphqlHTTP((req, res) => ({
    schema: schema,
    context: { req, res },
    graphiql: false, // NOTE Visual är satt till true under utveckling, byt till false innan produktion
})));



// ─── Setup Server ────────────────────────────────────────────────────

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Eventlistener catches client request. 
// Connection established!
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