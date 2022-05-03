import { Type } from "@serverless-seoul/typebox";

export const User = Type.Object({
  username: Type.String(),
  name: Type.String(),
  email: Type.String(),
  phone: Type.String(),
});
