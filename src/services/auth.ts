import * as JWT from "jsonwebtoken";

// tslint:disable-next-line
const JWT_PRIVATE_KEY = "1594244D52F2D8C12B142BB61F47BC2EAF503D6D9CA8480CAE9FCF112F66E4967DC5E8FA98285E36DB8AF1B8FFA8B84CB15E0FBCF836C3DEB803C13F37659A60";

export interface JWTPayload {
  id: string; // userId
  // iat: number; // JWT signed timestamp
}

export class AuthService {
  public static createToken(payload: JWTPayload) {
    return JWT.sign(payload, JWT_PRIVATE_KEY, { algorithm: "HS256" });
  }

  public static parseToken(token: string) {
    if (token) {
      try {
        return JWT.verify(token, JWT_PRIVATE_KEY, { algorithms: ["HS256"] }) as JWTPayload;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }
}
