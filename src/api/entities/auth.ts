import { Type } from "@serverless-seoul/typebox";

export const Auth = Type.Object({
  token: Type.String(),
});
