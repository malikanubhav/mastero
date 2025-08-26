import request from "supertest";
import app from "../src/app.js";

describe("Auth", () => {
    it("registers a user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "T", email: `t${Date.now()}@e.com`, password: "pass123" });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
    });

    it("rejects bad login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "no@user.com", password: "x" });
        expect(res.status).toBe(401);
    });
});
