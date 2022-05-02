import * as Entities from "../entities";

import { createPresenter } from "./helper";

export const SuccessShow = createPresenter(
  Entities.Success,
  async (success: boolean) => ({ success }),
);
