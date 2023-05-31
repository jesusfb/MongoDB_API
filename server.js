import express from "express";
import cors from "cors";

// Create the express application:
const port = 8081;
const app = express();

// Turn on / enable the CORS middleware:
app.use(
    cors({
        // Currently allowing all origins:
        // origin: true
        origin: ["https://www.google.com"],
    })
);

// Import and enable swagger documentation
import docsRouter from "./middleware/swagger-doc.js";
app.use(docsRouter);

// Enable JSON request body parsing middleware - so that you can use JSON
app.use(express.json());

// Import and use controllers here! (link in the controllers)
import userController from "./controllers/user-c.js";
app.use(userController);

import readingsController from "./controllers/reading-c.js";
import { validatorErrorMiddleware } from "./middleware/validator.js";
app.use(readingsController);

// .. Import and use validation error handing middleware
app.use(validatorErrorMiddleware);

// Start listening for API requests
app.listen(
    port,
    // function that will be executed once the server is online
    () => {
        console.log(`Express started on http://localhost:${port}`);
    }
);

// Testing access in google
// SIMPLE REQUEST
// fetch("http://localhost:8081/users").then(res =>res.json()).then(data => console.log(data))

// NOT SIMPLE PRE_FLIGHT REQUEST
// fetch("http://localhost:8081/users", {
//      method: "DELETE",
//      headers: {
//          'Content-Type: "application/json"
//      },
//      body: JSON.stringify({
//          id: "abc123"
//      })
// })
//      .then(res =>res.json())
//      .then(data => console.log(data))
