import { Request } from 'express';

export class AuthenticatedUser {
  #id: number;
  #name: string;

  constructor(id, name) {
    this.#id = id;
    this.#name = name;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
