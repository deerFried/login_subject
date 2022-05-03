import * as Entities from "../entities";

import { createPresenter } from "./helper";

export const AuthShow = createPresenter(
  Entities.Auth,
  async (token: string) => ({ token }),
);
