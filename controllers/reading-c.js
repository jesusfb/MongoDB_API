// import { validate } from "../middleware/validator.js";
import { Router } from "express";
import { Reading } from "../models/reading.js";
import { validate } from "../middleware/validator.js";
import auth from "../middleware/auth.js";
import {
    getMaxTempReading,
    create,
    updatePrecipitation,
    getMaxPrecipitation,
    createBatch,
    getByDateTime,
} from "../models/reading-m.js";

/* --------------------- Endpoints ----------------------- */

const readingsController = Router();

/* ----------------------- CREATE ----------------------*/

// Insert one new reading (POST)
const createReadingSchema = {
    type: "object",
    required: [
        "deviceName",
        "precipitation",
        "time",
        "latitude",
        "longitude",
        "atmosphericPressure",
        "maxWindSpeed",
        "solarRadiation",
        "vaporPressure",
        "humidity",
        "temperature",
        "windDirection",
    ],
    properties: {
        deviceName: {
            type: "string",
        },
        precipitation: {
            type: "number",
        },
        time: {
            type: "string",
        },
        latitude: {
            type: "number",
        },
        longitude: {
            type: "number",
        },
        atmosphericPressure: {
            type: "number",
        },
        maxWindSpeed: {
            type: "number",
        },
        solarRadiation: {
            type: "number",
        },
        vaporPressure: {
            type: "number",
        },
        humidity: {
            type: "number",
        },
        temperature: {
            type: "number",
        },
        windDirection: {
            type: "number",
        },
    },
};

readingsController.post(
    "/readings",
    [
        auth(["admin", "student", "station"]),
        validate({ body: createReadingSchema }),
    ],
    (req, res) => {
        // #swagger.summary = "Insert a new reading"
        /* #swagger.requestBody = {
                description: 'Insert a new weather reading document',
                content: {
                    'application/json': {
                        schema: {
                            deviceName: "string",
                            precipitation: "number",
                            time: 'string",
                            latitude: "number",
                            longitude: "number",
                            atmosphericPressure: "number",
                            maxWindSpeed: "number",
                            solarRadiation: "number",
                            vaporPressure: "number",
                            humidity: "number",
                            temperature: "number",
                            windDirection: "number",
                        },
                        example: {
                            deviceName: 'My_Sensor',
                            precipitation: '0.085', 
                            time: '2021-05-07T02:44:05.000+00:00',
                            latitude: '152.77891',
                            longitude: '-26.95064',
                            atmosphericPressure: '128.07', 
                            maxWindSpeed: '4.16',
                            solarRadiation: '493.42',
                            vaporPressure: '1.8',
                            humidity: '72.76',
                            temperature: '23.89',
                            windDirection: '153.6',
                        }
                    }
                }
                
            } 
        */

        const userData = req.body;

        // NEED TO CONVERT THE time "string" to a date
        const readingTime = new Date(userData.time);

        const reading = Reading(
            null,
            userData.deviceName,
            userData.precipitation,
            readingTime,
            userData.latitude,
            userData.longitude,
            userData.atmosphericPressure,
            userData.maxWindSpeed,
            userData.solarRadiation,
            userData.vaporPressure,
            userData.humidity,
            userData.temperature,
            userData.windDirection
        );

        create(reading)
            .then((reading) => {
                res.status(200).json({
                    status: 200,
                    message: "Create reading - singular",
                    reading: reading,
                });
            })
            .catch((error) => {
                console.error("Error:", error); // Log the error message
                res.status(500).json({
                    status: 500,
                    message: "Failed to create reading - singular",
                });
            });
    }
);

// Insert multiple readings for a single station (POST)
// Insert many - array of single readings

const readingDataSchema = {
    type: "object",
    properties: {
        precipitation: {
            type: "number",
        },
        time: {
            type: "string",
        },
        latitude: {
            type: "number",
        },
        longitude: {
            type: "number",
        },
        atmosphericPressure: {
            type: "number",
        },
        maxWindSpeed: {
            type: "number",
        },
        solarRadiation: {
            type: "number",
        },
        vaporPressure: {
            type: "number",
        },
        humidity: {
            type: "number",
        },
        temperature: {
            type: "number",
        },
        windDirection: {
            type: "number",
        },
    },
};

