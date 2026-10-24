import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { fetchGoods } from '../../../src/shared/api/fetch-goods.js';
import { errorResponse, goodsResponse, mockApi } from '../../support/api.js';
import { notFound, part } from '../../support/fixtures.js';
import { server } from '../../support/server.js';

describe('fetchGoods', () => {
  it('returns goods for a valid response', async () => {
    const goods = [part('MANN', 'Oil filter')];
    const requests = mockApi(() => goodsResponse(goods));

    await expect(fetchGoods({ number: 'OC90' })).resolves.toEqual(goods);
    expect(requests).toEqual([{ number: 'OC90' }]);
  });

  it('sends params URL-encoded so special characters arrive intact', async () => {
    const requests = mockApi(() => goodsResponse([]));

    await fetchGoods({ number: 'A#1&B/2', brand: 'NGK/NTK', analogues: 'on' });

    expect(requests).toEqual([{ number: 'A#1&B/2', brand: 'NGK/NTK', analogues: 'on' }]);
  });

  it('maps a 403 text/plain error body to its message', async () => {
    mockApi(
      () =>
        new HttpResponse('{"error":"Empty key!"}', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    );

    await expect(fetchGoods({ number: 'OC90' })).rejects.toThrow(/^Empty key!$/);
  });

  it('maps an error body with status 200 to its message', async () => {
    mockApi(() => errorResponse(200, 'Invalid key client!'));

    await expect(fetchGoods({ number: 'OC90' })).rejects.toThrow(/^Invalid key client!$/);
  });

  it('maps a network failure to Network error', async () => {
    server.use(http.get('*/api/', () => HttpResponse.error()));

    await expect(fetchGoods({ number: 'OC90' })).rejects.toThrow(/^Network error$/);
  });

  it('maps a 500 with an empty body to the status message', async () => {
    mockApi(() => new HttpResponse(null, { status: 500 }));

    await expect(fetchGoods({ number: 'OC90' })).rejects.toThrow(/^Request failed with status 500$/);
  });

  it.each([
    ['an empty body', ''],
    ['a non-JSON body', '<html>Service unavailable</html>'],
    ['JSON without goods', '{"items":[]}'],
    ['JSON with goods not an array', '{"goods":"none"}'],
  ])('maps a 200 with %s to Unexpected API response', async (_, body) => {
    mockApi(() => HttpResponse.text(body));

    await expect(fetchGoods({ number: 'OC90' })).rejects.toThrow(/^Unexpected API response$/);
  });

  it.each([
    ['an empty goods array', []],
    ['only empty-structure items', [notFound]],
  ])('returns an empty result for %s', async (_, goods) => {
    mockApi(() => goodsResponse(goods));

    await expect(fetchGoods({ number: '7260500039S' })).resolves.toEqual([]);
  });
});
