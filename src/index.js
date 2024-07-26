import express, { urlencoded } from "express";
import cors from "cors";
import router from "./routes/landyard.route.js";
import { PORT } from "./config/constants.js";
import { config } from "dotenv";
const app = express();
config();
app.use(cors({ origin: "*", withCredentials: true }));

app.use(express.json({ limit: "20mb" }));
app.use(urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/v1/landyard", router);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Testing successful" });
});

app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
