
/**═════════════════════════════════════════════
 **            RESET DATABASE DATA
 *══════════════════════════════════════════════**/

const database = require("./database.js");
const fs = require("fs");
const path = require("path");
const usersData = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "data_users.json"),
    "utf8"
));
const docsData = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "data_docs.json"),
    "utf8"
));

require('dotenv').config();
let db;

async function resetCollection(colName, data) {
    try {
        db = await database.getDb(colName);
        await db.collection.deleteMany();
        await db.collection.insertMany(data);
        console.log(`${colName} collection is reset`);
    } catch (e) {
        console.log(`Could not reset ${colName} collection`);
        console.log(e);
    } finally {
        db.client.close();
    }
}

async function resetDatabase() {
    await resetCollection("users", usersData);
    await resetCollection("docs", docsData);
}

resetDatabase();

