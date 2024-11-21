import { dataFilePath, initializeDataFile, router } from "./src/server";
import express, { Express } from "express";

import morgan from "morgan";
import path from "path";

const app: Express = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", router);

let server: any;

initializeDataFile(dataFilePath)
  .then(() => {
    console.log("Data file initialized successfully.");
    server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to initialize data file: ${error.message}`);
    process.exit(1);
  });

export { app, server };
