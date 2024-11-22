import { dataFilePath, errorHandler, initializeDataFile, router } from "./src";
import express, { Express } from "express";

import morgan from "morgan";
import path from "path";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", router);
app.use(errorHandler);

let server: any;

initializeDataFile(dataFilePath)
  .then(() => {
    console.log("Data file initialized successfully.");
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to initialize data file: ${error.message}`);
    process.exit(1);
  });

export { app, server };
