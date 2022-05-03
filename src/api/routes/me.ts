import { Namespace, PresenterRouteFactory, StandardError } from "@serverless-seoul/corgi";
import { AuthService } from "../../services/auth";
import { UserService } from "../../services/user";

import * as Presenters from "../presenters";

export const route = new Namespace(
  "/me", {}, {
    // TODO: Separate to middleware when add more APIs
    async before() {
      const authorization = this.headers.authorization;
      const user = AuthService.parseToken(authorization);

      if (!user) {
        throw new StandardError(403, {
          code: "FORBIDDEN", message: "Forbidden"
        });
      }

      this.params.currentUserId = user.id;
    },
    children: [
      PresenterRouteFactory.GET(
        "", {
          desc: "Get my information",
          operationId: "getMyInfo",
        }, {}, Presenters.UserShow, async function() {
          const currentUserId = this.params.currentUserId as string;

          return await UserService.get(currentUserId);
        }),
    ],
  },
);
