import { expect } from "chai";
import * as Sinon from "sinon";

import { routes } from "../";

import { createResolver, sandbox } from "../../../__test__/helpers";

import * as Presenters from "../../presenters";

import { PhoneAuthenticationService } from "../../../services/phone_authentication";

const resolve = createResolver(routes);

describe("PhoneAuthentication Routes", () => {
  let phoneAuthenticationStub: Sinon.SinonStub;

  describe("#createPhoneAuthentication", () => {
    const mockKey = "test-key";

    beforeEach(() => {
      phoneAuthenticationStub = sandbox.stub(PhoneAuthenticationService, "create")
        .callsFake(async () => mockKey);
    });

    it("should return success true", async () => {
      const res = await resolve("POST", "/phone_authentication", {}, {}, JSON.stringify({
        phone: "01011111111",
      }));

      expect(res.statusCode).to.be.eq(200);
      expect(JSON.parse(res.body)).to.be.deep.eq(
        await Presenters.AuthenticationShow.present(mockKey),
      );
      expect(phoneAuthenticationStub.callCount).to.be.eq(1);
    });
  });

  describe("#verifyPhoneAuthentication", () => {
    beforeEach(() => {
      phoneAuthenticationStub = sandbox.stub(PhoneAuthenticationService, "verify")
        .callsFake(async () => true);
    });

    it("should return success true", async () => {
      const res = await resolve("POST", "/phone_authentication/verify", {}, {}, JSON.stringify({
        phone: "01011111111",
        key: "test-key",
      }));

      expect(res.statusCode).to.be.eq(200);
      expect(JSON.parse(res.body)).to.be.deep.eq(
        await Presenters.SuccessShow.present(true),
      );
      expect(phoneAuthenticationStub.callCount).to.be.eq(1);
    });
  });
});
