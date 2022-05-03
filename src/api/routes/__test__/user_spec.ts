import * as casual from "casual";
import { expect } from "chai";
import * as Sinon from "sinon";

import { routes } from "../";

import { createResolver, sandbox } from "../../../__test__/helpers";

import * as Presenters from "../../presenters";

import { UserService } from "../../../services/user";

const resolve = createResolver(routes);

describe("User Routes", () => {
  let userServiceStub: Sinon.SinonStub;

  describe("#createUser", () => {
    const mockToken = "test-token";

    beforeEach(() => {
      userServiceStub = sandbox.stub(UserService, "create")
        .callsFake(async () => mockToken);
    });

    it("should return success true", async () => {
      const res = await resolve("POST", "/users", {}, {}, JSON.stringify({
        userInfo: {
          username: "test-user",
          email: casual.email,
          password: "1234567890",
          name: "test-name",
          phone: "01012345678",
        }
      }));

      expect(res.statusCode).to.be.eq(200);
      expect(JSON.parse(res.body)).to.be.deep.eq(
        await Presenters.AuthShow.present(mockToken),
      );
      expect(userServiceStub.callCount).to.be.eq(1);
    });
  });

  describe("#loginUser", () => {
    const mockToken = "test-token";

    beforeEach(() => {
      userServiceStub = sandbox.stub(UserService, "login")
        .callsFake(async () => mockToken);
    });

    it("should return success true", async () => {
      const res = await resolve("POST", "/users/login", {}, {}, JSON.stringify({
        identifier: casual.email,
        password: "1234567890",
      }));

      expect(res.statusCode).to.be.eq(200);
      expect(JSON.parse(res.body)).to.be.deep.eq(
        await Presenters.AuthShow.present(mockToken),
      );
      expect(userServiceStub.callCount).to.be.eq(1);
    });
  });

  describe("#resetPassword", () => {
    beforeEach(() => {
      userServiceStub = sandbox.stub(UserService, "resetPassword")
        .callsFake(async () => true);
    });

    it("should return success true", async () => {
      const res = await resolve("POST", "/users/reset_password", {}, {}, JSON.stringify({
        phone: "01012345678",
        password: "1234567890",
      }));

      expect(res.statusCode).to.be.eq(200);
      expect(JSON.parse(res.body)).to.be.deep.eq(
        await Presenters.SuccessShow.present(true),
      );
      expect(userServiceStub.callCount).to.be.eq(1);
    });
  });
});
