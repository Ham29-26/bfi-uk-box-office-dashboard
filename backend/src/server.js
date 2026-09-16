const express = require("express");
const cors = require("cors");

const boxOfficeRoutes = require("./routes/boxOfficeRoutes");

const app = express();

app.use(cors());

app.use("/api", boxOfficeRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/api");
});