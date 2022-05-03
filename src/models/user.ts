import { Decorator, Query, Table } from "@serverless-seoul/dynamorm";
import { v4 as uuid } from "uuid";

@Decorator.Table({ name: `${process.env.STAGE}_user` })
export class User extends Table {
  @Decorator.HashPrimaryKey("id")
  public static readonly primaryKey: Query.HashPrimaryKey<User, string>;

  @Decorator.Writer()
  public static readonly writer: Query.Writer<User>;

  @Decorator.HashGlobalSecondaryIndex("e", { name: "e-index" })
  public static readonly emailIndex: Query.HashGlobalSecondaryIndex<User, string>;

  @Decorator.HashGlobalSecondaryIndex("p", { name: "p-index" })
  public static readonly phoneIndex: Query.HashGlobalSecondaryIndex<User, string>;

  public static async create(attributes: {
    username: string;
    email: string;
    name: string;
    password: string;
    passwordSalt: string;
    phone: string;
  }) {
    const model = new this();

    model.id = uuid();
    model.username = attributes.username;
    model.email = attributes.email;
    model.name = attributes.name;
    model.password = attributes.password;
    model.passwordSalt = attributes.passwordSalt;
    model.phone = attributes.phone;

    await model.save();

    return model;
  }

  public static async getByEmail(email: string) {
    const { records } = await this.emailIndex.query(email);

    return records.length === 0 ? null : records[0];
  }

  public static async getByPhone(phone: string) {
    const { records } = await this.phoneIndex.query(phone);

    return records.length === 0 ? null : records[0];
  }

  @Decorator.Attribute({ name: "id" })
  public id!: string;

  @Decorator.Attribute({ name: "un" })
  public username!: string;

  @Decorator.Attribute({ name: "e" })
  public email!: string;

  @Decorator.Attribute({ name: "n" })
  public name!: string;

  @Decorator.Attribute({ name: "pwd" })
  public password!: string;

  @Decorator.Attribute({ name: "pwd_s" })
  public passwordSalt!: string;

  @Decorator.Attribute({ name: "p" })
  public phone!: string;

  public async updatePassword(password: string, passwordSalt: string) {
    this.password = password;
    this.passwordSalt = passwordSalt;

    await this.save();

    return this;
  }
}
