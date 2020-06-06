import PropTypes from 'prop-types';
import React from 'react';
import Button from 'components/Button';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import { css } from 'emotion';

LoadMoreButton.propTypes = {
  label: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default function LoadMoreButton({ label, loading, ...props }) {
  return (
    <ErrorBoundary>
      <div
        className={css`
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <Button disabled={!!loading} {...props}>
          {loading ? 'Loading' : label || 'Load More'}
          {loading && (
            <Icon style={{ marginLeft: '0.7rem' }} icon="spinner" pulse />
          )}
        </Button>
      </div>
    </ErrorBoundary>
  );
}
