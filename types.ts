import * as mongo from "mongodb";

export type Request = User;

export interface User {
    _id: mongo.ObjectId;
    first_name: string;
    last_name: string;
    username: string;
    email_address: string;
    password: string;
}