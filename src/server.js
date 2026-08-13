const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");

const httpServer = http.createServer(app);

// console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 3000;
    initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
    process.exit(1);
  });
