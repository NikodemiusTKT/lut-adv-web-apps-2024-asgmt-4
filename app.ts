import express, { Express } from "express";

import morgan from "morgan";
import path from "path";
import { router } from "./src/server";

const app: Express = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", router);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, server };

