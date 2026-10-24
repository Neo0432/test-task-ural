import { useAppSelector } from '../../../shared/lib/store-hooks.js';
import { Loader } from '../../../shared/ui/loader.jsx';
import { selectOffers } from '../model/part-search-slice.js';

export const OffersTable = () => {
  const { status, rows, error } = useAppSelector(selectOffers);

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
  if (!rows.length) {
    return <p className="text-muted">No offers found</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">Brand</th>
            <th scope="col">Number</th>
            <th scope="col">Name</th>
            <th scope="col">Warehouse</th>
            <th scope="col" className="text-end">
              Price
            </th>
            <th scope="col" className="text-end">
              Stock
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.brand}</td>
              <td>{row.number}</td>
              <td>{row.name}</td>
              <td>{row.warehouse}</td>
              <td className="text-end">{row.price}</td>
              <td className="text-end">{row.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
