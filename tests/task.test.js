const request = require("supertest");
const app = require("../src/preloadSetup");
const Task = require("../models/task");

const {
  preloadDatabaseSetup,
  userOne,
  userOneId,
  taskOne,
  userTwo  
} = require("./fixtures/dbPreload");

// jests global lifecycle methods beforeEach(() => {...}) and afterEach(() => {...})
beforeEach(preloadDatabaseSetup);

test("should create task for auth user", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "third task for user one"
    })
    .expect(201);

  const tasks = await Task.find({ author: userOneId })
    .populate("author")
    .exec();

  expect(tasks).toHaveLength(3);

  // console.log(tasks[0]);
  // {_id: ObjectId, completed: fasle, description: "...", author: {...}}
  expect(tasks[2].description).toBe("third task for user one");
  expect(tasks[2].completed).toBeFalsy();
});

test("should get all tasks for auth user", async () => {
  const res = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // console.log(res.body); // [{...}, ...]
  expect(res.body).toHaveLength(2);
});

test("should fail to delete task when owner is another user", async () => {
  // ...
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: ""
    })
    .expect(400);

  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "description from test",
      completed: 12 * 10
    })
    .expect(400);
});

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: ""
    })
    .expect(400);

  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: 12 * 10
    })
    .expect(400);
});

test("Should delete user task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not delete task if unauthenticated", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
});

test("Should not update other users task", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      completed: true
    })
    .expect(404);
});

test("Should fetch user task by id", async () => {
  const res = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body).not.toBeNull();
});

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401);
});

test("Should not fetch other users task by id", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test("Should fetch only completed tasks", async () => {
  const res = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body).toHaveLength(1);
});

test("Should fetch only incompleted tasks", async () => {
  const res = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body).toHaveLength(1);
});

test("Should sort tasks by description/completed/createdAt/updatedAt", async () => {
  const res1 = await request(app)
    .get("/tasks?sortBy=description:asc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res1.body).toHaveLength(2);

  const res2 = await request(app)
    .get("/tasks?sortBy=completed:asc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res2.body).toHaveLength(2);

  const res3 = await request(app)
    .get("/tasks?sortBy=createdAt:desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res3.body).toHaveLength(2);

  const res4 = await request(app)
    .get("/tasks?sortBy=updatedAt:desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res4.body).toHaveLength(2);
});

test("Should fetch page of tasks", async () => {
  const res = await request(app)
    .get("/tasks?limit=2&skip=1")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  
  expect(res.body).toHaveLength(1);
});