const insertBatchReadingsSchema = {
    type: "object",
    required: ["deviceName", "readings"],
    properties: {
        deviceName: {
            type: "string",
        },
        readings: {
            type: "array",
            items: readingDataSchema,
        },
    },
};

readingsController.post(
    "/readings-many",
    [
        auth(["admin", "student", "station"]),
        validate({ body: insertBatchReadingsSchema }),
    ],
    async (req, res) => {
        // #swagger.summary = 'Insert Many Readings as an array'
        /* #swagger.requestBody = {
                description: 'Insert multiple (plural) readings for a single station',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                deviceName: "string",
                                readings: "array",
                                    items: {
                                        precipitation: "number",
                                        time: 'string",
                                        latitude: "number",
                                        longitude: "number",
                                        atmosphericPressure: "number",
                                        maxWindSpeed: "number",
                                        solarRadiation: "number",
                                        vaporPressure: "number",
                                        humidity: "number",
                                        temperature: "number",
                                        windDirection: "number",
                                    }
                            }
                        },
                        example: {
                            deviceName: 'My_Sensor',
                            readings: [
                                {
                                precipitation: '0.085', 
                                time: '2021-05-07T02:44:05.000+00:00',
                                latitude: '152.77891',
                                longitude: '-26.95064',
                                atmosphericPressure: '128.07', 
                                maxWindSpeed: '4.16',
                                solarRadiation: '493.42',
                                vaporPressure: '1.8',
                                humidity: '72.76',
                                temperature: '23.89',
                                windDirection: '153.6'
                                }                              
                            ]
                        }
                    }
                }
                
            } 
        */

        const { deviceName, readings } = req.body;

        try {
            const addedReadings = await createBatch(deviceName, readings);
            // convert the time string to a usable date
            // const readingsTime = new Date(userData.time)
            res.status(200).json({
                status: 200,
                message: "Create readings - plural",
                readingsAdded: addedReadings.insertedCount,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 500,
                message: "Failed to create readings - plural",
            });
        }
    }
);

/* ---------------------- READ -------------------------*/

// Get max precipitation recorded in the last 5 Months for a specific sensor (GET)
/* returning the sensor name, reading date / time and the precipitation value */
const getMaxPrecipitationSchema = {
    type: "object",
    required: ["deviceName", "startDate"],
    properties: {
        deviceName: {
            type: "string",
        },
        startDate: {
            type: "string",
        },
    },
};

readingsController.get(
    "/readings/max-precipitation",
    validate({ query: getMaxPrecipitationSchema }),
    async (req, res) => {
        //#swagger.summary = "Get list of max precipitation from readings"
        /* #swagger.requestBody = {
                description: 'Get the max precipitation recorded in the last 5 Months for a specific sensor, 
                returning only the sensor name, reading date/time and the precipitation values',
                content: {
                    'application/json': {
                        schema: {
                            deviceName: {
                                type: "string",
                            },
                            startDate: {
                                type: "string",
                            }
                        example: {
                            deviceName: 'Woodford_Sensor',
                        }
                    }
                }
                
            } 
        */

        const deviceName = req.query.deviceName;
        const startDate = new Date(req.query.startDate);
        // const reading = await getMax(amount)

        getMaxPrecipitation(deviceName, startDate)
            .then((reading) => {
                console.log("Max precipitation:", reading); // Log the result of getMaxPrecipitation

                res.status(200).json({
                    status: 200,
                    message: "Max precipitation of readings by date",
                    reading: reading,
                });
            })
            .catch((error) => {
                console.error("Error:", error); // Log the error message
                res.status(500).json({
                    status: 500,
                    message: "Failed to get max precipitation of readings",
                });
            });
    }
);

// Get specific station reading at a specific date / time (hour) (GET)
/* temperature, atmospheric pressure, radiation and precipitation */

const getWeatherMetricsByDateTimeSchema = {
    type: "object",
    required: ["deviceName", "time"],
    properties: {
        deviceName: {
            type: "string",
        },
        time: {
            type: "string",
        },
    },
};

// readingsController.get("/readings/by-station/:station?datetime=", (req, res) => { - need to look into query strings

