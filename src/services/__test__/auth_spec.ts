import { expect } from "chai";
import * as JWT from "jsonwebtoken";

import { sandbox } from "../../__test__/helpers";

import { AuthService } from "../auth";

describe(AuthService.name, () => {
  describe(".createToken", () => {
    const mockToken = "test-token";

    beforeEach(() => {
      sandbox.stub(JWT, "sign")
        .callsFake(() => {
          return mockToken;
        });
    });

    it("should call JWT sign function", () => {
      const res = AuthService.createToken({ id: "test-id" });

      expect(res).to.be.eq(mockToken);
    });
  });

  describe(".parseToken", () => {
    context("when token is invalid", () => {
      it("should be return null", () => {
        const res = AuthService.parseToken("wrong-token");

        expect(res).to.be.eq(null);
      });
    });

    context("when JWT verify function throw error", () => {
      beforeEach(() => {
        sandbox.stub(JWT, "verify")
          .callsFake(() => {
            throw new Error("Unknown");
          });
      });

      it("should be return null", () => {
        const res = AuthService.parseToken("wrong-token");

        expect(res).to.be.eq(null);
      });
    });

    context("when everything is ok", () => {
      let token: string;
      const testId = "test-id";

      beforeEach(() => {
        token = AuthService.createToken({ id: testId });
      });

      it("should be return null", () => {
        const res = AuthService.parseToken(token)!;

        expect(res.id).to.be.eq(testId);
      });
    });
  });
});
