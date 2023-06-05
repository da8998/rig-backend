import { describe, expect, it, beforeEach } from "@jest/globals";
import axios from "axios";
import * as types from "../types";
import * as mongo from "mongodb";


describe("When a new user registers an account", () => {
    it("Should register the new user", async () => {
        const registerUser = await axios.post("http://localhost:3000/register", null, { params: registerRequest })
        expect(registerUser.status).toBe(200);
    })
});

describe("When a user logins in with correct credentials", () => {
    it("Should log them in", async () => {
        const logUserIn = await axios.post("http://localhost:3000/login", null, { params: loginRequest });
        expect(logUserIn.status).toBe(200);
    })
});

describe("When a user logins in with the wrong credentials", () => {
    it("Should not log them in", async () => {
        const logUserInFail = await axios.post("http://localhost:3000/login", null, { params: badLoginRequest })
        expect(logUserInFail.status).toBe(403);
    })
})

const registerRequest: types.User = {
    _id: new mongo.ObjectId,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe7",
    email_address: "john.doe7@example.com",
    password: "Ilovepizza3"
}

const loginRequest: types.User = {
    _id: new mongo.ObjectId,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe7",
    email_address: "john.doe7@example.com",
    password: "Ilovepizza3"
}

const badLoginRequest: types.User = {
    _id: new mongo.ObjectId,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe9",
    email_address: "john.doe9@example.com",
    password: "Ilovepizza5"
}

