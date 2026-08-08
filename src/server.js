const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();

const app = require("./app");

// console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
    process.exit(1);
  });

  