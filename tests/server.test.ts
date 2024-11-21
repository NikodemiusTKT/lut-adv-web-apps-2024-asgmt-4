import { app, server } from "../app";
import { dataFilePath, initializeDataFile } from "../src/server";
import express, { Request, Response } from "express";

import fs from "fs";
import path from "path";
import request from "supertest";

afterAll((done) => {
  server.close(() => {
    console.log("Server closed.");
    done();
  });
});

describe("POST /add", () => {
  beforeEach(async () => {
    // Clear the data file before each test
    await fs.promises.writeFile(dataFilePath, JSON.stringify([]));
  });

  it("should add a new todo for a new user", async () => {
    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Eat" });

    const users = JSON.parse(await fs.promises.readFile(dataFilePath, "utf-8"));
    expect(response.status).toBe(200);
    expect(response.text).toBe("Todo added successfully for user Jukka.");
    expect(users).toEqual([{ name: "Jukka", todos: ["Eat"] }]);
  });

  it("should add a new todo for an existing user", async () => {
    const initialUsers = [{ name: "Jukka", todos: ["Eat"] }];
    await fs.promises.writeFile(dataFilePath, JSON.stringify(initialUsers));

    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    const users = JSON.parse(await fs.promises.readFile(dataFilePath, "utf-8"));
    expect(response.status).toBe(200);
    expect(response.text).toBe("Todo added successfully for user Jukka.");
    expect(users).toEqual([{ name: "Jukka", todos: ["Eat", "Sleep"] }]);
  });

  it("should handle multiple users", async () => {
    const initialUsers = [{ name: "Jukka", todos: ["Eat"] }];
    await fs.promises.writeFile(dataFilePath, JSON.stringify(initialUsers));

    const response1 = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    const response2 = await request(app)
      .post("/add")
      .send({ name: "Matti", todo: "Work" });

    const users = JSON.parse(await fs.promises.readFile(dataFilePath, "utf-8"));
    expect(response1.status).toBe(200);
    expect(response1.text).toBe("Todo added successfully for user Jukka.");
    expect(response2.status).toBe(200);
    expect(response2.text).toBe("Todo added successfully for user Matti.");
    expect(users).toEqual([
      { name: "Jukka", todos: ["Eat", "Sleep"] },
      { name: "Matti", todos: ["Work"] },
    ]);
  });
});

describe("initializeDataFile", () => {
  const testFilePath = path.resolve(__dirname, "../../test_data.json");

  beforeEach(async () => {
    // Remove the test data file if it exists
    try {
      await fs.promises.unlink(testFilePath);
    } catch (error) {
      // Ignore error if file does not exist
    }
  });

  it("should create a new data file if it does not exist", async () => {
    await initializeDataFile(testFilePath);
    const fileExists = await fs.promises
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    const data = await fs.promises.readFile(testFilePath, "utf-8");
    expect(data).toBe(JSON.stringify([]));
  });

  it("should not overwrite an existing data file", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat"] }];
    await fs.promises.writeFile(testFilePath, JSON.stringify(initialData));

    await initializeDataFile(testFilePath);

    const data = await fs.promises.readFile(testFilePath, "utf-8");
    expect(data).toBe(JSON.stringify(initialData));
  });

  it("should throw an error if there is an issue accessing the file", async () => {
    const invalidFilePath = "/invalid/path/to/data.json";
    await expect(initializeDataFile(invalidFilePath)).rejects.toThrow();
  });
});
describe("GET /todos/:name", () => {
  beforeEach(async () => {
    // Clear the data file before each test
    await fs.promises.writeFile(dataFilePath, JSON.stringify([]));
  });

  it("should return the todos for an existing user", async () => {
    const initialData = [{ name: "Jukka", todos: ["Eat", "Sleep"] }];
    await fs.promises.writeFile(dataFilePath, JSON.stringify(initialData));

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(["Eat", "Sleep"]);
  });

  it("should return 404 if the user is not found", async () => {
    const response = await request(app).get("/todos/NonExistentUser");

    expect(response.status).toBe(404);
    expect(response.text).toBe("User not found");
  });

  it("should return 500 if there is an error reading the data file", async () => {
    jest
      .spyOn(fs.promises, "readFile")
      .mockRejectedValueOnce(new Error("Read error"));

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error: Failed to read data file.");
  });

  it("should return 500 if there is an unknown error", async () => {
    jest.spyOn(fs.promises, "readFile").mockRejectedValueOnce("Unknown error");

    const response = await request(app).get("/todos/Jukka");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error: Failed to read data file.");
  });
});
