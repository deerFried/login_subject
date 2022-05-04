import { StandardError } from "@serverless-seoul/corgi";
import { expect } from "chai";
import * as Sinon from "sinon";
import { PhoneAuthentication, User } from "../../models";

import { sandbox, toJS } from "../../__test__/helpers";
import { AuthService } from "../auth";
import { PhoneAuthenticationService } from "../phone_authentication";

import { UserService } from "../user";

describe(UserService.name, () => {
  describe(".create", () => {
    const mockUserInfo = {
      username: "test-username",
      email: "test-email",
      password: "test-password",
      name: "test-name",
      phone: "test-phone",
    };

    context("when user is exists", () => {
      beforeEach(async () => {
        await User.create({
          ...mockUserInfo,
          passwordSalt: "test-password-salt",
        });
      });

      it("should throw ALREADY_EXISTS 422 error", async () => {
        const [error, ] = await toJS(
          UserService.create(mockUserInfo),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "ALREADY_EXISTS", message: "Duplicate email or phone user is exists",
        });
      });
    });

    context("when authentication is not verified", () => {
      beforeEach(async () => {
        sandbox.stub(PhoneAuthenticationService, "getVerified")
          .callsFake(async () => null);
      });

      it("should throw INVALID_AUTHENTICATION 422 error", async () => {
        const [error, ] = await toJS(
          UserService.create(mockUserInfo),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "INVALID_AUTHENTICATION", message: "Authentication is expired or is not verified",
        });
      });
    });

    context("when everything is ok", () => {
      let authenticationServiceStub: Sinon.SinonStub;

      beforeEach(async () => {
        sandbox.stub(PhoneAuthenticationService, "getVerified")
        .callsFake(async () => new PhoneAuthentication());
        authenticationServiceStub = sandbox.stub(PhoneAuthenticationService, "delete")
          .callsFake(async () => true);
        sandbox.stub(AuthService, "createToken")
          .callsFake(({ id }) => id);
      });

      it("should create model and return token", async () => {
        const res = await UserService.create(mockUserInfo);

        const createdModel = (await User.getByEmail(mockUserInfo.email))!;
        expect(createdModel.id).to.be.eq(res);
        expect(authenticationServiceStub.callCount).to.be.eq(1);
      });
    });
  });

  describe(".login", () => {
    context("when can't find user to use identifier(email or phone)", () => {
      it("should throw INVALID_IDENTIFIER 422 error", async () => {
        const [error, ] = await toJS(
          UserService.login("test-wrong-identifier", "test-password"),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "INVALID_IDENTIFIER", message: "Invalid identifier",
        });
      });
    });

    context("when can find user to use identifier(email or phone)", () => {
      const mockUserInfo = {
        username: "test-username",
        email: "test-email",
        password: "test-password",
        name: "test-name",
        phone: "test-phone",
      };
      const mockPasswordSalt = "test-password-salt";
      let model: User;

      beforeEach(async () => {
        model = await User.create({
          ...mockUserInfo,
          passwordSalt: mockPasswordSalt,
        });
      });

      context("when password is not matched", () => {
        beforeEach(async () => {
          sandbox.stub(UserService as any, "createHashedPassword")
            .callsFake(() => "test-other-password");
        });

        it("should throw INVALID_IDENTIFIER 422 error", async () => {
          const [error, ] = await toJS(
            UserService.login(mockUserInfo.email, mockUserInfo.password),
          );

          expect(error instanceof StandardError).to.be.eq(true);
          const standardError = error as StandardError;
          expect(standardError.statusCode).to.be.eq(422);
          expect(standardError.options).to.be.deep.eq({
            code: "INVALID_IDENTIFIER", message: "Invalid identifier",
          });
        });
      });

      context("when password is matched", () => {
        beforeEach(async () => {
          sandbox.stub(UserService as any, "createHashedPassword")
            .callsFake(() => mockUserInfo.password);
          sandbox.stub(AuthService, "createToken")
            .callsFake(({ id }) => id);
        });

        context("when identifier is email", () => {
          it("should return token", async () => {
            const res = await UserService.login(mockUserInfo.email, mockUserInfo.password);

            expect(res).to.be.eq(model.id);
          });
        });

        context("when identifier is phone", () => {
          it("should return token", async () => {
            const res = await UserService.login(mockUserInfo.phone, mockUserInfo.password);

            expect(res).to.be.eq(model.id);
          });
        });
      });
    });
  });

  describe(".resetPassword", () => {
    const mockPhone = "test-phone";
    const mockNewPassword = "test-new-password";

    context("when authentication is not exists", () => {
      beforeEach(() => {
        sandbox.stub(PhoneAuthenticationService, "getVerified")
          .callsFake(async () => null);
      });

      it("should throw INVALID_AUTHENTICATION 422 error", async () => {
        const [error, ] = await toJS(
          UserService.resetPassword(mockPhone, mockNewPassword),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(422);
        expect(standardError.options).to.be.deep.eq({
          code: "INVALID_AUTHENTICATION", message: "Authentication is expired or is not verified",
        });
      });
    });

    context("when authentication is exists", () => {
      beforeEach(async () => {
        sandbox.stub(PhoneAuthenticationService, "getVerified")
          .callsFake(async () => new PhoneAuthentication());
      });

      context("when user is not exists", () => {
        it("should throw NOT_FOUND 404 error", async () => {
          const [error, ] = await toJS(
            UserService.resetPassword(mockPhone, mockNewPassword),
          );

          expect(error instanceof StandardError).to.be.eq(true);
          const standardError = error as StandardError;
          expect(standardError.statusCode).to.be.eq(404);
          expect(standardError.options).to.be.deep.eq({
            code: "NOT_FOUND", message: "User is not exists",
          });
        });
      });

      context("when user is exists", () => {
        const mockNewPasswordSalt = "test-new-password-salt";
        let authenticationServiceStub: Sinon.SinonStub;

        beforeEach(async () => {
          await User.create({
            username: "test-username",
            email: "test-email",
            password: "test-password",
            name: "test-name",
            phone: mockPhone,
            passwordSalt: "test-password-salt",
          });
          authenticationServiceStub = sandbox.stub(PhoneAuthenticationService, "delete")
            .callsFake(async () => true);
          sandbox.stub(UserService as any, "createHashedPassword")
            .callsFake(() => mockNewPassword);
          sandbox.stub(UserService as any, "createPasswordSalt")
            .callsFake(() => mockNewPasswordSalt);
        });

        it("should be return true and update password, passwordSalt", async () => {
          const res = await UserService.resetPassword(mockPhone, mockNewPassword);

          const model = (await User.getByPhone(mockPhone))!;
          expect(res).to.be.eq(true);
          expect(model.password).to.be.eq(mockNewPassword);
          expect(model.passwordSalt).to.be.eq(mockNewPasswordSalt);
          expect(authenticationServiceStub.callCount).to.be.eq(1);
        });
      });
    });
  });

  describe(".get", () => {
    context("when user is not exists", () => {
      it("should throw NOT_FOUND 404 error", async () => {
        const [error, ] = await toJS(
          UserService.get("test-wrong-id"),
        );

        expect(error instanceof StandardError).to.be.eq(true);
        const standardError = error as StandardError;
        expect(standardError.statusCode).to.be.eq(404);
        expect(standardError.options).to.be.deep.eq({
          code: "NOT_FOUND", message: "User is not exists",
        });
      });
    });

    context("when user is exists", () => {
      let model: User;

      beforeEach(async () => {
        model = await User.create({
          username: "test-username",
          email: "test-email",
          password: "test-password",
          name: "test-name",
          phone: "test-phone",
          passwordSalt: "test-password-salt",
        });
      });

      it("should be return User model", async () => {
        const res = await UserService.get(model.id);

        expect(res.id).to.be.eq(model.id);
      });
    });
  });
});
