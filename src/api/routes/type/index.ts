import { Type } from "@serverless-seoul/typebox";

export const Phone = Type.String({ minLength: 10, maxLength: 11 });
export const Password = Type.String({ minLength: 10, maxLength: 30 });
export const Email = Type.String({ format: "email" });
