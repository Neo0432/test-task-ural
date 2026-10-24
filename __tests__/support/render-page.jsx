import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createAppStore } from '../../src/app/store.js';
import { PartsSearchPage } from '../../src/pages/parts-search/index.js';

export const renderPage = (options) => {
  const user = userEvent.setup(options);
  render(
    <Provider store={createAppStore()}>
      <PartsSearchPage />
    </Provider>,
  );
  return { user, input: screen.getByLabelText('Part number') };
};

export const wait = (ms) => act(() => new Promise((done) => setTimeout(done, ms)));
