import { useAppDispatch, useAppSelector } from '../../../shared/lib/store-hooks.js';
import { Loader } from '../../../shared/ui/loader.jsx';
import { fetchOffers, selectBrands, selectSelectedBrand } from '../model/part-search-slice.js';

export const BrandList = () => {
  const dispatch = useAppDispatch();
  const { number, status, items, error } = useAppSelector(selectBrands);
  const selectedBrand = useAppSelector(selectSelectedBrand);

  if (status === 'loading') {
    return <Loader />;
  }
  if (status === 'failed') {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  if (status !== 'succeeded') {
    return null;
  }
  if (!items.length) {
    return <p className="text-muted">No manufacturers found</p>;
  }

  return (
    <div className="list-group">
      {items.map(({ brand, name }) => (
        <button
          key={brand}
          type="button"
          className={`list-group-item list-group-item-action${brand === selectedBrand ? ' active' : ''}`}
          aria-pressed={brand === selectedBrand}
          onClick={() => dispatch(fetchOffers({ number, brand }))}
        >
          <span className="fw-semibold">{brand}</span> <small>{name}</small>
        </button>
      ))}
    </div>
  );
};
