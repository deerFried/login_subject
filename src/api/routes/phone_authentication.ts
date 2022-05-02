import { Namespace, Parameter, PresenterRouteFactory } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";

import { PhoneAuthenticationService } from "../../services/phone_authentication";

import * as Presenters from "../presenters";

export const route = new Namespace(
  "/phone_authentication", {}, {
    children: [
      PresenterRouteFactory.POST(
        "", {
          desc: "Create phone authentication",
          operationId: "createPhoneAuthentication",
        }, {
          phone: Parameter.Body(Type.String({ minLength: 10, maxLength: 11 })),
        }, Presenters.SuccessShow, async function() {
          const { phone } = this.params;

          await PhoneAuthenticationService.create(phone);

          return true;
        },
      ),

      PresenterRouteFactory.POST(
        "/verify", {
          desc: "Verify phone authentication",
          operationId: "verifyPhoneAuthentication",
        }, {
          phone: Parameter.Body(Type.String({ minLength: 10, maxLength: 11 })),
          key: Parameter.Body(Type.String()),
        }, Presenters.SuccessShow, async function() {
          const { phone, key } = this.params;

          await PhoneAuthenticationService.verify(phone, key);

          return true;
        },
      ),
    ],
  },
);
