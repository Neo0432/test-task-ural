const toItemRows = ({ brand, number, name, warehouses }) => {
  if (!warehouses?.length) {
    return [{ brand, number, name, warehouse: null, price: null, stock: 0 }];
  }
  return warehouses.map(({ code, price, stock }) => ({
    brand,
    number,
    name,
    warehouse: code || null,
    price: Number(price),
    stock,
  }));
};

export const toBrands = (goods) =>
  goods
    .filter((item, index) => goods.findIndex(({ brand }) => brand === item.brand) === index)
    .map(({ brand, name }) => ({ brand, name }));

export const toOfferRows = (goods) =>
  goods.flatMap((item) => [item, ...(item.analogues ?? [])]).flatMap(toItemRows);
