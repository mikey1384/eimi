import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Embedly from 'components/Embedly';
import Comments from 'components/Comments';
import Subjects from 'components/Subjects';
import StarButton from 'components/Buttons/StarButton';
import LikeButton from 'components/Buttons/LikeButton';
import Likers from 'components/Likers';
import ConfirmModal from 'components/Modals/ConfirmModal';
import UserListModal from 'components/Modals/UserListModal';
import RewardStatus from 'components/RewardStatus';
import RecommendationInterface from 'components/RecommendationInterface';
import RecommendationStatus from 'components/RecommendationStatus';
import XPRewardInterface from 'components/XPRewardInterface';
import Icon from 'components/Icon';
import InvalidPage from 'components/InvalidPage';
import Loading from 'components/Loading';
import Description from './Description';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { determineUserCanRewardThis, determineXpButtonDisabled } from 'helpers';
import { useContentState, useMyState } from 'helpers/hooks';
import { processedURL } from 'helpers/stringHelpers';
import {
  useAppContext,
  useContentContext,
  useViewContext,
  useExploreContext
} from 'contexts';

LinkPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default function LinkPage({
  history,
  location,
  match: {
    params: { linkId: initialLinkId }
  }
}) {
  const linkId = Number(initialLinkId);
  const {
    requestHelpers: {
      deleteContent,
      editContent,
      loadComments,
      loadContent,
      loadSubjects
    }
  } = useAppContext();
  const {
    authLevel,
    canDelete,
    canEdit,
    canReward,
    profileTheme,
    twinkleCoins,
    userId
  } = useMyState();
  const {
    actions: { onEditLinkPage, onLikeLink, onUpdateNumLinkComments }
  } = useExploreContext();
  const {
    actions: {
      onDeleteComment,
      onDeleteContent,
      onEditComment,
      onEditContent,
      onEditRewardComment,
      onEditSubject,
      onInitContent,
      onLikeComment,
      onLikeContent,
      onLoadComments,
      onLoadMoreComments,
      onLoadMoreReplies,
      onLoadMoreSubjectComments,
      onLoadMoreSubjectReplies,
      onLoadMoreSubjects,
      onLoadRepliesOfReply,
      onLoadSubjectRepliesOfReply,
      onLoadSubjects,
      onLoadSubjectComments,
      onSetByUserStatus,
      onSetXpRewardInterfaceShown,
      onSetRewardLevel,
      onUploadComment,
      onUploadReply,
      onUploadSubject
    }
  } = useContentContext();
  const {
    byUser,
    comments,
    commentsLoaded,
    commentsLoadMoreButton,
    content,
    isDeleted,
    description,
    likes,
    loaded,
    pinnedCommentId,
    recommendations,
    subjects,
    subjectsLoaded,
    subjectsLoadMoreButton,
    rewards,
    timeStamp,
    title,
    uploader,
    xpRewardInterfaceShown
  } = useContentState({ contentType: 'url', contentId: linkId });

  const {
    actions: { onSetContentNav }
  } = useViewContext();
  const [loadingComments, setLoadingComments] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [likesModalShown, setLikesModalShown] = useState(false);
  const [recommendationInterfaceShown, setRecommendationInterfaceShown] =
    useState(false);
  const mounted = useRef(true);
  const prevDeleted = useRef(false);
  const RewardInterfaceRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!prevDeleted.current && isDeleted) {
      onSetContentNav('');
      history.push('/links');
    }
    prevDeleted.current = isDeleted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleted]);

  useEffect(() => {
    if (!loaded) {
      handleLoadLinkPage();
    }
    if (!commentsLoaded) {
      handleLoadComments();
    }
    if (!subjectsLoaded) {
      handleLoadSubjects();
    }
    async function handleLoadLinkPage() {
      const data = await loadContent({
        contentId: linkId,
        contentType: 'url'
      });
      if (mounted.current) {
        if (data.notFound) return setNotFound(true);
        onInitContent({
          ...data,
          contentId: linkId,
          contentType: 'url'
        });
      }
    }
    async function handleLoadComments() {
      setLoadingComments(true);
      const { comments: loadedComments, loadMoreButton } = await loadComments({
        contentType: 'url',
        contentId: linkId
      });
      onLoadComments({
        comments: loadedComments,
        contentId: linkId,
        contentType: 'url',
        loadMoreButton
      });
      setLoadingComments(false);
    }
    async function handleLoadSubjects() {
      const { results, loadMoreButton } = await loadSubjects({
        contentType: 'url',
        contentId: linkId
      });
      onLoadSubjects({
        contentId: linkId,
        contentType: 'url',
        subjects: results,
        loadMoreButton
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isRecommendedByUser = useMemo(() => {
    return (
      recommendations.filter(
        (recommendation) => recommendation.userId === userId
      ).length > 0
    );
  }, [recommendations, userId]);

  const isRewardedByUser = useMemo(() => {
    return rewards.filter((reward) => reward.rewarderId === userId).length > 0;
  }, [rewards, userId]);

  const userIsUploader = useMemo(
    () => uploader?.id === userId,
    [uploader, userId]
  );

  const userCanEditThis = useMemo(
    () => (canEdit || canDelete) && authLevel > uploader?.authLevel,
    [authLevel, canDelete, canEdit, uploader]
  );
  const userCanRewardThis = useMemo(
    () =>
      determineUserCanRewardThis({
        authLevel,
        canReward,
        recommendations,
        uploader,
        userId
      }),
    [authLevel, canReward, recommendations, uploader, userId]
  );

  const xpButtonDisabled = useMemo(
    () =>
      determineXpButtonDisabled({
        rewardLevel: byUser ? 5 : 0,
        myId: userId,
        xpRewardInterfaceShown,
        rewards
      }),
    [byUser, rewards, userId, xpRewardInterfaceShown]
  );

  useEffect(() => {
    onSetXpRewardInterfaceShown({
      contentType: 'url',
      contentId: linkId,
      shown: xpRewardInterfaceShown && userCanRewardThis
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return loaded ? (
    <div
      className={css`
        margin-top: 1rem;
        @media (max-width: ${mobileMaxWidth}) {
          margin-top: 0;
        }
      `}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        fontSize: '1.7rem',
        paddingBottom: '10rem'
      }}
    >
      <div
        className={css`
          width: 60%;
          background-color: #fff;
          border: 1px solid ${Color.borderGray()};
          padding-bottom: 1rem;
          @media (max-width: ${mobileMaxWidth}) {
            border-top: 0;
            border-left: 0;
            border-right: 0;
            width: 100%;
          }
        `}
      >
        <Description
          key={'description' + linkId}
          uploader={uploader}
          timeStamp={timeStamp}
          myId={userId}
          title={title}
          url={content}
          userCanEditThis={userCanEditThis}
          description={description}
          linkId={linkId}
          onDelete={() => setConfirmModalShown(true)}
          onEditDone={handleEditLinkPage}
          userIsUploader={userIsUploader}
        />
        {!!byUser && false && (
          <div
            style={{
              padding: '0.7rem',
              background: Color[profileTheme](0.9),
              color: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '1.7rem',
              marginTop: '2rem',
              marginBottom: '1rem'
            }}
            className={css`
              margin-left: -1px;
              margin-right: -1px;
              @media (max-width: ${mobileMaxWidth}) {
                margin-left: 0;
                margin-right: 0;
              }
            `}
          >
            This was made by {uploader.username}
          </div>
        )}
        <Embedly
          key={'link' + linkId}
          style={{ marginTop: '2rem' }}
          contentId={linkId}
          loadingHeight="30rem"
        />
        <div
          style={{
            position: 'relative',
            paddingTop: '1.5rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LikeButton
                key={'like' + linkId}
                filled
                style={{ fontSize: '2rem' }}
                contentType="url"
                contentId={linkId}
                onClick={handleLikeLink}
                likes={likes}
              />
              {userCanRewardThis && (
                <Button
                  color="pink"
                  filled
                  disabled={xpButtonDisabled}
                  style={{
                    fontSize: '2rem',
                    marginLeft: '1rem'
                  }}
                  onClick={handleSetXpRewardInterfaceShown}
                >
                  <Icon icon="certificate" />
                  <span style={{ marginLeft: '0.7rem' }}>
                    {xpButtonDisabled || 'Reward'}
                  </span>
                </Button>
              )}
              <div style={{ position: 'relative' }}>
                <StarButton
                  style={{
                    fontSize: '2rem',
                    marginLeft: '1rem'
                  }}
                  direction="left"
                  byUser={!!byUser}
                  contentId={linkId}
                  onToggleByUser={handleSetByUserStatus}
                  contentType="url"
                  uploader={uploader}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Likers
                key={'likes' + linkId}
                style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}
                likes={likes}
                userId={userId}
                onLinkClick={() => setLikesModalShown(true)}
              />
            </div>
          </div>
          {false && (
            <Button
              style={{ right: '1rem', bottom: '0.5rem', position: 'absolute' }}
              color="brownOrange"
              skeuomorphic
              filled={isRecommendedByUser}
              disabled={recommendationInterfaceShown}
              onClick={() => setRecommendationInterfaceShown(true)}
            >
              <Icon icon="star" />
            </Button>
          )}
        </div>
        {recommendationInterfaceShown && (
          <RecommendationInterface
            style={{
              marginTop: likes.length > 0 ? '0.5rem' : '1rem',
              marginBottom: 0
            }}
            contentId={linkId}
            contentType="url"
            onHide={() => setRecommendationInterfaceShown(false)}
            recommendations={recommendations}
            uploaderId={uploader.id}
          />
        )}
        {xpRewardInterfaceShown && (
          <div style={{ padding: '0 1rem' }}>
            <XPRewardInterface
              innerRef={RewardInterfaceRef}
              rewards={rewards}
              rewardLevel={byUser ? 5 : 0}
              contentType="url"
              contentId={linkId}
              noPadding
              onReward={() =>
                setRecommendationInterfaceShown(
                  !isRecommendedByUser && twinkleCoins > 0
                )
              }
              uploaderAuthLevel={uploader.authLevel}
              uploaderId={uploader.id}
            />
          </div>
        )}
        {false && (
          <RecommendationStatus
            style={{
              marginTop: likes.length > 0 ? '0.5rem' : '1rem',
              marginBottom: recommendationInterfaceShown ? '1rem' : 0
            }}
            contentType="url"
            recommendations={recommendations}
          />
        )}
        <RewardStatus
          contentType="url"
          contentId={linkId}
          rewardLevel={byUser ? 5 : 0}
          onCommentEdit={onEditRewardComment}
          className={css`
            margin-top: 1rem;
            font-size: 1.4rem;
            margin-right: -1px;
            margin-left: -1px;
            @media (max-width: ${mobileMaxWidth}) {
              margin-left: 0;
              margin-right: 0;
            }
          `}
          rewards={rewards}
        />
      </div>
      <Subjects
        className={css`
          width: 60%;
          @media (max-width: ${mobileMaxWidth}) {
            width: 100%;
          }
        `}
        contentId={linkId}
        contentType="url"
        loadMoreButton={subjectsLoadMoreButton}
        subjects={subjects}
        onLoadMoreSubjects={onLoadMoreSubjects}
        onLoadSubjectComments={onLoadSubjectComments}
        onSubjectEditDone={onEditSubject}
        onSubjectDelete={(subjectId) =>
          onDeleteContent({ contentType: 'subject', contentId: subjectId })
        }
        onSetRewardLevel={onSetRewardLevel}
        uploadSubject={onUploadSubject}
        commentActions={{
          editRewardComment: onEditRewardComment,
          onDelete: handleDeleteComment,
          onEditDone: onEditComment,
          onLikeClick: onLikeComment,
          onLoadMoreComments: onLoadMoreSubjectComments,
          onLoadMoreReplies: onLoadMoreSubjectReplies,
          onLoadRepliesOfReply: onLoadSubjectRepliesOfReply,
          onUploadComment: handleUploadComment,
          onUploadReply: handleUploadReply
        }}
      />
      <Comments
        autoExpand
        comments={comments}
        isLoading={loadingComments}
        inputTypeLabel="comment"
        key={'comments' + linkId}
        loadMoreButton={commentsLoadMoreButton}
        onCommentSubmit={handleUploadComment}
        onDelete={handleDeleteComment}
        onEditDone={onEditComment}
        onLikeClick={onLikeComment}
        onLoadMoreComments={onLoadMoreComments}
        onLoadMoreReplies={onLoadMoreReplies}
        onLoadRepliesOfReply={onLoadRepliesOfReply}
        onReplySubmit={handleUploadReply}
        onRewardCommentEdit={onEditRewardComment}
        parent={{
          contentType: 'url',
          contentId: linkId,
          uploader,
          pinnedCommentId
        }}
        className={css`
          border: 1px solid ${Color.borderGray()};
          padding: 1rem;
          width: 60%;
          background: #fff;
          @media (max-width: ${mobileMaxWidth}) {
            border-left: 0;
            border-right: 0;
            width: 100%;
          }
        `}
        userId={userId}
      />
      {confirmModalShown && (
        <ConfirmModal
          key={'confirm' + linkId}
          title="Remove Link"
          onConfirm={handleDeleteLink}
          onHide={() => setConfirmModalShown(false)}
        />
      )}
      {likesModalShown && (
        <UserListModal
          key={'userlist' + linkId}
          users={likes}
          userId={userId}
          title="People who liked this"
          onHide={() => setLikesModalShown(false)}
        />
      )}
    </div>
  ) : notFound ? (
    <InvalidPage />
  ) : (
    <Loading text="Loading Page..." />
  );

  async function handleDeleteLink() {
    await deleteContent({ id: linkId, contentType: 'url' });
    onDeleteContent({ contentId: linkId, contentType: 'url' });
  }

  function handleDeleteComment(data) {
    onDeleteComment(data);
    onUpdateNumLinkComments({
      id: linkId,
      updateType: 'decrease'
    });
  }

  async function handleEditLinkPage(params) {
    const data = await editContent(params);
    const { contentId, editedTitle: title, editedUrl: content } = params;
    onEditContent({
      data: {
        content: processedURL(content),
        title,
        description: data.description
      },
      contentType: 'url',
      contentId
    });
    onEditLinkPage({
      id: linkId,
      title,
      content: processedURL(content)
    });
  }

  function handleLikeLink({ likes, isUnlike }) {
    onLikeContent({ likes, contentType: 'url', contentId: linkId });
    onLikeLink({ likes, id: linkId });
    if (!xpButtonDisabled && userCanRewardThis && !isRewardedByUser) {
      onSetXpRewardInterfaceShown({
        contentId: linkId,
        contentType: 'url',
        shown: !isUnlike
      });
    } else {
      if (!isRecommendedByUser && !canReward) {
        setRecommendationInterfaceShown(!isUnlike);
      }
    }
  }

  function handleSetXpRewardInterfaceShown() {
    onSetXpRewardInterfaceShown({
      contentType: 'url',
      contentId: linkId,
      shown: true
    });
  }

  function handleSetByUserStatus(byUser) {
    onSetByUserStatus({ contentId: linkId, contentType: 'url', byUser });
  }

  function handleUploadComment(params) {
    onUploadComment(params);
    onUpdateNumLinkComments({
      id: linkId,
      updateType: 'increase'
    });
  }

  function handleUploadReply(data) {
    onUploadReply(data);
    onUpdateNumLinkComments({
      id: linkId,
      updateType: 'increase'
    });
  }
}
