import { Table } from "@serverless-seoul/dynamorm";
import * as ModelsIndex from "../index";

const Models = Object.values(ModelsIndex)
  // eslint-disable-next-line no-prototype-builtins
  .filter((value) => Table.isPrototypeOf(value)) as Array<typeof Table>;

beforeEach(async () => {
  for (const model of Models) {
    try {
      await model.createTable();
    } catch (e) {
      await model.dropTable();
      await model.createTable();
    }
  }
});

afterEach(async () => {
  for (const model of Models) {
    await model.dropTable();
  }
});
