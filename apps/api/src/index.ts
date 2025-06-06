import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
