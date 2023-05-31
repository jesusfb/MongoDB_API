import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid4 } from "uuid";
import { User } from "../models/user.js";
import {
    create,
    deleteByID,
    getAll,
    getByAuthKey,
    getUserByEmail,
    update,
    updateUsersRoles,
    deleteManyByIDs,
    getByID,
} from "../models/user-m.js";
import { validate } from "../middleware/validator.js";
import auth from "../middleware/auth.js";
import { ObjectId } from "mongodb";

/* Endpoints are things that are exposed and usable to the outside world: endpoints literally are the extension on the end of a URL */

/* ------------------- Endpoints ------------------- */

// Create router to represent the controller
const userController = Router();

/* ---------------------------- POST's -------------------------- */

// User login endpoint (POST)
const postUserLoginSchema = {
    type: "object",
    required: ["email", "password"],
    properties: {
        email: {
            type: "string",
        },
        password: {
            type: "string",
        },
    },
};

userController.post(
    "/users/login",
    validate({ body: postUserLoginSchema }),
    (req, res) => {
        //  #swagger.summary = "Log user in"
        /*
        #swagger.tags = ["Authentication"]
        #swagger.parameters['LoginData'] = {
            in: 'body',
            description: 'User login credentials',
            required: true,
            schema: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'User email address'
                    },
                    password: {
                        type: 'string',
                        description: 'User password'
                    }
                },
                example: {
                    email: 'test123@gmail.com',
                    password: 'abc123!'
                }
            }
        }
    */

        const loginData = req.body;

        // look up user by trying to find a user with a matching email
        getUserByEmail(loginData.email)
            // if we get to this point it means that we have found a matching email
            .then((user) => {
                // checking to see if the password matches the one in the db
                if (bcrypt.compareSync(loginData.password, user.password)) {
                    // if we get to this stage it means the login credientials match the db.

                    // we are generating a unique auth key that will be used to authenticate the user for the session
                    // and will be stored in the user's model
                    user.authenticationKey = uuid4().toString();
                    // store the updated user back in the database
                    update(user).then((result) => {
                        // sends the auth key back to the user
                        res.status(200).json({
                            status: 200,
                            message: "User is logged in",
                            authenticationKey: user.authenticationKey,
                        });
                    });
                } else {
                    // this will happen / be sent back if the password doesn't match
                    res.status(400).json({
                        status: 400,
                        message: "invalid credentials",
                    });
                }
            })
            .catch((error) => {
                // this will happen / be sent back if th query fails, server issue
                res.status(500).json({
                    status: 500,
                    message: "Failed to log user in",
                });
            });
    }
);

// User logout endpoint (POST)
const postUserLogoutSchema = {
    type: "object",
    required: ["authenticationKey"],
    properties: {
        authenticationKey: {
            type: "string",
        },
    },
};

userController.post(
    "/users/logout",
    validate({ body: postUserLogoutSchema }),
    (req, res) => {
        // #swagger.summary = "Log user out"
        /* #swagger.requestBody = {
                description: 'Log user out by forgetting authentication key',
                content: {
                    'application/json': {
                        schema: {
                            authenticationKey: 'string',
                        },
                        example: {
                            authenticationKey: '01493656-2b1b-48ba-b634-0b916b48466f',
                        }
                    }
                }
                
            } 
        */
        const authenticationKey = req.body.authenticationKey;

        getByAuthKey(authenticationKey).then((user) => {
            user.authenticationKey = null;
            update(user)
                .then((result) => {
                    res.status(200).json({
                        status: 200,
                        message: "User logged out",
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        status: 500,
                        message: "Failed to log user out",
                    });
                });
        });
    }
);

// CREATE user endpoint (POST)
const createUserSchema = {
    type: "object",
    required: ["email", "password", "role", "firstName", "lastName"],
    properties: {
        email: {
            type: "string",
        },
        password: {
            type: "string",
        },
        role: {
            type: "string",
        },
        firstName: {
            type: "string",
        },
        lastName: {
            type: "string",
        },
    },
};