readingsController.get(
    "/readings/by-station",
    validate({ query: getWeatherMetricsByDateTimeSchema }),
    async (req, res) => {
        //#swagger.summary = "Get specific stations readings"
        /* #swagger.requestBody = {
                description: 'Get specific station reading at a specific date/time (hour),
                returning only temperature, atmospheric pressure, radiation and precipitation values',
                content: {
                    'application/json': {
                        schema: {
                            station: 'string',
                        },
                        example: {
                            station: 'Woodford_Sensor',
                        }
                    }
                }
                
            } 
        */

        const deviceName = req.query.deviceName;
        const time = new Date(req.query.time);

        getByDateTime(deviceName, time)
            .then((reading) => {
                res.status(200).json({
                    status: 200,
                    message: "Specific station reading by date / time",
                    reading: reading,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message:
                        "Failed to get specific station reading by date / time",
                });
            });
    }
);

// GET MAX TEMP by date/time - range for all sensors endpoint

const getMaxTempSchema = {
    type: "object",
    // start_date, end_date
    required: ["startDate", "endDate"],
    properties: {
        startDate: {
            type: "string",
        },
        endDate: {
            type: "string",
        },
    },
};

readingsController.get(
    "/readings/max-temp",
    validate({ query: getMaxTempSchema }),
    async (req, res) => {
        //#swagger.summary = "Get all readings Max Temperature by date/time"
        /* #swagger.requestBody = {
                description: 'Get Max Temp by date/time range for all sensors,
                returning only sensor name, reading date/time and the precipitation values',
                content: {
                    'application/json': {
                        schema: {
                            startDate: 'string',
                            endDate: 'string',
                        },
                        example: {
                            startDate: '2020-01-01',
                            endDate: '2023-01-01',
                        }
                    }
                }
                
            } 
        */
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        // const reading = await getMaxTemp(startDate, endDate)

        getMaxTempReading(startDate, endDate)
            .then((reading) => {
                res.status(200).json({
                    status: 200,
                    message: "Get max temp reading",
                    reading: reading,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message: "Failed to get max temp reading",
                });
            });

        // try {
        //     const maxTempReading = await getMaxTempReading(startDate, endDate)
        //     res.status(200).json({
        //         status: 200,
        //         message: "Get max temp reading - Not yet implemented",
        //         reading: maxTempReading
        //     })
        // } catch (error) {
        //     res.status(500).json({
        //         status: 500,
        //         message: "Failed to get max temp reading"
        //     })
        // }
    }
);

// http://localhost:8081/readings/testing?start_date=2019-01-01&end_date=2023-01-01

/* ---------------------- UPDATE -------------------------*/

// UPDATE One - for specified entries precipitation value endpoint
const putUpdateStationSchema = {
    type: "object",
    required: ["id"],
    properties: {
        id: {
            type: "string",
        },

        precipitation: {
            type: "number",
        },
    },
};

readingsController.put(
    "/readings",
    [auth(["admin"]), validate({ body: putUpdateStationSchema })],
    async (req, res) => {
        //#swagger.summary = " Update one readings specific entry"
        /* #swagger.requestBody = {
                description: 'Update a single readings precipitation value',
                content: {
                    'application/json': {
                        schema: {
                            id: 'string',
                            precipitation: 'number',
                        },
                        example: {
                            id: '642e60ef9c4141e1fd3c897a',
                            precipitation: '0.9',
                        }
                    }
                }
                
            } 
        */

        try {
            const { id, precipitation } = req.body;

            const updatedReading = await updatePrecipitation(id, precipitation);

            // wright concern
            // whole new query to pull in the data? 

            if (!updatedReading) {
                return res.status(404).json({
                    status: 404,
                    message: "Reading cannot be found, invalid ID",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Reading successfully updated",
                data: updatedReading,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 500,
                message: "Failed to update reading",
            });
        }
    }
);

// this would be needed to make this code work, if combining the model and controller, could be fine.
//         const Reading = db.collection("readings")

//         const updatedReading = await Reading.findOneAndUpdate(
//             { _id: id },
//             { precipitation },
//             { new: true }
//           );

export default readingsController;
