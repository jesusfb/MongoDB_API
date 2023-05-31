// // delete
// fetch("http://localhost:8081/users", {
//     method: "DELETE",
//     headers: {
//         'Content-Type': "application/json"
//     },
//     body: JSON.stringify({
//         id: "12345678910",
//     })
// })
//     .then(res => res.json())
//     .then(data => console.log(data))

// // patch
// fetch("http://localhost:8081/users/update-many", {
//     method: "PATCH",
//     headers: {
//         'Content-Type': "application/json"
//     },
//     body: JSON.stringify({
//         fromDate: "2023-05-19",
//         toDate: "2023-05-21",
//         role: "admin"
//     })
// })
//     .then(res => res.json())
//     .then(data => console.log(data))

// // post
// fetch("http://localhost:8081/users", {
//     method: "POST",
//     headers: {
//         'Content-Type': "application/json"
//     },
//     body: JSON.stringify({
//         email: "dummye3@gmail.com",
//         password: "abc123!",
//         role: "student",
//         firstName: "Garry",
//         lastName: "Collett",
//     })
// })
//     .then(res => res.json())
//     .then(data => console.log(data))

// // put
// fetch("http://localhost:8081/readings", {
//     method: "PUT",
//     headers: {
//         'Content-Type': "application/json"
//     },
//     body: JSON.stringify({
//         id: "642e60ef9c4141e1fd3c897a",
//         precipitation: 0.09,
//     })
// })
//     .then(res => res.json())
//     .then(data => console.log(data))
