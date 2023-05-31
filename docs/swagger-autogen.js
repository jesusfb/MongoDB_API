import swaggerAutogen from "swagger-autogen";

// Configuration object - show how it actually works
const doc = {
    info: {
        version: "1.0.0",
        title: "Weather Station API",
        description: "JSON REST API for recording weather station data",
    },
    // this would be where the URL would go when hosted online
    host: "localhost:8081",
    basePath: "/",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
};

const outputFile = "./docs/swagger-output.json";
const endpointFiles = ["./server.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointFiles, doc);

// add more descriptors etc. later (link in week 1 file)
