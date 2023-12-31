
/**═════════════════════════════════════════════
 **            DATABASE CONNECTION
 *══════════════════════════════════════════════**/

"use strict";
const mongo     = require("mongodb").MongoClient;


const database = {
    getDb: async function getDb (colName="docs") {
        let dsn = `mongodb+srv://texteditor:${process.env.ATLAS_PASSWORD}@jsramverk.hhuinjd.mongodb.net/docsDB?retryWrites=true&w=majority`;

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://127.0.0.1:27017/test";
        }

        const client  = await mongo.connect(dsn);
        const db = await client.db();
        const collection = await db.collection(colName);

        return {
            db: db,
            collection: collection,
            client: client,
        };
    }
};


module.exports = database;