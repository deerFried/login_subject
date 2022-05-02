import { Namespace, Parameter, PresenterRouteFactory } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";

import * as Presenters from "../presenters";

export const route = new Namespace(
  "/users", {}, {
    children: [
      PresenterRouteFactory.POST(
        "", {
          desc: "Create user",
          operationId: "createUser",
        }, {
          userInfo: Parameter.Body(Type.Object({
            username: Type.String(),
            email: Type.String({ format: "email" }),
            password: Type.String(),
            name: Type.String(),
            phone: Type.String({ minLength: 10, maxLength: 11 }),
          })),
        }, Presenters.SuccessShow, async () => {
          // console.log(userInfo);

          return true;
        },
      ),
    ],
  },
);
