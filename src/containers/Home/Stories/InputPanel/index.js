import React from 'react';
import ContentInput from './ContentInput';
import ErrorBoundary from 'components/ErrorBoundary';
import SubjectInput from './SubjectInput';

export default function InputPanel() {
  return (
    <ErrorBoundary>
      <SubjectInput />
      <ContentInput />
    </ErrorBoundary>
  );
}
