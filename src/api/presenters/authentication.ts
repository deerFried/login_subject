import * as Entities from "../entities";

import { createPresenter } from "./helper";

export const AuthenticationShow = createPresenter(
  Entities.Authentication,
  async (key: string) => ({ key }),
);
