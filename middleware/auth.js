import { getByAuthKey } from "../models/user-m.js";

export default function auth(allowed_roles) {
    return function (req, res, next) {
        // Get the auth Key from the req body or query string
        const authenticationKey =
            req.body.authenticationKey ?? req.query.authKey;

        // Check that the key was sent
        if (authenticationKey) {
            // Lookup the user ID by auth key if key was sent
            getByAuthKey(authenticationKey)
                .then((user) => {
                    // Check if the matching user has the required role
                    if (allowed_roles.includes(user.role)) {
                        // allow them to pass (next())
                        next();
                    } else {
                        // Send back access forbidden response
                        res.status(403).json({
                            status: 403,
                            message: "Access Forbiden",
                        });
                    }
                })
                .catch((error) => {
                    // No user found - invalid or expired key
                    res.status(401).json({
                        status: 401,
                        message: "Auth key invalid or expired",
                    });
                });
        } else {
            res.status(401).json({
                status: 401,
                message: " Auth key missing from request ",
            });
        }
    };
}
