import { expect } from "chai";
import * as Sinon from "sinon";

import { routes } from "../";

import { createResolver, sandbox } from "../../../__test__/helpers";

import * as Presenters from "../../presenters";

import { AuthService } from "../../../services/auth";
import { UserService } from "../../../services/user";

import { User } from "../../../models";

const resolve = createResolver(routes);

describe("Me Routes", () => {
  describe("#getMyInfo", () => {
    context("when authorization header is invalid", () => {
      beforeEach(() => {
        sandbox.stub(AuthService, "parseToken")
          .callsFake(() => null);
      });

      it("should throw FORBIDDEN 403 error", async () => {
        const res = await resolve("GET", "/me");

        expect(res.statusCode).to.be.eq(403);
        expect(JSON.parse(res.body).error).to.be.deep.eq({
          code: "FORBIDDEN", message: "Forbidden"
        });
      });
    });

    context("when authorization header is valid", () => {
      let user: User;
      let userServiceStub: Sinon.SinonStub;

      beforeEach(() => {
        user = new User();
        user.username = "test-username";
        user.phone = "test-phone";
        user.name = "test-name";
        user.email = "test-email";
        sandbox.stub(AuthService, "parseToken")
          .callsFake(() => ({ id: "test-user-id" }));
        userServiceStub = sandbox.stub(UserService, "get")
          .callsFake(async () => user);
      });

      it("should return UserService.get's return value", async () => {
        const res = await resolve("GET", "/me", {}, {
          authorization: "test-token",
        });

        expect(res.statusCode).to.be.eq(200);
        expect(JSON.parse(res.body)).to.be.deep.eq(
          await Presenters.UserShow.present(user),
        );
        expect(userServiceStub.callCount).to.be.eq(1);
      });
    });
  });
});
