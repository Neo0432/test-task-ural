import { useAppSelector } from '../../../shared/lib/store-hooks.js';
import { withRequestStatus } from '../../../shared/ui/with-request-status.jsx';
import { selectOffers } from '../model/part-search-slice.js';

const EMPTY_CELL = '—';

const OffersTableView = ({ rows }) => (
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
            <td>{row.warehouse ?? EMPTY_CELL}</td>
            <td className="text-end">{row.price === null ? EMPTY_CELL : row.price.toFixed(2)}</td>
            <td className="text-end">{row.stock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const OffersTableWithStatus = withRequestStatus(OffersTableView, { emptyText: 'No offers found' });

export const OffersTable = () => {
  const { status, rows, error } = useAppSelector(selectOffers);

  return <OffersTableWithStatus status={status} error={error} isEmpty={!rows.length} rows={rows} />;
};
