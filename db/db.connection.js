const mongoose = require("mongoose")

const mongodbUrl = process.env.connectionString;
mongoose.set("strictQuery", false);
mongoose.connect(mongodbUrl, { useNewUrlParser: true,dbName:"baap-acadamic-local" })
	.then(() => {
        console.log("Connected to the database");
	})

module.exports = mongoose;