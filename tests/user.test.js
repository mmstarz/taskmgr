const request = require("supertest");
const app = require("../src/preloadSetup");
const User = require("../models/user");

const {
  preloadDatabaseSetup,
  userOne,
  userOneId
} = require("./fixtures/dbPreload");

// jests global lifecycle methods beforeEach(() => {...}) and afterEach(() => {...})
beforeEach(preloadDatabaseSetup);

// afterEach(() => {
//   console.log("after each test ends");
// });

test("should sign up new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "userThree",
      email: "user@three.com",
      password: "userThreePass"
    })
    .expect(201);

  // assert that db was changed correctly
  const user = await User.findById(response.body.user._id);
  // https://jestjs.io/docs/en/expect#not
  expect(user).not.toBeNull();

  // assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "userThree",
      email: "user@three.com"
    },
    token: user.tokens[0].token
  });

  // assertion about password stored correctly
  expect(user.password).not.toBe("userThreePass");
});

test("Should not signup user with invalid name/email/password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "",
      email: "user@four.com",
      password: "something111!"
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "userFour",
      email: "userfour.com",
      password: "something111!"
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "userFour",
      email: "user@four.com",
      password: "PassworD"
    })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app)
    .patch("/users/profile")
    .send({
      exp: 2
    })
    .expect(401);
});

test("Should not delete user if unAuth", async () => {
  await request(app)
    .delete("/users/profile")
    .send()
    .expect(401);
});

test("Should not update user with invalid name/email/password", async () => {
  await request(app)
    .patch("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: ""
    })
    .expect(400);

  await request(app)
    .patch("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      email: "user.com"
    })
    .expect(400);

  await request(app)
    .patch("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      password: "password"
    })
    .expect(400);
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.tokens[1].token).toBe(response.body.token);
});

test("should not login unexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "unexistingUserPass"
    })
    .expect(400);
});

test("should get user profile", async () => {
  await request(app)
    .get("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not get profile for not authenticated user", async () => {
  await request(app)
    .get("/users/profile")
    .send()
    .expect(401);
});

test("should not delete account for unauthenticated user", async () => {
  await request(app)
    .delete("/users/profile")
    .send()
    .expect(401);
});

test("should delete account for user", async () => {
  const res = await request(app)
    .delete("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("should upload avatar image", async () => {
  // .attach() - method that allows to specify
  // files variable in the header
  // takes 2 arguments
  // 1 - form filed name, 2 - path to the file
  await request(app)
    .post("/users/profile/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/anon2.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  // .toBe() uses === operator. and {} === {} gonna fail
  // to compare objects in JEST need to use .toEqual()
  // expect.any() - type constructor String, Number, Buffer...
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should change valid field for auth user", async () => {
  await request(app)
    .patch("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "updatedName"
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe("updatedName");
});

test("should not change invalid field for auth user", async () => {
  await request(app)
    .patch("/users/profile")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "some location"
    })
    .expect(400);
});
