import { StandardError } from "@serverless-seoul/corgi";
import * as casual from "casual";
import { expect } from "chai";
import * as moment from "moment";

import { toJS } from "../../__test__/helpers";

import { PhoneAuthentication } from "../../models";

import { PhoneAuthenticationService } from "../phone_authentication";

describe(PhoneAuthenticationService.name, () => {
  const phone = casual.phone;

  describe(".create", () => {
    it("should be create PhoneAuthentication model", async () => {
      const res = await PhoneAuthenticationService.create(phone);

      const model = await PhoneAuthentication.primaryKey.get(phone);

      expect(model !== null).to.be.eq(true);
      const typeCheckedModel = model!;
      expect(typeCheckedModel.phone).to.be.eq(phone);
      expect(typeCheckedModel.key.length).to.be.eq(6);
      // TODO: Remove after send SMS
      expect(typeCheckedModel.key).to.be.eq(res);
      //
      expect(typeCheckedModel.expiresAt).to.be.lessThan(
        moment().add(3, "minutes").valueOf(),
      );
    });
  });

  describe(".verify", () => {
    const key = "test-key";

    context("when authentication is not exists", () => {
      it("should throw INVALID_AUTHENTICATION 422 error", async () => {
        const [error, ] = await toJS(
          PhoneAuthenticationService.verify(phone, key),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "INVALID_AUTHENTICATION", message: "Not exist authentication",
        });
      });
    });

    context("when authentication is expired", () => {
      beforeEach(async () => {
        await PhoneAuthentication.create({
          phone, key, expiresAt: new Date(1).getTime(),
        });
      });

      it("should throw EXPIRED_AUTHENTICATION 422 error", async () => {
        const [error, ] = await toJS(
          PhoneAuthenticationService.verify(phone, key),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "EXPIRED_AUTHENTICATION", message: "Authentication is expired",
        });
      });
    });

    context("when key is not matched authentication key", () => {
      beforeEach(async () => {
        await PhoneAuthentication.create({
          phone, key, expiresAt: Number.MAX_SAFE_INTEGER,
        });
      });

      it("should throw INVALID_KEY 422 error", async () => {
        const wrongKey = "wrong-test-key";
        const [error, ] = await toJS(
          PhoneAuthenticationService.verify(phone, wrongKey),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "INVALID_KEY", message: "Key is invalid",
        });
      });
    });

    context("when everything is ok", () => {
      beforeEach(async () => {
        await PhoneAuthentication.create({
          phone, key, expiresAt: Number.MAX_SAFE_INTEGER,
        });
      });

      it("should be update isVerify and expiresAt", async () => {
        const res = await PhoneAuthenticationService.verify(phone, key);
        const model = await PhoneAuthentication.primaryKey.get(phone);

        expect(res).to.be.eq(true);
        expect(model !== null).to.be.eq(true);
        const typeCheckedModel = model!;
        expect(typeCheckedModel.isVerify).to.be.eq(true);
        expect(typeCheckedModel.expiresAt).to.be.lessThan(
          moment().add(5, "minutes").valueOf(),
        );
      });
    });
  });

  describe(".getVerified", () => {
    const key = "test-key";

    context("when authentication is not exists", () => {
      it("should return null", async () => {
        const res = await PhoneAuthenticationService.getVerified(phone);

        expect(res).to.be.eq(null);
      });
    });

    context("when authentication is exists", () => {
      let model: PhoneAuthentication;

      context("when authentication is expired", () => {
        beforeEach(async () => {
          model = await PhoneAuthentication.create({
            phone, key, expiresAt: new Date(1).getTime(),
          });
        });

        it("should return null", async () => {
          const res = await PhoneAuthenticationService.getVerified(phone);

          expect(res).to.be.eq(null);
        });
      });

      context("when authentication is not verify", () => {
        beforeEach(async () => {
          model = await PhoneAuthentication.create({
            phone, key, expiresAt: Number.MAX_SAFE_INTEGER,
          });
        });

        it("should return null", async () => {
          const res = await PhoneAuthenticationService.getVerified(phone);

          expect(res).to.be.eq(null);
        });
      });

      context("when authentication is verify and is not expired", () => {
        beforeEach(async () => {
          model = await PhoneAuthentication.create({
            phone, key, expiresAt: Number.MAX_SAFE_INTEGER,
          });
          model.isVerify = true;
          await model.save();
        });

        it("should return true", async () => {
          const res = await PhoneAuthenticationService.getVerified(phone);

          expect(res !== null).to.be.eq(true);
          const typedRes = res!;
          expect(typedRes.phone).to.be.eq(model.phone);
        });
      });
    });
  });

  describe(".delete", () => {
    let testModel: PhoneAuthentication;

    beforeEach(async () => {
      testModel = await PhoneAuthentication.create({
        phone: "test-phone", key: "test-key", expiresAt: 1,
      });
    });

    it("should be delete authentication model", async () => {
      await PhoneAuthenticationService.delete(testModel);

      const model = await PhoneAuthentication.primaryKey.get(testModel.phone);
      expect(model).to.be.eq(null);
    });
  });
});
