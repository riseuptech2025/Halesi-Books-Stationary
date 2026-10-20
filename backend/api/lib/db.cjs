// backend/api/lib/db.cjs
const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db("halesi_books");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase };