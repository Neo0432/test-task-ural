import { BrandList, OffersTable, PartNumberInput } from '../../../features/part-search/index.js';

export const PartsSearchPage = () => (
  <main className="container py-4">
    <h1 className="h3 mb-4">Parts search</h1>
    <PartNumberInput />
    <div className="row g-4">
      <section className="col-md-4" aria-label="Manufacturers">
        <BrandList />
      </section>
      <section className="col-md-8" aria-label="Offers">
        <OffersTable />
      </section>
    </div>
  </main>
);
