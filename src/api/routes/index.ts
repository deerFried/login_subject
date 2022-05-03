import { Routes } from "@serverless-seoul/corgi";

import { route as meRoute } from "./me";
import { route as phoneAuthenticationRoute } from "./phone_authentication";
import { route as userRoute } from "./user";

export const routes: Routes = [
  meRoute,
  phoneAuthenticationRoute,
  userRoute,
];
