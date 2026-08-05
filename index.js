const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

const app = express()
dotenv.config()
app.use(express.json())

const parentRoutes = require("./routes/route.parent")
app.use("/parent", parentRoutes)

const secretarieRoutes = require("./routes/route.secretarie")
app.use("/secretarie", secretarieRoutes)

const PORT = process.env.PORT
const URLDB = process.env.URLDB

mongoose.connect(URLDB)
.then(() => {
    console.log("database created successfully");

    app.listen(PORT, () => {
        console.log(`the server running successfully on ${PORT}`);
    });
})
.catch((err) => {
    console.log(`error in database ${err}`);
});
