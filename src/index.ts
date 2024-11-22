import { NextFunction, Request, Response, Router } from "express";

import fs from "fs";
import path from "path";

const router: Router = Router();

type TUser = {
  name: string;
  todos: string[];
};

const dataFilePath = path.resolve(__dirname, "../../data.json");

class UserNotFoundError extends Error {
  constructor(message: string = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
class WriteDataFileError extends Error {
  constructor(message: string = "Failed to write data file.") {
    super(message);
    this.name = "WriteDataFileError";
  }
}
function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(error);

  if (error instanceof UserNotFoundError) {
    res.status(404).send(error.message);
  } else if (error instanceof BadRequestError) {
    res.status(400).send(error.message);
  } else if (error instanceof WriteDataFileError) {
    res.status(500).send(error.message);
  } else if (error instanceof Error) {
    res.status(500).send(error.message);
  } else {
    res.status(500).send("Unknown error occurred.");
  }
}
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, res: Response, next: NextFunction): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

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
    throw new Error("Failed to access data file.");
  }
}

async function createDataFile(filepath: string): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify([]));
    console.log(`File ${filepath} created with initial data: []`);
  } catch (error: unknown) {
    throw new Error("Failed to create data file.");
  }
}

async function readDataFile(filepath: string = dataFilePath): Promise<TUser[]> {
  try {
    const data = await fs.promises.readFile(filepath, "utf-8");
    return JSON.parse(data);
  } catch (error: unknown) {
    throw new Error("Failed to read data file.");
  }
}

async function writeDataFile(
  filepath: string = dataFilePath,
  data: TUser[]
): Promise<void> {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify(data));
    console.log(`File ${filepath} has been updated successfully.`);
  } catch (error: unknown) {
    throw new WriteDataFileError();
  }
}

router.post(
  "/add",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, todo }: { name: string; todo: string } = req.body;
    const decodedName = decodeURIComponent(name);
    const decodedTodo = decodeURIComponent(todo);
    const users = await readDataFile(dataFilePath);
    let user: TUser | undefined = users.find(
      (user) => user.name === decodedName
    );
    if (user) {
      user.todos.push(decodedTodo);
    } else {
      user = { name: decodedName, todos: [decodedTodo] };
      users.push(user);
    }
    await writeDataFile(dataFilePath, users);
    res.send(`Todo added successfully for user ${name}.`);
  })
);

router.get(
  "/todos/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const users = await readDataFile(dataFilePath);
    const user = users.find((user) => user.name === id);
    if (user) {
      res.json(user.todos);
    } else {
      throw new UserNotFoundError();
    }
  })
);

router.delete(
  "/delete",
  asyncHandler(async (req: Request, res: Response) => {
    const { name }: { name: string } = req.body;
    if (!name) {
      throw new BadRequestError("Name is required.");
    }
    const decodedName = decodeURIComponent(name);
    let users = await readDataFile(dataFilePath);
    const userIndex = users.findIndex((user) => user.name === decodedName);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      await writeDataFile(dataFilePath, users);
      res.send("User deleted successfully.");
    } else {
      throw new UserNotFoundError();
    }
  })
);

router.put(
  "/update",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, todo }: { name: string; todo: string } = req.body;
    const decodedName = decodeURIComponent(name);
    const decodedTodo = decodeURIComponent(todo);
    const users = await readDataFile(dataFilePath);
    const user = users.find((user) => user.name === decodedName);
    if (user) {
      const todoIndex = user.todos.indexOf(decodedTodo);
      if (todoIndex !== -1) {
        user.todos.splice(todoIndex, 1);
        await writeDataFile(dataFilePath, users);
        res.send("Todo deleted successfully.");
      } else {
        throw new BadRequestError("Todo not found.");
      }
    } else {
      throw new UserNotFoundError();
    }
  })
);
export { router, initializeDataFile, dataFilePath, errorHandler };
