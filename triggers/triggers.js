// TRIGGERS for invalid readings on create

export function createReadingTriggers(reading) {
    // Temp too high
    if (reading.temperature > 60) {
        return false;
    }

    // Temp too low
    if (reading.temperature < -50) {
        return false;
    }

    // this will allow the query if nothing is triggered
    return true;
}
