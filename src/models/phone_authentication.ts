import { Decorator, Query, Table } from "@serverless-seoul/dynamorm";

@Decorator.Table({ name: `${process.env.STAGE}_phone_authentication` })
export class PhoneAuthentication extends Table {
  @Decorator.HashPrimaryKey("p")
  public static readonly primaryKey: Query.HashPrimaryKey<PhoneAuthentication, string>;

  @Decorator.Writer()
  public static readonly writer: Query.Writer<PhoneAuthentication>;

  public static async create(attributes: {
    phone: string, key: string, expiresAt: number;
  }) {
    const model = new this();

    model.phone = attributes.phone;
    model.key = attributes.key;
    model.isVerify = false;
    model.expiresAt = attributes.expiresAt;

    await model.save();

    return model;
  }

  @Decorator.Attribute({ name: "p" })
  public phone!: string;

  @Decorator.Attribute({ name: "a_n" })
  public key!: string;

  @Decorator.Attribute({ name: "i_v" })
  public isVerify!: boolean;

  @Decorator.Attribute({ name: "e_a" })
  public expiresAt!: number;

  public async verfiy(expiresAt: number) {
    this.isVerify = true;
    this.expiresAt = expiresAt;

    await this.save();

    return this;
  }
}
