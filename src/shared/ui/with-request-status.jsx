import { Loader } from './loader.jsx';

export const withRequestStatus = (Component, { emptyText }) => {
  const WithRequestStatus = ({ status, error, isEmpty, ...props }) => {
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
    if (isEmpty) {
      return <p className="text-muted">{emptyText}</p>;
    }

    return <Component {...props} />;
  };

  return WithRequestStatus;
};
