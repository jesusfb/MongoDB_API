import { MongoClient } from "mongodb";
// mongodb+srv://weather-station-API-user:wFHCt5G@weatherdatacluster.ky74ppd.mongodb.net/?retryWrites=true&w=majority
const connectionString =
    "mongodb+srv://jesusfb:Dove3229-@cluster0.yx9sjqo.mongodb.net/api1";

export const client = new MongoClient(connectionString);

export const db = client.db("weather-station-readings");

// Ultimate Admin/Root User (all access)
// User: Admin
// Password: UpF0Czuz

// API Access user (limited CRUD):
// User: weather-station-API-user
// Password: jZMow6VKDtHB9DDH
