import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import Comments from 'components/Comments';
import Intro from './Intro';
import Achievements from './Achievements';
import Pictures from './Pictures';
import ErrorBoundary from 'components/ErrorBoundary';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { css } from '@emotion/css';
import { mobileMaxWidth } from 'constants/css';

Home.propTypes = {
  profile: PropTypes.object,
  selectedTheme: PropTypes.string.isRequired
};

export default function Home({ profile, selectedTheme }) {
  const {
    requestHelpers: { loadComments }
  } = useAppContext();
  const { userId } = useMyState();
  const {
    actions: {
      onDeleteComment,
      onEditComment,
      onEditRewardComment,
      onLikeComment,
      onLoadComments,
      onLoadMoreComments,
      onLoadMoreReplies,
      onLoadRepliesOfReply,
      onUploadComment,
      onUploadReply
    }
  } = useContentContext();
  const { commentsLoaded, id, numPics, username, pictures } = profile;
  const [loadingComments, setLoadingComments] = useState(false);
  const mounted = useRef(true);
  const CommentInputAreaRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!commentsLoaded) {
      initComments();
    }
    async function initComments() {
      try {
        setLoadingComments(true);
        const { comments, loadMoreButton } = await loadComments({
          contentId: id,
          contentType: 'user',
          limit: 5
        });
        if (mounted.current) {
          onLoadComments({
            contentId: profile.id,
            contentType: 'user',
            comments,
            loadMoreButton
          });
          setLoadingComments(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { comments, commentsLoadMoreButton } = useContentState({
    contentType: 'user',
    contentId: profile.id
  });

  return (
    <ErrorBoundary
      className={css`
        width: 70vw;
        @media (max-width: ${mobileMaxWidth}) {
          width: 100vw;
        }
      `}
    >
      <Intro profile={profile} selectedTheme={selectedTheme} />
      {userId && (
        <Pictures
          profileId={profile.id}
          numPics={numPics}
          pictures={pictures}
          selectedTheme={selectedTheme}
        />
      )}
      <Achievements
        selectedTheme={selectedTheme}
        profile={profile}
        myId={userId}
      />
      {(userId !== profile.id || comments.length > 0 || loadingComments) && (
        <SectionPanel
          customColorTheme={selectedTheme}
          loaded
          title="Message Board"
        >
          <Comments
            comments={comments}
            commentsLoadLimit={5}
            commentsShown={true}
            contentId={id}
            inputAreaInnerRef={CommentInputAreaRef}
            inputTypeLabel={`message to ${username}`}
            isLoading={loadingComments}
            loadMoreButton={commentsLoadMoreButton}
            noInput={id === userId}
            numPreviews={1}
            onCommentSubmit={onUploadComment}
            onDelete={onDeleteComment}
            onEditDone={onEditComment}
            onLikeClick={onLikeComment}
            onLoadMoreComments={onLoadMoreComments}
            onLoadMoreReplies={onLoadMoreReplies}
            onLoadRepliesOfReply={onLoadRepliesOfReply}
            onPreviewClick={onLoadComments}
            onReplySubmit={onUploadReply}
            onRewardCommentEdit={onEditRewardComment}
            parent={{ ...profile, contentType: 'user' }}
            userId={userId}
          />
        </SectionPanel>
      )}
      <div
        className={css`
          display: block;
          height: 7rem;
        `}
      />
    </ErrorBoundary>
  );
}
