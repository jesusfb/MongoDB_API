import { ObjectId } from "mongodb";
import { db } from "../mongodb.js";
import { User } from "./user.js";

/* ---------------------- READS ------------------------ */

// GET ALL
export async function getAll() {
    // get the collection of all users
    const allUserResults = await db.collection("users").find().toArray();
    // Convert the collection of results into a list of uUser Objects/User model
    return await allUserResults.map((userResult) =>
        User(
            userResult._id.toString(),
            userResult.email,
            userResult.password,
            userResult.role,
            userResult.firstName,
            userResult.lastName,
            userResult.createdDate,
            userResult.lastAccessed,
            userResult.authenticationKey
        )
    );
}

// GET BY ID
export async function getByID(userID) {
    // GET one user with matching ID
    let userResult = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userID) });

    // Convert the result document into an User object
    if (userResult) {
        return Promise.resolve(
            User(
                userResult._id.toString(),
                userResult.email,
                userResult.password,
                userResult.role,
                userResult.firstName,
                userResult.lastName,
                userResult.createdDate,
                userResult.lastAccessed,
                userResult.authenticationKey
            )
        );
    } else {
        // Return if it didnt work out: rejected and couldnt be found.
        // It has to be a valid ID (legth etc) but it doesnt have to exist for this to return.
        return Promise.reject("no user found");
    }
}

// GET BY EMAIL
export async function getUserByEmail(email) {
    // GET one user with matching email
    let userResult = await db.collection("users").findOne({ email });

    // Convert the result document into an User object
    if (userResult) {
        return Promise.resolve(
            User(
                userResult._id.toString(),
                userResult.email,
                userResult.password,
                userResult.role,
                userResult.firstName,
                userResult.lastName,
                userResult.createdDate,
                userResult.lastAccessed,
                userResult.authenticationKey
            )
        );
    } else {
        // Return if it didnt work out: rejected and couldnt be found.
        return Promise.reject("no email found");
    }
}

// GET BY AUTH KEY
export async function getByAuthKey(authenticationKey) {
    // GET one user with matching ID
    let userResult = await db
        .collection("users")
        .findOne({ authenticationKey });

    // Convert the result document into an User object
    if (userResult) {
        return Promise.resolve(
            User(
                userResult._id.toString(),
                userResult.email,
                userResult.password,
                userResult.role,
                userResult.firstName,
                userResult.lastName,
                userResult.createdDate,
                userResult.lastAccessed,
                userResult.authenticationKey
            )
        );
    } else {
        // Return if it didnt work out: rejected and couldnt be found.
        return Promise.reject("no User found");
    }
}

/* -------------------- REMAINING CUD --------------------- */

// CREATE
export async function create(user) {
    // New user should not have an existing ID, as best practice delete to be sure.
    delete user.id;
    // Insert user object and return it
    return db
        .collection("users")
        .insertOne(user)
        .then((result) => {
            // mdbs auto created _id, delete
            delete user._id;
            return { ...user, id: result.insertedId.toString() };
        });
}

/* ----------------------------------------------- CHANGE THIS STUFF --------*/
// UPDATE by ID
export async function update(user) {
    // Convert the ID into a mdb objectId and remove from object;
    // Takes the way the user model represent an ID and converts it into the way mdb represents an ID
    const userID = new ObjectId(user.id);
    delete user.id;
    // Create the update document - specifies how it should update
    const userUpdateDocument = {
        $set: user,
    };
    // Run the update query and return the resulting promise
    return db
        .collection("users")
        .updateOne({ _id: userID }, userUpdateDocument);
}

// UPDATE user role by date/time

export async function updateUsersRoles(fromDate, toDate, role) {
    const updatedUsers = await db.collection("users").updateMany(
        {
            createdDate: {
                $gt: fromDate,
                $lt: toDate,
            },
        },
        {
            $set: {
                role: role,
            },
        }
    );

    return updatedUsers.modifiedCount;
}

//// - Another way to write
// export async function updateMany(startDate, endDate, role){

//     const userUpdateManyDocument = {
//         $set: {
//             role: role
//         }
//     }

//     const dateRange = {
//         createdDate: {
//             $gte: startDate,
//             $lte: endDate
//         }
//     }

//     return db.collection("users").updateMany({dateRange}, {userUpdateManyDocument})
// }

// DELETE
export async function deleteByID(userID) {
    return db.collection("users").deleteOne({ _id: new ObjectId(userID) });
}

// DELETE MANY
export async function deleteManyByIDs(ids) {
    const deletedUsers = await db
        .collection("users")
        .deleteMany({ _id: { $in: ids } });
    return deletedUsers.deletedCount;

    // return db.collection("users").deleteMany({_id: { $in: ids }  }).then(results => results.deletedCount)
}

/*----------------------------------------------------------------*/
//// NOTES

// export async function updateUsersByDate(fromDate, toDate)
// const (whatever i want to call it) = db.collection.findMany(between two date)
// return the update function
