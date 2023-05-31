import { Reading } from "./reading.js";
import { ObjectId } from "mongodb";
import { db } from "../mongodb.js";
import { createReadingTriggers } from "../triggers/triggers.js";

/* ---------------------- READ -------------------------*/

// GET ALL
export async function getAll() {
    // Get the collection fo all readings
    let allReadingResults = await db.collection("readings").find().toArray();
    // convert the collection of results into a list of Readings objects
    return await allReadingResults.map((readingResults) =>
        Reading(
            readingResults._id.toString(),
            readingResults.deviceName,
            readingResults.precipitation,
            readingResults.time,
            readingResults.latitude,
            readingResults.longitude,
            readingResults.atmosphericPressure,
            readingResults.maxWindSpeed,
            readingResults.solarRadiation,
            readingResults.vaporPressure,
            readingResults.humidity,
            readingResults.windDirection,
            readingResults.temperature
        )
    );
}

// GET MAX PRECIPITATION

export async function getMaxPrecipitation(deviceName, startDate) {
    let maxPrecipitationResult = db
        .collection("readings")
        .aggregate([
            // used to filter based on specific conditions
            {
                $match: {
                    // Name of station
                    "Device Name": deviceName,
                    // 5 months ago from specified date
                    Time: {
                        $gte: new Date(startDate),
                    },
                },
            },
            {
                $project: {
                    // retun specified fields
                    _id: 0,
                    "Device Name": 1,
                    Time: 1,
                    "Precipitation mm/h": 1,
                },
            },
            {
                $sort: {
                    //sort order
                    "Precipitation mm/h": -1,
                },
            },
            {
                // return just one value
                $limit: 1,
            },
        ])
        .toArray();

    return maxPrecipitationResult;
}

// GET READING BY SPECIFIC DATE/TIME

export async function getByDateTime(deviceName, time) {
    const readingResult = await db
        .collection("readings")
        .aggregate([
            {
                $match: {
                    "Device Name": deviceName,
                    $expr: {
                        $eq: [{ $hour: "$Time" }, time.getHours()],
                    },
                },
            },
            {
                $project: {
                    // return specified fields
                    _id: 0,
                    "Temperature (deg C)": 1,
                    "Atmospheric Pressure (kPa)": 1,
                    "Precipitation mm/h": 1,
                    "Solar Radiation (W/m2)": 1,
                },
            },
            {
                $limit: 1,
            },
        ])
        .toArray();

    return readingResult;
}

// GET MAX TEMP
export async function getMaxTempReading(startDate, endDate) {
    let maxTempResult = db
        .collection("readings")
        .find({
            Time: {
                $gt: startDate,
                $lt: endDate,
            },
        })
        // return specific field
        .project({
            _id: 0,
            "Device Name": 1,
            Time: 1,
            "Temperature (deg C)": 1,
        })
        // sort order
        .sort({
            "Temperature (deg C)": -1,
        })
        // 1 value
        .limit(1)
        .toArray();

    return maxTempResult;
}

/* ----------------------- CREATE ----------------------*/

// POST SINGLE READING
// Purpose is to take in an reading object and create new record in the db
export async function create(reading) {
    // Trigger
    let successful = createReadingTriggers(reading);
    if (!successful) {
        return Promise.reject("Trigger stopped request");
    }

    // New readings should not have an existing id, delete just to be sure (clear ID field).
    delete reading.id;
    // Insert the reading object and return with the resulting promise
    return db
        .collection("readings")
        .insertOne(reading)
        .then((result) => {
            // Clear the auto generated (object id) mongo db _id field and insert the new ID into the reading.id field
            delete reading._id;
            // Insert new id into reading._id field
            // This only needs to be done once per model - same id value just changing the name
            // we do this so that we can actually use it later, the data is in a format we can use (string)
            return { ...reading, id: result.insertedId.toString() };
        });
}

// POST BATCH READINGS, for single station
export async function createBatch(deviceName, readings) {
    // Trigger
    let successful = createReadingTriggers(reading);
    if (!successful) {
        return Promise.reject("Trigger stopped request");
    }

    // map over each reading return an object with...
    const mappedReadings = readings.map((reading) => ({
        // ... the original reading + the device name
        ...reading,
        "Device Name": deviceName,
    }));

    // create query to insert many readings as an array
    let createBatchResult = db
        .collection("readings")
        .insertMany(mappedReadings);

    // insert readings into the database
    return createBatchResult;
}

/* ---------------------- UPDATE -------------------------*/

// PUT Update a specific values (precipitation)

export async function updatePrecipitation(readingID, precipitation) {
    // converting the id into a ObjectId in the databse
    const id = new ObjectId(readingID);

    // Query to say find the ID and set the field value to the following
    const result = await db
        .collection("readings")
        .findOneAndUpdate(
            { _id: id },
            { $set: { "Precipitation mm/h": precipitation } },
            { returnOriginal: false, returnDocument: "after" }
        );

    // return the result of the query
    return result.value;
}
/* --------------------------- COULD BE HELPFUL -\ (`o`) /- -------- */
