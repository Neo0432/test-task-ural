export const part = (brand, name, overrides = {}) => ({
  goodsID: `${brand}-${name}`,
  brand,
  number: 'OC90',
  name,
  count: 0,
  price: 0,
  rate: 1,
  warehouses: [],
  ...overrides,
});

export const warehouse = (code, price, stock) => ({
  code,
  id: `${code}-id`,
  own: false,
  price,
  shipmentDate: '2019-05-31T15:30:00+03:00',
  stock,
});

export const notFound = {
  brand: '',
  count: 0,
  goodsID: '00000000-0000-0000-0000-000000000000',
  name: '',
  number: '',
  price: 0,
  rate: 0,
  warehouses: [],
};
