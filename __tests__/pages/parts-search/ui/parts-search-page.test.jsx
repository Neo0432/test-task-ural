import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { deferred, errorResponse, goodsResponse, mockApi } from '../../../support/api.js';
import { notFound, part, warehouse } from '../../../support/fixtures.js';
import { renderPage, wait } from '../../../support/render-page.jsx';

const brandButtons = () => screen.queryAllByRole('button').map((button) => button.textContent);

const tableHeaders = () =>
  within(screen.getByRole('table'))
    .getAllByRole('columnheader')
    .map((cell) => cell.textContent);

const tableRows = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    );

const brandButton = (brand) => new RegExp(`^${brand} `);

const offersFixture = [
  part('MEYLE', 'Rear control arm kit', {
    number: '7160500039/S',
    price: 999.99,
    warehouses: [warehouse('MS2', 12533.62, 20)],
    analogues: [
      part('MARSO', 'Control arm set', {
        number: '53612/1',
        price: 8000,
        warehouses: [warehouse('PT4', 8680.2, 10)],
      }),
      part('MEYLE', 'Control arm kit one side', { number: '7160500039/SK' }),
    ],
  }),
];

const meyleApi = (params) =>
  goodsResponse(params.get('brand') ? offersFixture : [part('MEYLE', 'Rear control arm kit')]);

const searchAndPick = async (user, input, brand) => {
  await user.type(input, 'OC90');
  await user.click(await screen.findByRole('button', { name: brandButton(brand) }));
};

