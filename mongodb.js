import { MongoClient } from "mongodb";
// mongodb+srv://weather-station-API-user:wFHCt5G@weatherdatacluster.ky74ppd.mongodb.net/?retryWrites=true&w=majority
const connectionString =
    "mongodb+srv://weather-station-API-user:jZMow6VKDtHB9DDH@weatherdatacluster.ky74ppd.mongodb.net/test?proxyHost=mongodb.bypass.host&proxyPort=80&proxyUsername=student&proxyPassword=student";

export const client = new MongoClient(connectionString);

export const db = client.db("weather-station-readings");

// Ultimate Admin/Root User (all access)
// User: Admin
// Password: UpF0Czuz

// API Access user (limited CRUD):
// User: weather-station-API-user
// Password: jZMow6VKDtHB9DDH
