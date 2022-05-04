import { StandardError } from "@serverless-seoul/corgi";
import * as moment from "moment";

import { PhoneAuthentication } from "../models";

export class PhoneAuthenticationService {
  public static async create(phone: string) {
    const expiresAt = moment().add(3, "minutes").valueOf();
    const authentication = await PhoneAuthentication.create({
      phone, key: this.generateKey(), expiresAt,
    });
    // TODO: Send SMS to use external service

    // TODO: Return true
    return authentication.key;
  }

  public static async verify(phone: string, key: string) {
    const authentication = await PhoneAuthentication.primaryKey.get(phone);

    if (!authentication) {
      throw new StandardError(422, {
        code: "INVALID_AUTHENTICATION", message: "Not exist authentication",
      });
    }

    if (this.isExpired(authentication)) {
      throw new StandardError(422, {
        code: "EXPIRED_AUTHENTICATION", message: "Authentication is expired",
      });
    }

    if (authentication.key !== key) {
      throw new StandardError(422, {
        code: "INVALID_KEY", message: "Key is invalid",
      });
    }

    const expiresAt = moment().add(5, "minutes").valueOf();
    await authentication.updateToVerfiy(expiresAt);

    return true;
  }

  public static async getVerified(phone: string) {
    const authentication = await PhoneAuthentication.primaryKey.get(phone);

    if (!authentication || !this.isVerify(authentication)) {
      return null;
    }

    return authentication;
  }

  public static async delete(authentication: PhoneAuthentication) {
    await authentication.delete();

    return true;
  }

  private static isVerify(authentication: PhoneAuthentication) {
    return !this.isExpired(authentication) && authentication.isVerify;
  }

  private static isExpired(authentication: PhoneAuthentication) {
    return authentication.expiresAt <= Date.now();
  }

  private static generateKey() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
