
/**═════════════════════════════════════════════
 **            DATABASE CONNECTION
 *══════════════════════════════════════════════**/

"use strict";
const mongo     = require("mongodb").MongoClient;
const colName   = "docs";


const database = {
    getDb: async function getDb () {
        let dsn = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@jsramverk.hhuinjd.mongodb.net/docsDB?retryWrites=true&w=majority`;

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://localhost:27017/test";
        }

        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const collection = await db.collection(colName);

        return {
            collection: collection,
            client: client,
        };
    }
};


module.exports = database;