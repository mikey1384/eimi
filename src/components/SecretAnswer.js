import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import LongText from 'components/Texts/LongText';
import { borderRadius, Color, desktopMinWidth } from 'constants/css';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { css } from 'emotion';

SecretAnswer.propTypes = {
  answer: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.object,
  subjectId: PropTypes.number,
  uploaderId: PropTypes.number
};

function SecretAnswer({ answer, onClick, style, subjectId, uploaderId }) {
  const {
    requestHelpers: { checkIfUserResponded }
  } = useAppContext();
  const { userId } = useMyState();
  const {
    actions: { onChangeSpoilerStatus }
  } = useContentContext();
  const { secretShown, spoilerStatusChecked } = useContentState({
    contentType: 'subject',
    contentId: subjectId
  });
  const spoilerShown = secretShown || uploaderId === userId;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    if (userId && !spoilerStatusChecked) {
      init();
    }
    if (spoilerStatusChecked && spoilerShown) {
      onChangeSpoilerStatus({
        shown: true,
        subjectId,
        checked: true
      });
    }
    if (!userId) {
      onChangeSpoilerStatus({ shown: false, subjectId, checked: false });
    }

    async function init() {
      if (!spoilerShown) {
        const { responded } = await checkIfUserResponded(subjectId);
        if (mounted.current) {
          onChangeSpoilerStatus({
            shown: responded,
            subjectId,
            checked: true
          });
        }
      }
    }

    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spoilerShown, spoilerStatusChecked, userId]);

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
            Submit your response to view the secret message. Tap here
          </span>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default memo(SecretAnswer);