userController.post(
    "/users",
    [auth(["admin"]), validate({ body: createUserSchema })],
    (req, res) => {
        // #swagger.summary = "Create a new user"
        /* #swagger.requestBody = {
                description: 'Creating a new user account (singular)',
                content: {
                    'application/json': {
                        schema: {
                            email: 'string',
                            password: 'string',
                            role: 'string',
                            firstName: 'string',
                            lastName: 'string',
                        },
                        example: {
                            email: 'test123@gmail.com',
                            password: 'abc123!', 
                            role: 'admin',
                            firstName: 'Bridgette',
                            lastName: 'Collett',
                        }
                    }
                }
                
            } 
        */
        // userData refers to the body of the query request
        const userData = req.body;

        const createdDate = new Date();

        const lastAccessed = new Date();

        // hash the password here if it isnt already been hashed
        if (!userData.password.startsWith("$2a")) {
            userData.password = bcrypt.hashSync(userData.password);
        }

        // convert the user data into a user model object
        const user = User(
            null,
            userData.email,
            userData.password,
            userData.role,
            userData.firstName,
            userData.lastName,
            createdDate,
            lastAccessed,
            null
        );

        // insert into database
        create(user)
            .then((user) => {
                res.status(200).json({
                    status: 200,
                    message: "User successfully created",
                    user: user,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message: "Failed to create user",
                });
            });
    }
);

/* ---------------------------- GET's -------------------------- */

// Get all users endpoint (GET)
userController.get("/users", async (req, res) => {
    // #swagger.summary = "Get all users"
    /* #swagger.requestBody = {
                description: 'Get a list of all users',
            } 
        */
    const users = await getAll();

    res.status(200).json({
        status: 200,
        message: "list of all users",
        Users: users,
    });
});

// Get User by ID (GET)
const getUserByIdSchema = {
    type: "object",
    required: ["id"],
    properties: {
        id: {
            type: "string",
        },
    },
};

userController.get(
    "/user/:id",
    validate({ params: getUserByIdSchema }),
    (req, res) => {
        // #swagger.summary = "Get user by ID"
        /* #swagger.requestBody = {
                description: 'Get user and account details by searching by ID',
                content: {
                    'application/json': {
                        schema: {
                            id: 'string',
                        },
                        example: {
                            id: '64587fad553b66691a4b8e9d',
                        }
                    }
                }
                
            } 
        */
        const userID = req.params.id;

        getByID(userID).then((user) => {
            res.status(200)
                .json({
                    status: 200,
                    message: "Get user by ID",
                    users: user,
                })
                .catch((error) => {
                    res.status(500).json({
                        status: 500,
                        message: "Failed get user by ID",
                    });
                });
        });
    }
);

/* ---------------------------- UPDATE's -------------------------- */

// UPDATE user (PATCH) - singular
const patchUpdateUserSchema = {
    type: "object",
    required: ["id"],
    properties: {
        id: {
            type: "string",
        },
        email: {
            type: "string",
        },
        password: {
            type: "string",
        },
        role: {
            type: "string",
        },
        firstName: {
            type: "string",
        },
        lastName: {
            type: "string",
        },
        authenticationKey: {
            type: ["string", "null"],
        },
    },
};

