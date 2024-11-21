import { Request, Response, Router } from "express";

import fs from "fs";
import path from "path";

const router: Router = Router();

type TUser = {
  name: string;
  todos: string[];
};

const dataFilePath = path.resolve(__dirname, "../../data.json");

async function initializeDataFile(filepath: string): Promise<void> {
  try {
    await checkFileAccess(filepath);
    console.log(`File ${filepath} is accessible.`);
  } catch (error: unknown) {
    await handleFileAccessError(error, filepath);
  }
}

/* Check if the file exists and is accessible */
async function checkFileAccess(filepath: string): Promise<void> {
  await fs.promises.access(
    filepath,
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
  );
}

/* If the file does not exist, create a new file */
async function handleFileAccessError(
  error: unknown,
  filepath: string
): Promise<void> {
  if ((error as NodeJS.ErrnoException).code === "ENOENT") {
    console.log(`File ${filepath} does not exist. Creating new file.`);
    await createDataFile(filepath);
  } else {
    const errorMessage = `File ${filepath} is not accessible. Error: ${
      (error as Error).message
    }`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function createDataFile(filepath: string): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify([]));
    console.log(`File ${filepath} created with initial data: []`);
  } catch (writeError) {
    const errorMessage = `Failed to create file ${filepath}. Error: ${
      (writeError as Error).message
    }`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function readDataFile(filepath: string = dataFilePath): Promise<TUser[]> {
  try {
    const data = await fs.promises.readFile(filepath, "utf-8");
    return JSON.parse(data);
  } catch (error: unknown) {
    console.error(
      `Failed to read file ${filepath}. Error: ${(error as Error).message}`
    );
    return []; // Return empty array if file read fails
  }
}

async function writeDataFile(
  filepath: string = dataFilePath,
  data: TUser[]
): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`File ${filepath} has been updated successfully.`);
  } catch (error: unknown) {
    console.error(
      `Failed to write to file ${filepath}. Error: ${(error as Error).message}`
    );
    throw error; // Re-throw the error after logging it
  }
}

router.post("/add", async (req: Request, res: Response) => {
  const { name, todo }: { name: string; todo: string } = req.body;
  try {
    const users = await readDataFile(dataFilePath);
    let user: TUser | undefined = users.find((user) => user.name === name);
    if (user) {
      user.todos.push(todo);
    } else {
      user = { name, todos: [todo] };
      users.push(user);
    }
    await writeDataFile(dataFilePath, users);
    res.send(`Todo added successfully for user ${name}.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(`Error: ${error.message}`);
    } else {
      res.status(500).send("Unknown error occurred.");
    }
  }
});

export { router, initializeDataFile, dataFilePath };
