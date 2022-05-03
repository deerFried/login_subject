import { Namespace, Parameter, PresenterRouteFactory } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";
import { UserService } from "../../services/user";

import * as Presenters from "../presenters";

import { Email, Password, Phone } from "./type";

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
            email: Email,
            password: Password,
            name: Type.String(),
            phone: Phone,
          })),
        }, Presenters.AuthShow, async function() {
          const { userInfo } = this.params;

          return await UserService.create(userInfo);
        }),

      PresenterRouteFactory.POST(
        "/login", {
          desc: "Login user",
          operationId: "loginUser",
        }, {
          identifier: Parameter.Body(Type.Union([
            Email, Phone,
          ])),
          password: Parameter.Body(Password),
        }, Presenters.AuthShow, async function() {
          const { identifier, password } = this.params;

          return await UserService.login(identifier, password);
        }),

      PresenterRouteFactory.POST(
        "/reset_password", {
          desc: "Reset password",
          operationId: "resetUserPassword",
        }, {
          phone: Parameter.Body(Phone),
          password: Parameter.Body(Password),
        }, Presenters.SuccessShow, async function() {
          const { phone, password } = this.params;

          await UserService.resetPassword(phone, password);

          return true;
        }),
    ],
  },
);
