import { expect } from "chai";

import { PhoneAuthentication } from "../phone_authentication";

describe(PhoneAuthentication.name, () => {
  const mockCreateArgs = {
    phone: "test-phone-number",
    key: "test-key",
    expiresAt: Date.now(),
  };

  describe(".create", () => {
    it("should be return model", async () => {
      const model = await PhoneAuthentication.create(mockCreateArgs);

      expect({
        phone: model.phone,
        key: model.key,
        expiresAt: model.expiresAt,
        isVerify: model.isVerify,
      }).to.be.deep.eq({
        ...mockCreateArgs,
        isVerify: false,
      });
    });
  });

  describe(".updateToVerify", () => {
    let model: PhoneAuthentication;
    const testExpiresAt = new Date().getTime();

    beforeEach(async () => {
      model = await PhoneAuthentication.create(mockCreateArgs);
    });

    it("should be update isVerify and expiresAt", async () => {
      const updatedModel = await model.updateToVerfiy(testExpiresAt);

      expect(updatedModel.isVerify).to.be.eq(true);
      expect(updatedModel.expiresAt).to.be.eq(testExpiresAt);
    });
  });
});
