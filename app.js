const express = require("express");
var cors = require('cors')
require("dotenv").config();
const serverless = require("serverless-http");
const app = express();


require("./db/db.connection");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


require('./routes')(app);

app.get("/", async (req, res) => {
    return res.json({ message: "baap-academic-service" });
});

// TODO :: Need to check if there is a better way to handled global exceptions to avoid app crashing issues
process.on("uncaughtException", function (error) {
    console.log(error.stack);
});

app.listen(2000, () => console.log("Server started on port 2000"));
module.exports.handler = serverless(app);