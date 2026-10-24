import { http, HttpResponse } from 'msw';
import { server } from './server.js';

export const mockApi = (respond) => {
  const requests = [];
  server.use(
    http.get('*/api/', ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(Object.fromEntries(params));
      return respond(params);
    }),
  );
  return requests;
};

export const goodsResponse = (goods) => HttpResponse.text(JSON.stringify({ goods }));

export const errorResponse = (status, error) => HttpResponse.text(JSON.stringify({ error }), { status });

export const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
