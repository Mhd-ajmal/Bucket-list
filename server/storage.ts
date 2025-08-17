// User functionality not implemented yet
// import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User functionality not implemented yet
  // getUser(id: string): Promise<User | undefined>;
  // getUserByUsername(username: string): Promise<User | undefined>;
  // createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  // User functionality not implemented yet
  // private users: Map<string, User>;

  constructor() {
    // this.users = new Map();
  }

  // User functionality not implemented yet
  // async getUser(id: string): Promise<User | undefined> {
  //   return this.users.get(id);
  // }

  // async getUserByUsername(username: string): Promise<User | undefined> {
  //   return Array.from(this.users.values()).find(
  //     (user) => user.username === username,
  //   );
  // }

  // async createUser(insertUser: InsertUser): Promise<User> {
  //   const id = randomUUID();
  //   const user: User = { ...insertUser, id };
  //   this.users.set(id, user);
  //   return user;
  // }
}

export const storage = new MemStorage();
