const request = require("supertest");
const mongoose = require("mongoose");
const { app, server, main } = require('../index');

describe("User Creation", () => {
  // Connect to MongoDB memory server before running any tests
  beforeAll(async () => {
    // URI used only for testing purposes
    await mongoose.connect(
      "mongodb+srv://admin:admin@qb3cluster.sknm95g.mongodb.net/mongoTodoapp?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  // Close MongoDB connection after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log("database disconnected");
  });

  it("should start", async () => {
    const response = await request(app).get("/");

    expect(response.body).toBeDefined();
  });

  it("should create a new user with correct input", async () => {
    console.warn("userCreation 1 start");
    const userData = {
      username: "test",
      password: "test", // Ensure password field is included
    };
    console.log(userData);

    const response = await request(app)
      .post("/create-account")
      .send(`username=${userData.username}&password=${userData.password}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User created successfully");
  });

  it("should return error if user already exists", async () => {
    console.warn("userCreation 2 start");
    const existingUser = {
      username: "test",
      password: "test", // Ensure password field is included
    };

    const response = await request(app)
      .post("/create-account")
      .send(
        `username=${existingUser.username}&password=${existingUser.password}`
      )
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Username already exists");
  });
});

describe("Login", () => {
  // Connect to MongoDB memory server before running any tests
  beforeAll(async () => {
    // URI used only for testing purposes
    await mongoose.connect(
      "mongodb+srv://admin:admin@qb3cluster.sknm95g.mongodb.net/mongoTodoapp?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  // Close MongoDB connection after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log("database disconnected");
  });

  it("should start", async () => {
    const response = await request(app).get("/");

    expect(response.body).toBeDefined();
  });

  it("should allow users to login when given correct credentials", async () => {
    const userData = {
      username: "test",
      password: "test", // Ensure password field is included
    };

    // Create an account to log in to
    await request(app)
      .post("/create-account")
      .send(`username=${userData.username}&password=${userData.password}`)
      .expect(200);

    const response = await request(app)
      .post("/login")
      .send(`username=${userData.username}&password=${userData.password}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it("should not allow users to log in with incorrect user information", async () => {
    const userData = {
      username: "incorrectUserInformation",
      password: "test", // Ensure password field is included
    };

    const response = await request(app)
      .post("/login")
      .send(`username=${userData.username}&password=${userData.password}`)
      .expect(200)

    expect(response.body.success).toBe(false);
  });
});

describe('Session Variables', () => {
  // Connect to MongoDB memory server before running any tests
  beforeAll(async () => {
    // URI used only for testing purposes
    await mongoose.connect(
      "mongodb+srv://admin:admin@qb3cluster.sknm95g.mongodb.net/mongoTodoapp?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  // Close MongoDB connection after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log("database disconnected");
  });

  it('should be able to log in and create / view posts', async () => {
    let cookies;
    await request(app)
      .post("/create-account")
      .send(`username=test&password=test`)
      .expect(200);
    await request(app)
      .post('/login')
      .send({ username: 'test', password: 'test' })
      .expect(200)
      .then(res => {
        cookies = res.headers['set-cookie'];
      });
    await request(app)
      .post('/')
      .set('Cookie', cookies)
      .send({ title: 'Test Post', isRecurring: false })
      .expect(302);

    const response = await request(app)
      .get('/')
      .set('Cookie', cookies)
      .expect(200);

    expect(response.text).toContain('Test Post');
  });

  it('should not display posts from other users', async () => {
    let cookies;
    await request(app)
      .post("/create-account")
      .send(`username=test2&password=test2`)
      .expect(200);
    await request(app)
      .post('/login')
      .send({ username: 'test2', password: 'test2' })
      .expect(200)
      .then(res => {
        cookies = res.headers['set-cookie'];
      });
    await request(app)
      .post('/')
      .set('Cookie', cookies)
      .send({ title: 'Another Post', isRecurring: false })
      .expect(302);

    const response = await request(app)
      .get('/')
      .set('Cookie', cookies)
      .expect(200);

    expect(response.text).toContain('Another Post');
    expect(response.text).not.toContain('Test Post');
  });
});