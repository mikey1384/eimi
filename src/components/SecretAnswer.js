import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import LongText from 'components/Texts/LongText';
import { borderRadius, Color, desktopMinWidth } from 'constants/css';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { css } from '@emotion/css';

SecretAnswer.propTypes = {
  answer: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.object,
  subjectId: PropTypes.number,
  uploaderId: PropTypes.number
};

function SecretAnswer({ answer, onClick, style, subjectId, uploaderId }) {
  const mounted = useRef(true);
  useEffect(() => {
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  const {
    requestHelpers: { checkIfUserResponded }
  } = useAppContext();
  const { userId } = useMyState();
  const {
    actions: { onChangeSpoilerStatus }
  } = useContentContext();
  const { secretShown, prevSecretViewerId } = useContentState({
    contentType: 'subject',
    contentId: subjectId
  });
  const spoilerShown = secretShown || uploaderId === userId;
  useEffect(() => {
    if (userId && userId !== prevSecretViewerId) {
      init();
    }
    if (!userId) {
      onChangeSpoilerStatus({ shown: false, subjectId });
    }

    async function init() {
      const { responded } = await checkIfUserResponded(subjectId);
      if (mounted.current) {
        onChangeSpoilerStatus({
          shown: responded,
          subjectId,
          prevSecretViewerId: userId
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevSecretViewerId, subjectId, userId]);

  return (
    <ErrorBoundary>
      <div
        onClick={spoilerShown ? () => {} : onClick}
        style={{
          cursor: spoilerShown ? '' : 'pointer',
          fontSize: '1.7rem',
          background: spoilerShown ? Color.ivory() : Color.white(),
          border: `1px solid ${
            spoilerShown ? Color.borderGray() : Color.black()
          }`,
          borderRadius,
          wordBreak: 'break-word',
          textAlign: spoilerShown ? '' : 'center',
          padding: '1rem',
          ...style
        }}
      >
        {spoilerShown && <LongText>{answer}</LongText>}
        {!spoilerShown && (
          <span
            className={css`
              @media (min-width: ${desktopMinWidth}) {
                &:hover {
                  text-decoration: underline;
                }
              }
            `}
          >
            Submit your response to view the secret message
          </span>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default memo(SecretAnswer);
