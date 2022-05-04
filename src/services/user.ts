import { StandardError } from "@serverless-seoul/corgi";
import * as crypto from "crypto";
import { User } from "../models";
import { AuthService } from "./auth";
import { PhoneAuthenticationService } from "./phone_authentication";

export class UserService {
  public static async create(userInfo: {
    username: string;
    email: string;
    password: string;
    name: string;
    phone: string;
  }) {
    const { username, email, password, name, phone } = userInfo;

    const existUser = await User.getByEmail(email) ?? await User.getByPhone(phone);
    if (existUser) {
      throw new StandardError(422, {
        code: "ALREADY_EXISTS", message: "Duplicate email or phone user is exists",
      });
    }

    const authentication = await PhoneAuthenticationService.getVerified(phone);
    if (!authentication) {
      throw new StandardError(422, {
        code: "INVALID_AUTHENTICATION", message: "Authentication is expired or is not verified",
      });
    }

    const passwordSalt = this.createPasswordSalt();
    const hashedPassword = this.createHashedPassword(password, passwordSalt);

    const model = await User.create({
      username, email, name, password: hashedPassword, passwordSalt, phone,
    });
    await PhoneAuthenticationService.delete(authentication);

    return AuthService.createToken({ id: model.id });
  }

  public static async login(identifier: string, password: string) {
    const user = await User.getByEmail(identifier) ?? await User.getByPhone(identifier);
    if (!user) {
      throw new StandardError(422, {
        code: "INVALID_IDENTIFIER", message: "Invalid identifier",
      });
    }

    const hashedPassword = this.createHashedPassword(password, user.passwordSalt);
    if (user.password !== hashedPassword) {
      throw new StandardError(422, {
        code: "INVALID_IDENTIFIER", message: "Invalid identifier",
      });
    }

    return AuthService.createToken({ id: user.id });
  }

  public static async resetPassword(phone: string, password: string) {
    const authentication = await PhoneAuthenticationService.getVerified(phone);
    if (!authentication) {
      throw new StandardError(422, {
        code: "INVALID_AUTHENTICATION", message: "Authentication is expired or is not verified",
      });
    }

    const user = await User.getByPhone(phone);
    if (!user) {
      throw new StandardError(404, {
        code: "NOT_FOUND", message: "User is not exists",
      });
    }

    const passwordSalt = this.createPasswordSalt();
    const hashedPassword = this.createHashedPassword(password, passwordSalt);
    await user.updatePassword(hashedPassword, passwordSalt);
    await PhoneAuthenticationService.delete(authentication);

    return true;
  }

  public static async get(id: string) {
    const user = await User.primaryKey.get(id);
    if (!user) {
      throw new StandardError(404, {
        code: "NOT_FOUND", message: "User is not exists",
      });
    }

    return user;
  }

  private static createPasswordSalt() {
    return crypto.randomBytes(64).toString("base64");
  }

  private static createHashedPassword(password: string, salt: string) {
    return crypto.pbkdf2Sync(password, salt, 9999, 64, "sha512").toString("base64");
  }
}
