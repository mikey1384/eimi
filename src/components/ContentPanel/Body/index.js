import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import LocalContext from '../Context';
import LikeButton from 'components/Buttons/LikeButton';
import StarButton from 'components/Buttons/StarButton';
import Button from 'components/Button';
import Likers from 'components/Likers';
import UserListModal from 'components/Modals/UserListModal';
import Comments from 'components/Comments';
import MainContent from './MainContent';
import DropdownButton from 'components/Buttons/DropdownButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import XPRewardInterface from 'components/XPRewardInterface';
import RecommendationInterface from 'components/RecommendationInterface';
import RewardStatus from 'components/RewardStatus';
import RecommendationStatus from 'components/RecommendationStatus';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { addCommasToNumber } from 'helpers/stringHelpers';
import {
  determineUserCanRewardThis,
  determineXpButtonDisabled,
  isMobile,
  scrollElementToCenter
} from 'helpers';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';

Body.propTypes = {
  autoExpand: PropTypes.bool,
  contentObj: PropTypes.object.isRequired,
  commentsShown: PropTypes.bool,
  inputAtBottom: PropTypes.bool,
  numPreviewComments: PropTypes.number,
  onChangeSpoilerStatus: PropTypes.func.isRequired
};

const deviceIsMobile = isMobile(navigator);

