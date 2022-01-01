import React from 'react';
import ContentInput from './ContentInput';
import ErrorBoundary from 'components/ErrorBoundary';

export default function InputPanel() {
  return (
    <ErrorBoundary>
      <ContentInput />
    </ErrorBoundary>
  );
}
