import server from "./appInit";
import supertest from "supertest";
import setupTestDB from "./utils/connectToTestDb";
import { Connection } from "typeorm";
import UserService from "../domains/users/user.service";
import EventService from "../domains/events/event.service";
import authorizeAsRole from "./utils/authorizeAsRole";
import { ERole } from "../domains/roles/dto";

describe("test event route", function () {
  const request = supertest(server);

  let connection: Connection;
  let user_ids: number[];
  let event_ids: number[];

  beforeAll(async () => {
    connection = await setupTestDB();
    user_ids = await UserService.seedUsers();
    event_ids = await EventService.seedEvents(user_ids);
  });

  test("unathorized user can't create events", async () => {
    const response = await request.post("/api/events").send({
      owner_id: user_ids[0],
      body: { name: "mainEvent", description: "very interesting" },
    });
    expect(response.statusCode).toBe(401);
  });

  test('users with "CREATE_EVENT" permission can create events', async () => {
    const { token } = await authorizeAsRole(request, ERole.ADMIN);
    const response = await request
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        owner_id: user_ids[2],
        body: { name: "mainEvent", description: "very interesting" },
      });
    expect(response.statusCode).toBe(200);
  });

  test('users with no "CREATE_EVENT" permission can\'t create events', async () => {
    const { token } = await authorizeAsRole(request, ERole.USER);
    const response = await request
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        owner_id: user_ids[2],
        body: { name: "mainEvent", description: "very interesting" },
      });
    expect(response.statusCode).toBe(403);
  });

  test("every user can search for events", async () => {
    const response = await request.post("/api/events/search").send({
      query: "fourth",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("authorized users can modify only own events", async () => {
    const { token } = await authorizeAsRole(request, ERole.EDITOR);

    const changeOwnEvent = await request
      .put("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: event_ids[1],
        body: { name: "changedName" },
      });

    expect(changeOwnEvent.statusCode).toBe(200);

    const changeOtherEvent = await request
      .put("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: event_ids[0],
        body: { name: "changedName" },
      });

    expect(changeOtherEvent.statusCode).toBe(403);
  });

  afterAll(async () => {
    await EventService.clearEvents();
    await UserService.clearUsers();
    await connection.close();
  });
});