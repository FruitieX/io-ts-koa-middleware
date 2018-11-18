import * as t from 'io-ts';
import { formatValidationError } from 'io-ts-reporters';
import * as array from 'fp-ts/lib/Array';

import { Context } from 'koa';

// typings for ctx.params
import 'koa-router';
// typings for ctx.body
import 'koa-body';

type NextFunction = () => Promise<any>;

interface IValidatedParams {
  body?: t.Type<any>;
  headers?: t.Type<any>;
  params?: t.Type<any>;
  query?: t.Type<any>;
}

type ContextWithDecoded<T> = Context & { decoded: T };

export const decodeRequest = <T>(reqType: t.InterfaceType<IValidatedParams, T>) => (
  handler: (ctx: ContextWithDecoded<T>, next: NextFunction) => any,
) => (ctx: Context, next: NextFunction) =>
  reqType
    .decode({
      body: ctx.request.body,
      headers: ctx.headers,
      params: ctx.params,
      query: ctx.request.query,
    })
    .fold(
      errors =>
        ctx.throw(
          400,
          array.catOptions(errors.map(formatValidationError)).join('\n'),
        ),
      decoded => handler(Object.assign(ctx, { decoded }), next),
    );