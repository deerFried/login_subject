import * as Entities from "../entities";

import { createPresenter } from "./helper";

import { User } from "../../models";

export const UserShow = createPresenter(
  Entities.User,
  async (user: User) => ({
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
  }),
);
