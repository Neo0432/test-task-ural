import { useAppDispatch, useAppSelector } from '../../../shared/lib/store-hooks.js';
import { withRequestStatus } from '../../../shared/ui/with-request-status.jsx';
import { fetchOffers, selectBrands, selectNumber, selectSelectedBrand } from '../model/part-search-slice.js';

const BrandListView = ({ items, selectedBrand, onSelect }) => (
  <div className="list-group">
    {items.map(({ brand, name }) => (
      <button
        key={brand}
        type="button"
        className={`list-group-item list-group-item-action${brand === selectedBrand ? ' active' : ''}`}
        aria-pressed={brand === selectedBrand}
        onClick={() => onSelect(brand)}
      >
        <span className="fw-semibold">{brand}</span> <small>{name}</small>
      </button>
    ))}
  </div>
);

const BrandListWithStatus = withRequestStatus(BrandListView, { emptyText: 'No manufacturers found' });

export const BrandList = () => {
  const dispatch = useAppDispatch();
  const number = useAppSelector(selectNumber);
  const { status, items, error } = useAppSelector(selectBrands);
  const selectedBrand = useAppSelector(selectSelectedBrand);

  return (
    <BrandListWithStatus
      status={status}
      error={error}
      isEmpty={!items.length}
      items={items}
      selectedBrand={selectedBrand}
      onSelect={(brand) => dispatch(fetchOffers({ number, brand }))}
    />
  );
};
