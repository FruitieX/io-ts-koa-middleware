# io-ts-koa-middleware

Validate requests with io-ts in your Koa middleware.

Runs provided middleware function only if validations against provided
`ReqType` io-ts runtime type pass, otherwise responds with HTTP 400 and a
validation error message.

If decoding succeeds, your middleware will be called with a `decoded`
property set on the `ctx` parameter. The type signature of `ctx.decoded` is
based on the provided `ReqType`, which means autocompletion will work and you
can safely read from it in your middleware.

```ts
import * as t from 'io-ts';
import decodeRequest from 'io-ts-koa-middleware';

const ReqType = t.type({
  query: t.type({
    filter: t.string
  }),
});

export const searchMovie = decodeRequest(ReqType)(async (ctx, next) => {
  const { filter } = ctx.decoded.query;
  ...
});
```

`ReqType` supports the following properties:

```ts
t.type({
  body?: t.Type<any>;
  headers?: t.Type<any>;
  params?: t.Type<any>;
  query?: t.Type<any>;
})
```

## Example

```ts
import * as t from 'io-ts';
import { decodeRequest } from 'io-ts-koa-middleware';

const ReqType = t.type({
  headers: t.type({
    authorization: t.refinement(
      t.string,
      apiKey => /^([a-z0-9]){8}$/.test(apiKey),
      'valid OMDB API key',
    ),
  }),
  query: t.type({
    filter: t.string,
  }),
});

export const searchMovie = decodeRequest(ReqType)(async (ctx, next) => {
  const { query, headers } = ctx.decoded;
  const result = await omdb.search(headers.authorization, query.filter);
  ctx.body = { result };
});
```

```bash
$ http localhost:3000/movie/search?filter=avatar "Authorization: apikey42"

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 1037
Content-Type: application/json; charset=utf-8
Date: Sun, 18 Nov 2018 08:55:32 GMT

{
    "result": {
        "Actors": "Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang",
        "Awards": "Won 3 Oscars. Another 85 wins & 128 nominations.",
        "BoxOffice": "$749,700,000",
        "Country": "UK, USA",
        "DVD": "22 Apr 2010",
        "Director": "James Cameron",
        "Genre": "Action, Adventure, Fantasy",
        ...
```

```bash
$ http localhost:3000/movie/search

HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 142
Content-Type: text/plain; charset=utf-8
Date: Sun, 18 Nov 2018 08:53:47 GMT

Expecting valid OMDB API key at headers.authorization but instead got: undefined.
Expecting string at query.filter but instead got: undefined.
```