export default function Body({
  autoExpand,
  commentsShown,
  contentObj,
  contentObj: {
    commentsLoaded,
    contentId,
    filePath,
    rewardLevel,
    id,
    numComments,
    numReplies,
    comments = [],
    commentsLoadMoreButton = false,
    isNotification,
    likes = [],
    previewLoaded,
    recommendations = [],
    rootId,
    rootType,
    rewards = [],
    rootObj = {},
    targetObj = {},
    contentType,
    uploader = {},
    views
  },
  inputAtBottom,
  numPreviewComments,
  onChangeSpoilerStatus
}) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  const {
    requestHelpers: { deleteContent, loadComments }
  } = useAppContext();

  const { authLevel, canDelete, canEdit, canReward, twinkleCoins, userId } =
    useMyState();

  const {
    actions: { onSetIsEditing, onSetXpRewardInterfaceShown }
  } = useContentContext();

  const {
    isEditing,
    secretAnswer,
    secretAttachment,
    secretShown,
    xpRewardInterfaceShown
  } = useContentState({
    contentType,
    contentId
  });

  const { secretShown: rootSecretShown } = useContentState({
    contentId: rootId,
    contentType: rootType
  });
  const { secretShown: subjectSecretShown } = useContentState({
    contentId: targetObj.subject?.id,
    contentType: 'subject'
  });
  const {
    commentsLoadLimit,
    onByUserStatusChange,
    onCommentSubmit,
    onDeleteComment,
    onDeleteContent,
    onEditComment,
    onEditRewardComment,
    onLoadComments,
    onLikeContent,
    onLoadMoreComments,
    onLoadMoreReplies,
    onLoadRepliesOfReply,
    onReplySubmit,
    onSetCommentsShown,
    onSetRewardLevel
  } = useContext(LocalContext);
  const [copiedShown, setCopiedShown] = useState(false);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [recommendationInterfaceShown, setRecommendationInterfaceShown] =
    useState(false);
  const CommentInputAreaRef = useRef(null);
  const RewardInterfaceRef = useRef(null);

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

  const secretHidden = useMemo(() => {
    const contentSecretHidden = !(secretShown || uploader.id === userId);
    const targetSubjectSecretHidden = !(
      subjectSecretShown || targetObj.subject?.uploader?.id === userId
    );
    const rootObjSecretHidden = !(
      rootSecretShown || rootObj?.uploader?.id === userId
    );
    return contentType === 'subject' && (secretAnswer || secretAttachment)
      ? contentSecretHidden
      : targetObj.subject?.secretAnswer || targetObj.subject?.secretAttachment
      ? targetSubjectSecretHidden
      : !!rootObj?.secretAnswer && rootObjSecretHidden;
  }, [
    contentType,
    rootObj?.secretAnswer,
    rootObj?.uploader?.id,
    rootSecretShown,
    secretAnswer,
    secretAttachment,
    secretShown,
    subjectSecretShown,
    targetObj.subject?.secretAnswer,
    targetObj.subject?.secretAttachment,
    targetObj.subject?.uploader?.id,
    uploader.id,
    userId
  ]);

  const finalRewardLevel = useMemo(() => {
    const rootRewardLevel =
      rootType === 'video' || rootType === 'url'
        ? rootObj.rewardLevel > 0
          ? 1
          : 0
        : rootObj.rewardLevel;
    return contentObj.byUser
      ? 5
      : targetObj.subject?.rewardLevel || rootRewardLevel;
  }, [contentObj.byUser, rootObj.rewardLevel, rootType, targetObj.subject]);

  const xpButtonDisabled = useMemo(
    () =>
      determineXpButtonDisabled({
        rewards,
        rewardLevel: finalRewardLevel,
        myId: userId,
        xpRewardInterfaceShown
      }),
    [finalRewardLevel, rewards, userId, xpRewardInterfaceShown]
  );

  const editMenuItems = useMemo(() => {
    const items = [];
    const secretAnswerExists =
      targetObj?.contentType === 'subject' && rootObj?.secretAnswer;
    const isSecretAnswerPoster = rootObj?.uploader?.id === userId;
    const isHigherAuthThanSecretAnswerPoster =
      authLevel > rootObj?.uploader?.authLevel;
    const isForSecretSubject =
      secretAnswerExists &&
      !(isSecretAnswerPoster || isHigherAuthThanSecretAnswerPoster);
    if ((userId === uploader.id || canEdit) && !isForSecretSubject) {
      items.push({
        label: 'Edit',
        onClick: () =>
          onSetIsEditing({ contentId, contentType, isEditing: true })
      });
    }
    if (userId === uploader.id || canDelete) {
      items.push({
        label: 'Remove',
        onClick: () => setConfirmModalShown(true)
      });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canDelete, canEdit, contentId, contentType, uploader.id, userId]);

  useEffect(() => {
    if (!commentsLoaded && !(numPreviewComments > 0 && previewLoaded)) {
      loadInitialComments(numPreviewComments);
    }

    async function loadInitialComments(numPreviewComments) {
      if (!numPreviewComments) {
        setLoadingComments(true);
      }
      const isPreview = !!numPreviewComments;
      const data = await loadComments({
        contentType,
        contentId,
        limit: numPreviewComments || commentsLoadLimit,
        isPreview,
        parentHasSecretMessage: !!secretAnswer || !!secretAttachment
      });
      if (mounted.current) {
        onLoadComments({
          ...data,
          contentId,
          contentType,
          isPreview
        });
      }
      if (mounted.current) {
        setLoadingComments(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editButtonShown = useMemo(() => {
    const userCanEditThis =
      (canEdit || canDelete) && authLevel > uploader.authLevel;
    return (userId === uploader.id && !isNotification) || userCanEditThis;
  }, [authLevel, canDelete, canEdit, isNotification, uploader, userId]);

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

  useEffect(() => {
    onSetXpRewardInterfaceShown({
      contentType,
      contentId,
      shown: xpRewardInterfaceShown && userCanRewardThis
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%'
        }}
      >
        <MainContent
          contentId={contentId}
          contentType={contentType}
          secretHidden={secretHidden}
          userId={userId}
          onClickSecretAnswer={onSecretAnswerClick}
        />
        {!isEditing && !isNotification && (
          <div
            className="bottom-interface"
            style={{
              marginBottom:
                likes.length > 0 &&
                !(rewards.length > 0) &&
                !commentsShown &&
                !xpRewardInterfaceShown &&
                '0.5rem'
            }}
          >
            <div
              className={css`
                margin-top: ${secretHidden ? '0.5rem' : '1.5rem'};
                display: flex;
                justify-content: space-between;
                align-items: center;
                .left {
                  display: flex;
                  align-items: center;
                  button,
                  span {
                    font-size: 1.4rem;
                  }
                  @media (max-width: ${mobileMaxWidth}) {
                    button,
                    span {
                      font-size: 1rem;
                    }
                  }
                }
                .right {
                  flex-grow: 1;
                  display: flex;
                  justify-content: flex-end;
                  align-items: center;
                  @media (max-width: ${mobileMaxWidth}) {
                    button {
                      font-size: 1rem;
                    }
                  }
                }
              `}
            >
              {contentType !== 'pass' && (
                <div className="left">
                  {!secretHidden && (
                    <LikeButton
                      contentType={contentType}
                      contentId={contentId}
                      likes={likes}
                      key="likeButton"
                      onClick={handleLikeClick}
                      small
                    />
                  )}
                  {!secretHidden && (
                    <Button
                      transparent
                      key="commentButton"
                      className={css`
                        margin-left: 1rem;
                        @media (max-width: ${mobileMaxWidth}) {
                          margin-left: 0.5rem;
                        }
                      `}
                      onClick={handleCommentButtonClick}
                    >
                      <Icon icon="comment-alt" />
                      <span style={{ marginLeft: '0.7rem' }}>
                        {contentType === 'video' || contentType === 'url'
                          ? 'Comment'
                          : contentType === 'subject'
                          ? 'Respond'
                          : 'Reply'}
                      </span>
                      {(numComments > 0 || numReplies > 0) &&
                        !commentsShown &&
                        !autoExpand && (
                          <span style={{ marginLeft: '0.5rem' }}>
                            ({numComments || numReplies})
                          </span>
                        )}
                    </Button>
                  )}
                  {userCanRewardThis && !secretHidden && (
                    <Button
                      color="pink"
                      disabled={!!xpButtonDisabled}
                      className={css`
                        margin-left: 1rem;
                        @media (max-width: ${mobileMaxWidth}) {
                          margin-left: 0.5rem;
                        }
                      `}
                      onClick={handleSetXpRewardInterfaceShown}
                    >
                      <Icon icon="certificate" />
                      <span style={{ marginLeft: '0.7rem' }}>
                        {xpButtonDisabled || 'Reward'}
                      </span>
                    </Button>
                  )}
                  {editButtonShown && (
                    <DropdownButton
                      transparent
                      style={{
                        marginLeft: secretHidden ? 0 : '0.5rem',
                        display: 'inline-block'
                      }}
                      size={contentType !== 'subject' ? 'sm' : null}
                      menuProps={editMenuItems}
                    />
                  )}
                  {!secretHidden && (
                    <div
                      className={css`
                        margin-left: 1rem;
                        @media (max-width: ${mobileMaxWidth}) {
                          margin-left: 0;
                        }
                      `}
                      style={{ position: 'relative' }}
                    >
                      <Button
                        transparent
                        onClick={() => {
                          setCopiedShown(true);
                          handleCopyToClipboard();
                          setTimeout(() => setCopiedShown(false), 700);
                        }}
                      >
                        <Icon icon="copy" />
                      </Button>
                      <div
                        style={{
                          zIndex: 300,
                          display: copiedShown ? 'block' : 'none',
                          marginTop: '0.2rem',
                          position: 'absolute',
                          background: '#fff',
                          fontSize: '1.2rem',
                          padding: '1rem',
                          border: `1px solid ${Color.borderGray()}`
                        }}
                      >
                        Copied!
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!secretHidden && (
                <div
                  className="right"
                  style={{ position: 'relative', marginRight: 0 }}
                >
                  {false && (
                    <Button
                      color="brownOrange"
                      filled={isRecommendedByUser}
                      disabled={recommendationInterfaceShown}
                      onClick={() => setRecommendationInterfaceShown(true)}
                    >
                      <Icon icon="star" />
                    </Button>
                  )}
                  {(contentType === 'subject' ||
                    contentType === 'video' ||
                    contentType === 'url') && (
                    <StarButton
                      style={{ marginLeft: '1rem' }}
                      byUser={!!contentObj.byUser}
                      contentId={contentObj.id}
                      filePath={filePath}
                      rewardLevel={rewardLevel}
                      onSetRewardLevel={onSetRewardLevel}
                      onToggleByUser={handleToggleByUser}
                      contentType={contentType}
                      uploader={uploader}
                    />
                  )}
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }}
            >
              <Likers
                className="content-panel__likes"
                userId={userId}
                likes={likes}
                onLinkClick={() => setUserListModalShown(true)}
              />
              {views > 10 && contentType === 'video' && (
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.7rem'
                  }}
                >
                  {addCommasToNumber(views)} view
                  {`${views > 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          </div>
        )}
        {false && (
          <RecommendationStatus
            style={{ marginBottom: '1rem' }}
            contentType={contentType}
            recommendations={recommendations}
          />
        )}
        {recommendationInterfaceShown && (
          <RecommendationInterface
            contentId={contentId}
            contentType={contentType}
            onHide={() => setRecommendationInterfaceShown(false)}
            recommendations={recommendations}
            uploaderId={uploader.id}
          />
        )}
        {xpRewardInterfaceShown && (
          <XPRewardInterface
            innerRef={RewardInterfaceRef}
            isRecommendedByUser={isRecommendedByUser}
            contentType={contentType}
            contentId={contentId}
            onReward={() =>
              setRecommendationInterfaceShown(
                !isRecommendedByUser && twinkleCoins > 0
              )
            }
            rewardLevel={finalRewardLevel}
            uploaderAuthLevel={uploader.authLevel}
            uploaderId={uploader.id}
            rewards={rewards}
          />
        )}
        <RewardStatus
          contentType={contentType}
          contentId={contentId}
          rewardLevel={finalRewardLevel}
          onCommentEdit={onEditRewardComment}
          rewards={rewards}
          className={css`
            margin-top: ${secretHidden && rewardLevel ? '1rem' : ''};
            margin-left: -1px;
            margin-right: -1px;
            @media (max-width: ${mobileMaxWidth}) {
              margin-left: 0px;
              margin-right: 0px;
            }
          `}
        />
        {!isNotification && (
          <Comments
            autoExpand={
              (autoExpand && !secretHidden) ||
              (contentType === 'subject' && secretHidden)
            }
            comments={comments}
            commentsLoadLimit={commentsLoadLimit}
            commentsShown={commentsShown && !secretHidden}
            contentId={contentId}
            inputAreaInnerRef={CommentInputAreaRef}
            inputAtBottom={inputAtBottom}
            loadMoreButton={commentsLoadMoreButton}
            inputTypeLabel={contentType === 'comment' ? 'reply' : 'comment'}
            isLoading={loadingComments}
            numPreviews={numPreviewComments}
            onCommentSubmit={handleCommentSubmit}
            onDelete={onDeleteComment}
            onEditDone={onEditComment}
            onLikeClick={({ commentId, likes }) =>
              onLikeContent({
                likes,
                contentId: commentId,
                contentType: 'comment'
              })
            }
            onLoadMoreComments={onLoadMoreComments}
            onLoadMoreReplies={onLoadMoreReplies}
            onPreviewClick={handleExpandComments}
            onLoadRepliesOfReply={onLoadRepliesOfReply}
            onReplySubmit={onReplySubmit}
            onRewardCommentEdit={onEditRewardComment}
            parent={contentObj}
            rootContent={rootObj}
            showSecretButtonAvailable={
              contentType === 'subject' && secretHidden
            }
            subject={contentObj.targetObj?.subject}
            commentsHidden={secretHidden}
            style={{
              padding: '0 1rem 0.5rem 1rem'
            }}
            userId={userId}
          />
        )}
        {userListModalShown && (
          <UserListModal
            onHide={() => setUserListModalShown(false)}
            title={`People who liked this ${contentType}`}
            users={likes}
          />
        )}
      </div>
      {confirmModalShown && (
        <ConfirmModal
          onConfirm={deleteThisContent}
          onHide={() => setConfirmModalShown(false)}
          title={`Remove ${
            contentType.charAt(0).toUpperCase() + contentType.slice(1)
          }`}
        />
      )}
    </ErrorBoundary>
  );

  async function handleCommentSubmit(params) {
    if (
      contentType === 'subject' &&
      (contentObj.secretAnswer || contentObj.secretAttachment) &&
      !secretShown
    ) {
      await handleExpandComments();
      if (mounted.current) {
        onChangeSpoilerStatus({
          shown: true,
          subjectId: contentObj.id,
          prevSecretViewerId: userId
        });
      }
    } else {
      onCommentSubmit(params);
    }
  }

  function handleSetXpRewardInterfaceShown() {
    onSetXpRewardInterfaceShown({
      contentType,
      contentId,
      shown: true
    });
  }

  async function handleCommentButtonClick() {
    if (!commentsShown && !(autoExpand && !secretHidden)) {
      await handleExpandComments();
    }
    if (!deviceIsMobile) {
      CommentInputAreaRef.current?.focus();
    }
    scrollElementToCenter(CommentInputAreaRef.current);
  }

  function onSecretAnswerClick() {
    CommentInputAreaRef.current?.focus();
  }

  async function deleteThisContent() {
    await deleteContent({ contentType, id });
    if (contentType === 'comment') {
      onDeleteComment(id);
    } else {
      onDeleteContent({ contentType, contentId: id });
    }
  }

  async function handleExpandComments() {
    setLoadingComments(true);
    const data = await loadComments({
      contentType,
      contentId,
      limit: commentsLoadLimit,
      parentHasSecretMessage: !!secretAnswer || !!secretAttachment
    });
    if (mounted.current) {
      onLoadComments({ ...data, contentId, contentType });
    }
    if (mounted.current) {
      onSetCommentsShown({ contentId, contentType });
    }
    if (mounted.current) {
      setLoadingComments(false);
    }
  }

  async function handleLikeClick({ isUnlike }) {
    if (!xpButtonDisabled && userCanRewardThis && !isRewardedByUser) {
      onSetXpRewardInterfaceShown({
        contentType,
        contentId,
        shown: !isUnlike
      });
    } else {
      if (!isRecommendedByUser && !canReward) {
        setRecommendationInterfaceShown(!isUnlike);
      }
    }
    if (!isUnlike && !commentsShown) {
      handleExpandComments();
    }
  }

  function handleCopyToClipboard() {
    const textField = document.createElement('textarea');
    textField.innerText = `https://www.twin-kle.com/${
      contentType === 'url' ? 'link' : contentType
    }s/${contentId}`;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }

  function handleToggleByUser(byUser) {
    onByUserStatusChange({ byUser, contentId, contentType });
  }
}
