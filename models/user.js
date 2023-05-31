// Function constructing a user model:
export function User(
    id,
    email,
    password,
    role,
    firstName,
    lastName,
    createdDate,
    lastAccessed,
    authenticationKey
) {
    // Returning an Object with the same fields:
    return {
        id,
        email,
        password,
        role,
        firstName,
        lastName,
        createdDate,
        lastAccessed,
        authenticationKey,
    };
}
