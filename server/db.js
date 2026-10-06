import dns from "node:dns";
import { MongoClient } from "mongodb";

// The local router DNS returns malformed SRV responses to Node.js.
// Use public resolvers during local development; production uses its platform DNS.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

let clientPromise;

export async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    clientPromise = client.connect().catch(async (error) => {
      clientPromise = undefined;
      await client.close();
      throw error;
    });
  }

  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "todolist");
}

export async function getTodosCollection() {
  const database = await getDatabase();
  return database.collection("todos");
}

export async function getUsersCollection() {
  const database = await getDatabase();
  return database.collection("users");
}
