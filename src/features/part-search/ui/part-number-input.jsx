import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../shared/lib/store-hooks.js';
import { fetchBrands, searchCleared } from '../model/part-search-slice.js';

const DEBOUNCE_MS = 500;

export const PartNumberInput = () => {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const number = value.trim();

  useEffect(() => {
    if (!number) {
      dispatch(searchCleared());
      return undefined;
    }
    let request;
    const timer = setTimeout(() => {
      request = dispatch(fetchBrands(number));
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [number, dispatch]);

  return (
    <div className="mb-4">
      <label htmlFor="part-number" className="form-label">
        Part number
      </label>
      <input
        id="part-number"
        className="form-control"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="e.g. OC90"
        autoComplete="off"
      />
    </div>
  );
};