userController.patch(
    "/users",
    [auth(["admin"]), validate({ body: patchUpdateUserSchema })],
    async (req, res) => {
        // #swagger.summary = "Update an existing user by ID"
        /* #swagger.requestBody = {
                description: 'Creating a new user account (singular)',
                content: {
                    'application/json': {
                        schema: {
                            id: 'string',
                            email: 'string',
                            password: 'string',
                            role: 'string',
                            firstName: 'string',
                            lastName: 'string',
                            authenticationKey: 'array',
                                items: 'string',
                                nullable: 'true',
                        },
                        example: {
                            id: '64587fad553b66691a4b8e9d',
                            email: 'test123@gmail.com',
                            password: 'abc123!', 
                            role: 'admin',
                            firstName: 'Bridgette',
                            lastName: 'Collett',
                            authenticationKey: '01493656-2b1b-48ba-b634-0b916b48466f'
                        }
                    }
                }
                
            } 
        */
        const userData = req.body;

        // we will hash the password if it isn't already been hashed
        if (userData.password && !userData.password.startsWith("$2a")) {
            // the number is the salt round - this is necessary as it is the rounds it goes through for encrytion.
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        // Convert the user data into a User model object
        const user = User(
            userData.id,
            userData.email,
            userData.password,
            userData.role,
            userData.firstName,
            userData.lastName,
            userData.authenticationKey
        );

        update(user)
            .then((user) => {
                res.status(200).json({
                    status: 200,
                    message: "User updated",
                    user: user,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message: "Failed to update user",
                });
            });
    }
);

// UPDATE MANY users (PATCH) by date/time - plural
const patchUpdateManyUserSchema = {
    type: "object",
    required: ["role", "fromDate", "toDate"],
    properties: {
        role: {
            type: "string",
        },
        fromDate: {
            type: "string",
        },
        toDate: {
            type: "string",
        },
    },
};

userController.patch(
    "/users/update-many",
    [auth(["admin"]), validate({ body: patchUpdateManyUserSchema })],
    async (req, res) => {
        // #swagger.summary = "Update Many Users"
        /* #swagger.requestBody = {
                description: 'Update a batch of users by a date range',
                content: {
                    'application/json': {
                        schema: {
                            role: 'string',
                            fromDate: 'string',
                            toDate: 'string',
                        },
                        example: {
                            role: 'admin',
                            fromDate: '2023-05-19',
                            toDate: '2023-05-21',
                        }
                    }
                }
                
            } 
        */
        const fromDate = new Date(req.body.fromDate);
        const toDate = new Date(req.body.toDate);
        try {
            const updatedUsers = await updateUsersRoles(
                fromDate,
                toDate,
                req.body.role
            );
            res.status(200).json({
                status: 200,
                message: `Successfully updated ${updatedUsers} users to ${req.body.role}`,
                updatedCount: updatedUsers,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 200,
                message: "Error updating users.",
            });
        }
    }
);

/* ---------------------------- DELETE's -------------------------- */

// DELETE user by ID endpoint - singular
const deleteUserByIdSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
        },
    },
};
userController.delete(
    "/users",
    [auth(["admin"]), validate({ body: deleteUserByIdSchema })],
    (req, res) => {
        // #swagger.summary = "Delete user by ID"
        /* #swagger.requestBody = {
                description: 'Delete a specific (singular) user by their ID',
                content: {
                    'application/json': {
                        schema: {
                            id: 'string',
                        },
                        example: {
                            id: '64587fad553b66691a4b8e9d',
                        }
                    }
                }
                
            } 
        */
        const userID = req.body.id;

        deleteByID(userID)
            .then((result) => {
                res.status(200).json({
                    status: 200,
                    message: "User deleted",
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message: "Failed to delete user",
                });
            });
    }
);

// DELETE Many users endpoint - plural
const deleteManyUserByIDSchema = {
    type: "object",
    properties: {
        ids: {
            type: ["array", "string"],
        },
    },
};

userController.delete(
    "/users/delete-many",
    [auth(["admin"]), validate({ params: deleteManyUserByIDSchema })],
    (req, res) => {
        // #swagger.summary = "Delete Many Users"
        /* #swagger.requestBody = {
        description: 'Delete many specific (plural) users by their IDs',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        ids: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                },
                example: {
                    ids: ["64675b05e96736b4062c4eb7", "64675af0e96736b4062c4eb5"]
                }
            }
        }
    } */

        // This says that the ID array will be in the body of the request
        const ids = req.body.ids;

        // This creates a new array of user ids, formatted so that mongoDB understands them (ObjectId) when they're being queried.
        const mappedIds = ids.map((id) => new ObjectId(id));

        deleteManyByIDs(mappedIds)
            .then((deletedUsers) => {
                res.status(200).json({
                    status: 200,
                    message: "Users deleted",
                    deletedCount: deletedUsers,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 500,
                    message: "Failed to delete users",
                });
            });
    }
);

export default userController;

/*----------------------------------------------------------------*/

/// NOTES

// Mapped concept
// const array = [1,2,3,4,5]
// const newArray = array.map(number => number + 2) // [3,4,5,6,7]
