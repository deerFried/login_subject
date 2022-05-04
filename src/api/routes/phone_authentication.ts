import { Namespace, Parameter, PresenterRouteFactory } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";

import { PhoneAuthenticationService } from "../../services/phone_authentication";

import * as Presenters from "../presenters";

import { Phone } from "./type";

export const route = new Namespace(
  "/phone_authentication", {}, {
    children: [
      PresenterRouteFactory.POST(
        "", {
          desc: "Create phone authentication",
          operationId: "createPhoneAuthentication",
        }, {
          phone: Parameter.Body(Phone),
        }, Presenters.AuthenticationShow, async function() {
          const { phone } = this.params;

          return await PhoneAuthenticationService.create(phone);
        }),

      PresenterRouteFactory.POST(
        "/verify", {
          desc: "Verify phone authentication",
          operationId: "verifyPhoneAuthentication",
        }, {
          phone: Parameter.Body(Phone),
          key: Parameter.Body(Type.String()),
        }, Presenters.SuccessShow, async function() {
          const { phone, key } = this.params;

          await PhoneAuthenticationService.verify(phone, key);

          return true;
        }),
    ],
  },
);
