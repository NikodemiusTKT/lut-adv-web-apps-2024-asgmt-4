import { TUser, users } from "../src/server";
import { app, server } from "../app";
import express, { Request, Response } from "express";

import request from "supertest";

afterAll((done) => {
  server.close(() => {
    console.log("Server closed.");
    done();
  });
});

describe("POST /add", () => {
  beforeEach(() => {
    // Clear the users array before each test
    users.length = 0;
  });

  it("should add a new todo for a new user", async () => {
    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Eat" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Todo added successfully for user Jukka.");
    expect(users).toEqual([{ name: "Jukka", todos: ["Eat"] }]);
  });

  it("should add a new todo for an existing user", async () => {
    users.push({ name: "Jukka", todos: ["Eat"] });

    const response = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Todo added successfully for user Jukka.");
    expect(users).toEqual([{ name: "Jukka", todos: ["Eat", "Sleep"] }]);
  });

  it("should handle multiple users", async () => {
    users.push({ name: "Jukka", todos: ["Eat"] });

    const response1 = await request(app)
      .post("/add")
      .send({ name: "Jukka", todo: "Sleep" });

    const response2 = await request(app)
      .post("/add")
      .send({ name: "Matti", todo: "Work" });

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
