const express = require("express");
const cors = require("cors");

const boxOfficeRoutes = require("./routes/boxOfficeRoutes");

const app = express();

app.use(cors());

app.use("/api", boxOfficeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}/api`);
});