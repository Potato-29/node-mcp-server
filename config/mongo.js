import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const url = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

let mongoClient = null;

export const initializeMongo = async () => {
  if (mongoClient) {
    return mongoClient;
  }
  mongoClient = await MongoClient.connect(url, {
    dbName,
  });
  return mongoClient;
};

export const getMongoDb = async () => {
  if (!mongoClient) {
    let client = await initializeMongo();
    return client.db(dbName);
  }
  return mongoClient;
};
