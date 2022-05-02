import {
  Namespace,
  Router,
  Routes,
} from "@serverless-seoul/corgi";

export function createResolver(routes: Routes) {
  const resolver = function resolve(
    method: string,
    path: string,
    queryStringParameters?: { [key: string]: string },
    headers: { [key: string]: string } = {},
    body?: string,
  ) {
    const router = new Router([
      new Namespace("", {}, {
        children: routes,
      }),
    ], {});

    return router.resolve({
      headers,
      httpMethod: method,
      path,
      queryStringParameters,
      body,
    } as any, { timeout: 1000 });
  };

  return resolver;
}

// Helper for rejection testing
export function toJS<R, E = Error>(promise: Promise<R>): Promise<[null, R] | [E, null]> {
  return promise.then((v) => [null, v] as [null, R])
    .catch((e) => [e, null] as [E, null]);
}

import * as Sinon from "sinon";

export let sandbox = Sinon.createSandbox();

beforeEach(() => {
  sandbox = Sinon.createSandbox();
});

afterEach(() => {
  sandbox.verifyAndRestore();
});
