import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import { css } from '@emotion/css';
import DeleteCode from './DeleteCode';
import CodingHelloWorld from './CodingHelloWorld';

HelloWorld.propTypes = {
  task: PropTypes.object.isRequired,
  onSetMissionState: PropTypes.func.isRequired
};

export default function HelloWorld({ task, onSetMissionState }) {
  const { deletedCode } = task;

  return (
    <ErrorBoundary>
      <div
        className={css`
          width: 100%;
          font-size: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          p {
            font-size: 2rem;
            font-weight: bold;
          }
        `}
      >
        <DeleteCode
          onSetDeletedCode={() =>
            onSetMissionState({
              missionId: task.id,
              newState: { deletedCode: true }
            })
          }
          deletedCode={deletedCode}
        />
        {deletedCode && (
          <CodingHelloWorld
            style={{
              marginTop: '5rem'
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}