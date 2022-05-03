import { expect } from "chai";

import { User } from "../user";

describe(User.name, () => {
  const mockCreateArgs = {
    phone: "test-phone-number",
    username: "test-username",
    name: "test-name",
    email: "test-email",
    password: "test-password",
    passwordSalt: "test-password-salt",
  };

  describe(".create", () => {
    it("should be return model", async () => {
      const model = await User.create(mockCreateArgs);

      expect({
        phone: model.phone,
        username: model.username,
        name: model.name,
        email: model.email,
        password: model.password,
        passwordSalt: model.passwordSalt,
      }).to.be.deep.eq(mockCreateArgs);
    });
  });

  describe(".getByEmail", () => {
    context("when uesr is not exists", () => {
      it("should be return null", async () => {
        const res = await User.getByEmail("wrong-email");

        expect(res).to.be.eq(null);
      });
    });

    context("when uesr is exists", () => {
      let model: User;

      beforeEach(async () => {
        model = await User.create(mockCreateArgs);
      });

      it("should be return model", async () => {
        const res = (await User.getByEmail(model.email))!;

        expect(res.id).to.be.eq(model.id);
      });
    });
  });

  describe(".getByPhone", () => {
    context("when uesr is not exists", () => {
      it("should be return null", async () => {
        const res = await User.getByPhone("wrong-phone");

        expect(res).to.be.eq(null);
      });
    });

    context("when uesr is exists", () => {
      let model: User;

      beforeEach(async () => {
        model = await User.create(mockCreateArgs);
      });

      it("should be return model", async () => {
        const res = (await User.getByPhone(model.phone))!;

        expect(res.id).to.be.eq(model.id);
      });
    });
  });

  describe(".updatePassword", () => {
    let model: User;
    const password = "test-password";
    const passwordSalt = "test-password-salt";

    beforeEach(async () => {
      model = await User.create(mockCreateArgs);
    });

    it("should update user password and passwordSalt", async () => {
      const updatedModel = await model.updatePassword(password, passwordSalt);

      expect(updatedModel.id).to.be.eq(model.id);
      expect(updatedModel.password).to.be.eq(password);
      expect(updatedModel.passwordSalt).to.be.eq(passwordSalt);
    });
  });
});