describe('Stage 1: manufacturers by part number', () => {
  it('shows one button per unique brand in response order with the first item name', async () => {
    const requests = mockApi(() =>
      goodsResponse([
        part('A', 'Oil filter A'),
        part('B', 'Oil filter B'),
        part('A', 'Air filter A'),
        part('C', 'Oil filter C'),
      ]),
    );
    const { user, input } = renderPage();

    await user.type(input, '  OC90 ');

    await waitFor(() => expect(brandButtons()).toEqual(['A Oil filter A', 'B Oil filter B', 'C Oil filter C']));
    expect(requests).toEqual([{ number: 'OC90' }]);
  });

  it('does not search for whitespace-only input', async () => {
    const requests = mockApi(() => goodsResponse([part('A', 'Oil filter A')]));
    const { user, input } = renderPage();

    await user.type(input, '   ');
    await wait(700);

    expect(requests).toEqual([]);
    expect(brandButtons()).toEqual([]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('sends exactly one request after typing OC90 key by key', async () => {
    const requests = mockApi(() => goodsResponse([part('MANN', 'Oil filter')]));
    const { user, input } = renderPage({ delay: 50 });

    await user.type(input, 'OC90');
    await screen.findByRole('button', { name: brandButton('MANN') });
    await wait(600);

    expect(requests).toEqual([{ number: 'OC90' }]);
  });

  it('sends a part number with special characters intact', async () => {
    const requests = mockApi(() => goodsResponse([part('MANN', 'Oil filter')]));
    const { user, input } = renderPage();

    await user.type(input, 'A#1&B/2');
    await screen.findByRole('button', { name: brandButton('MANN') });

    expect(requests).toEqual([{ number: 'A#1&B/2' }]);
  });

  it('ignores a slow response for an older value', async () => {
    const oldResponse = deferred();
    const requests = mockApi(async (params) => {
      if (params.get('number') === 'A') {
        await oldResponse.promise;
        return goodsResponse([part('OLD', 'Old part')]);
      }
      return goodsResponse([part('NEW', 'New part')]);
    });
    const { user, input } = renderPage();

    await user.type(input, 'A');
    await waitFor(() => expect(requests).toEqual([{ number: 'A' }]));
    await user.type(input, 'B');
    await wait(100);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await screen.findByRole('button', { name: brandButton('NEW') });
    oldResponse.resolve();
    await wait(100);

    expect(brandButtons()).toEqual(['NEW New part']);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clearing the input removes the brand list and the offers table', async () => {
    mockApi(meyleApi);
    const { user, input } = renderPage();
    await searchAndPick(user, input, 'MEYLE');
    await screen.findByRole('table');

    await user.clear(input);

    await waitFor(() => expect(brandButtons()).toEqual([]));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('Stage 2: analogues and offers', () => {
  it('shows one row per warehouse offer of the part and its analogues with warehouse prices', async () => {
    mockApi(meyleApi);
    const { user, input } = renderPage();

    await searchAndPick(user, input, 'MEYLE');
    await screen.findByRole('table');

    expect(screen.getByRole('button', { name: brandButton('MEYLE') })).toHaveClass('active');
    expect(tableHeaders()).toEqual(['Brand', 'Number', 'Name', 'Warehouse', 'Price', 'Stock']);
    expect(tableRows()).toEqual([
      ['MEYLE', '7160500039/S', 'Rear control arm kit', 'MS2', '12533.62', '20'],
      ['MARSO', '53612/1', 'Control arm set', 'PT4', '8680.20', '10'],
      ['MEYLE', '7160500039/SK', 'Control arm kit one side', '—', '—', '0'],
    ]);
  });

  it('sends the searched number, the brand as returned and analogues=on', async () => {
    const requests = mockApi((params) =>
      goodsResponse(params.get('brand') ? [] : [part('NGK/NTK', 'Lambda sensor', { number: '01-89' })]),
    );
    const { user, input } = renderPage();

    await user.type(input, '0189');
    await user.click(await screen.findByRole('button', { name: brandButton('NGK/NTK') }));
    await screen.findByText('No offers found');

    expect(requests).toEqual([{ number: '0189' }, { number: '0189', brand: 'NGK/NTK', analogues: 'on' }]);
  });

  it('clicking a second brand replaces the rows with its offers', async () => {
    mockApi((params) => {
      const brand = params.get('brand');
      if (!brand) {
        return goodsResponse([part('A', 'Part A'), part('B', 'Part B')]);
      }
      return goodsResponse([part(brand, `Offer ${brand}`, { warehouses: [warehouse(`W${brand}`, 1.5, 3)] })]);
    });
    const { user, input } = renderPage();
    await searchAndPick(user, input, 'A');
    await waitFor(() => expect(tableRows()).toEqual([['A', 'OC90', 'Offer A', 'WA', '1.50', '3']]));

    await user.click(screen.getByRole('button', { name: brandButton('B') }));

    await waitFor(() => expect(tableRows()).toEqual([['B', 'OC90', 'Offer B', 'WB', '1.50', '3']]));
    expect(screen.getByRole('button', { name: brandButton('B') })).toHaveClass('active');
    expect(screen.getByRole('button', { name: brandButton('A') })).not.toHaveClass('active');
  });

  it('ignores a slow response for a previously clicked brand', async () => {
    const slowResponse = deferred();
    mockApi(async (params) => {
      const brand = params.get('brand');
      if (!brand) {
        return goodsResponse([part('A', 'Part A'), part('B', 'Part B')]);
      }
      if (brand === 'A') {
        await slowResponse.promise;
      }
      return goodsResponse([part(brand, `Offer ${brand}`, { warehouses: [warehouse(`W${brand}`, 1, 1)] })]);
    });
    const { user, input } = renderPage();
    await searchAndPick(user, input, 'A');
    await user.click(screen.getByRole('button', { name: brandButton('B') }));
    await screen.findByRole('table');

    slowResponse.resolve();
    await wait(100);

    expect(tableRows()).toEqual([['B', 'OC90', 'Offer B', 'WB', '1.00', '1']]);
  });

  it('changing the part number removes the table and the active state', async () => {
    mockApi(meyleApi);
    const { user, input } = renderPage();
    await searchAndPick(user, input, 'MEYLE');
    await screen.findByRole('table');

    await user.type(input, '1');

    await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
    expect(await screen.findByRole('button', { name: brandButton('MEYLE') })).not.toHaveClass('active');
  });
});

describe('Loaders and API errors', () => {
  const failures = [
    ['an API error', () => errorResponse(403, 'Empty key!'), 'Empty key!'],
    ['a network failure', () => HttpResponse.error(), 'Network error'],
  ];

  it.each(failures)('stage 1 shows %s as a danger alert', async (_, respond, message) => {
    mockApi(respond);
    const { user, input } = renderPage();

    await user.type(input, 'OC90');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(message);
    expect(alert).toHaveClass('alert', 'alert-danger');
    expect(brandButtons()).toEqual([]);
  });

  it.each([
    ['an empty goods array', []],
    ['only empty-structure items', [notFound]],
  ])('stage 1 shows No manufacturers found for %s', async (_, goods) => {
    mockApi(() => goodsResponse(goods));
    const { user, input } = renderPage();

    await user.type(input, '7260500039S');

    expect(await screen.findByText('No manufacturers found')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(failures)('stage 2 shows %s as a danger alert', async (_, respond, message) => {
    mockApi((params) => (params.get('brand') ? respond() : goodsResponse([part('MANN', 'Oil filter')])));
    const { user, input } = renderPage();

    await searchAndPick(user, input, 'MANN');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(message);
    expect(alert).toHaveClass('alert', 'alert-danger');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it.each([
    ['an empty goods array', []],
    ['only empty-structure items', [notFound]],
  ])('stage 2 shows No offers found for %s', async (_, goods) => {
    mockApi((params) => goodsResponse(params.get('brand') ? goods : [part('MANN', 'Oil filter')]));
    const { user, input } = renderPage();

    await searchAndPick(user, input, 'MANN');

    expect(await screen.findByText('No offers found')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a loader while stage 1 is loading', async () => {
    const response = deferred();
    mockApi(async () => {
      await response.promise;
      return goodsResponse([part('MANN', 'Oil filter')]);
    });
    const { user, input } = renderPage();

    await user.type(input, 'OC90');

    expect(await screen.findByRole('status')).toHaveTextContent('Loading...');
    response.resolve();
    await screen.findByRole('button', { name: brandButton('MANN') });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a loader while stage 2 is loading', async () => {
    const response = deferred();
    mockApi(async (params) => {
      if (params.get('brand')) {
        await response.promise;
      }
      return goodsResponse([part('MANN', 'Oil filter', { warehouses: [warehouse('MS2', 5, 1)] })]);
    });
    const { user, input } = renderPage();

    await searchAndPick(user, input, 'MANN');

    expect(await screen.findByRole('status')).toHaveTextContent('Loading...');
    response.resolve();
    await screen.findByRole('table');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('typing a new value after an error clears the alert and shows the new result', async () => {
    mockApi((params) =>
      params.get('number') === 'BAD'
        ? errorResponse(200, 'Invalid key client!')
        : goodsResponse([part('MANN', 'Oil filter')]),
    );
    const { user, input } = renderPage();
    await user.type(input, 'BAD');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid key client!');

    await user.clear(input);
    await user.type(input, 'OC90');

    await screen.findByRole('button', { name: brandButton('MANN') });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
