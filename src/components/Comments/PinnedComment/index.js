import React, { useEffect } from 'react';
import { useContentState } from 'helpers/hooks';
import PropTypes from 'prop-types';
import Comment from './Comment';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { Color } from 'constants/css';
import { useAppContext, useContentContext } from 'contexts';
import localize from 'constants/localize';

const pinnedLabel = localize('pinned');

PinnedComment.propTypes = {
  commentId: PropTypes.number.isRequired,
  parent: PropTypes.object,
  rootContent: PropTypes.object,
  subject: PropTypes.object,
  userId: PropTypes.number
};

export default function PinnedComment({
  commentId,
  parent,
  rootContent,
  subject,
  userId
}) {
  const {
    requestHelpers: { loadContent }
  } = useAppContext();
  const {
    actions: { onInitContent }
  } = useContentContext();
  const comment = useContentState({
    contentType: 'comment',
    contentId: commentId
  });
  useEffect(() => {
    if (!comment.loaded) {
      return init();
    }

    async function init() {
      const data = await loadContent({
        contentId: commentId,
        contentType: 'comment'
      });
      onInitContent({ contentId: commentId, contentType: 'comment', ...data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment, commentId]);

  return (
    <ErrorBoundary>
      {comment.loaded && !comment.isDeleted && !comment.notFound ? (
        <div
          style={{
            marginTop: '0.5rem',
            borderBottom: `1px solid ${Color.borderGray()}`,
            paddingBottom: '0.5rem',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              lineHeight: 1,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: Color.darkerGray()
            }}
          >
            <Icon icon={['fas', 'thumbtack']} />
            <span style={{ marginLeft: '0.7rem' }}>{pinnedLabel}</span>
          </div>
          <Comment
            parent={parent}
            rootContent={rootContent}
            subject={subject}
            comment={comment}
            userId={userId}
          />
        </div>
      ) : null}
    </ErrorBoundary>
  );
}
