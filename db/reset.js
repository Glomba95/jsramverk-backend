
/**═════════════════════════════════════════════
 **            RESET DATABASE DATA
 *══════════════════════════════════════════════**/
 
const database      = require("../db/database.js");
const fs            = require("fs");
const path          = require("path");
const data          = JSON.parse(fs.readFileSync(
                        path.resolve(__dirname, "data.json"),
                        "utf8"
                    ));

require('dotenv').config();
let db;

resetCollection();

async function resetCollection() {
    try {
        db = await database.getDb();
        await db.collection.deleteMany();   
        await db.collection.insertMany(data);
        console.log("Collection is reset");
    } catch (e) {
        console.log("Could not reset collection");
        console.log(e);
    } finally {
        db.client.close();
    }
}

