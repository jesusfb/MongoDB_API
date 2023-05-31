// ACTUALLY DEFINE MODEL OBJECTS - what does a reading look like
// Define the general structure: Readings model (object) constructor

export function Reading(
    id,
    deviceName,
    precipitation,
    time,
    latitude,
    longitude,
    atmosphericPressure,
    maxWindSpeed,
    solarRadiation,
    vaporPressure,
    humidity,
    temperature,
    windDirection
) {
    // Returning an Object with the same fields:
    return {
        id,
        deviceName,
        precipitation,
        time,
        latitude,
        longitude,
        atmosphericPressure,
        maxWindSpeed,
        solarRadiation,
        vaporPressure,
        humidity,
        temperature,
        windDirection,
    };
}

/* 
Testing it works: Animal Object
Define:   const (name of thing) = Reading("values", "values")
          console.log(name of things)

Terminal: node ./models/reading-m.js
*/
