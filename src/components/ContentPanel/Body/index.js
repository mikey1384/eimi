import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import LocalContext from '../Context';
import LikeButton from 'components/Buttons/LikeButton';
import StarButton from 'components/Buttons/StarButton';
import Button from 'components/Button';
import Likers from 'components/Likers';
import UserListModal from 'components/Modals/UserListModal';
import XPVideoPlayer from 'components/XPVideoPlayer';
import Comments from 'components/Comments';
import MainContent from './MainContent';
import DropdownButton from 'components/Buttons/DropdownButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import XPRewardInterface from 'components/XPRewardInterface';
import RewardStatus from 'components/RewardStatus';
import ErrorBoundary from 'components/ErrorBoundary';
import FileViewer from 'components/FileViewer';
import Icon from 'components/Icon';
import LoginToViewContent from 'components/LoginToViewContent';
import { css } from 'emotion';
import { Color, mobileMaxWidth } from 'constants/css';
import { descriptionLengthForExtraRewardLevel } from 'constants/defaultValues';
import {
  addCommasToNumber,
  getFileInfoFromFileName
} from 'helpers/stringHelpers';
import {
  determineXpButtonDisabled,
  isMobile,
  scrollElementToCenter
} from 'helpers';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';

Body.propTypes = {
  autoExpand: PropTypes.bool,
  attachedVideoShown: PropTypes.bool,
  contentObj: PropTypes.object.isRequired,
  commentsShown: PropTypes.bool,
  inputAtBottom: PropTypes.bool,
  numPreviewComments: PropTypes.number,
  onChangeSpoilerStatus: PropTypes.func.isRequired
};

export default function Body({
  attachedVideoShown,
  autoExpand,
  commentsShown,
  contentObj,
  contentObj: {
    commentsLoaded,
    contentId,
    rewardLevel,
    id,
    numChildComments,
    childComments = [],
    commentsLoadMoreButton = false,
    likes = [],
    previewLoaded,
    rootId,
    rootType,
    stars = [],
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
  const {
    requestHelpers: { deleteContent, loadComments }
  } = useAppContext();
  const {
    authLevel,
    canDelete,
    canEdit,
    canEditRewardLevel,
    canStar,
    userId
  } = useMyState();
  const {
    actions: { onSetIsEditing, onSetXpRewardInterfaceShown }
  } = useContentContext();
  const {
    description,
    filePath,
    fileName,
    fileSize,
    thumbUrl,
    isEditing,
    secretAnswer,
    secretShown,
    xpRewardInterfaceShown
  } = useContentState({
    contentType,
    contentId
  });
  const { fileType } = fileName ? getFileInfoFromFileName(fileName) : '';
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
    onAttachStar,
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
  const mounted = useRef(true);
  const CommentInputAreaRef = useRef(null);
  const RewardInterfaceRef = useRef(null);

  const secretHidden = useMemo(() => {
    const contentSecretHidden = !(secretShown || uploader.id === userId);
    const targetSubjectSecretHidden = !(
      subjectSecretShown || targetObj.subject?.uploader?.id === userId
    );
    const rootObjSecretHidden = !(
      rootSecretShown || rootObj?.uploader?.id === userId
    );
    return contentType === 'subject' && secretAnswer
      ? contentSecretHidden
      : targetObj.subject?.secretAnswer
      ? targetSubjectSecretHidden
      : !!rootObj?.secretAnswer && rootObjSecretHidden;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contentType,
    rootObj,
    rootSecretShown,
    secretAnswer,
    secretShown,
    subjectSecretShown,
    targetObj.subject,
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
    return (contentType === 'subject' &&
      (description?.length > descriptionLengthForExtraRewardLevel ||
        filePath)) ||
      contentObj.byUser
      ? 5
      : targetObj.subject?.rewardLevel || rootRewardLevel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contentObj.byUser,
    contentType,
    description,
    filePath,
    rootObj.rewardLevel,
    rootType,
    targetObj.subject
  ]);

  const xpButtonDisabled = useMemo(
    () =>
      determineXpButtonDisabled({
        stars,
        rewardLevel: finalRewardLevel,
        myId: userId,
        xpRewardInterfaceShown
      }),
    [finalRewardLevel, stars, userId, xpRewardInterfaceShown]
  );

  const editMenuItems = useMemo(() => {
    const items = [];
    if (userId === uploader.id || canEdit) {
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
    mounted.current = true;
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
        isPreview
      });
      if (mounted.current) {
        onLoadComments({
          ...data,
          contentId,
          contentType,
          isPreview
        });
        setLoadingComments(false);
      }
    }
    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editButtonShown = useMemo(() => {
    const isForSecretSubject =
      (!!rootObj?.secretAnswer &&
        !(
          rootObj?.uploader?.id === userId ||
          authLevel > rootObj?.uploader?.authLevel
        )) ||
      (!!targetObj?.subject?.secretAnswer &&
        !(
          targetObj?.subject?.uploader?.id === userId ||
          authLevel > targetObj?.subject?.uploader?.authLevel
        ));
    const userCanEditThis =
      (canEdit || canDelete) && authLevel > uploader.authLevel;
    return (userId === uploader.id && !isForSecretSubject) || userCanEditThis;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authLevel,
    canDelete,
    canEdit,
    rootObj,
    targetObj,
    uploader.authLevel,
    uploader.id,
    userId
  ]);

  const userCanRewardThis = useMemo(
    () => canStar && authLevel > uploader.authLevel && userId !== uploader.id,
    [authLevel, canStar, uploader.authLevel, uploader.id, userId]
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
      <div style={{ width: '100%' }}>
        {contentType === 'subject' &&
          filePath &&
          (userId ? (
            <FileViewer
              autoPlay
              contentId={contentId}
              contentType={contentType}
              isMuted={!autoExpand}
              fileName={fileName}
              filePath={filePath}
              fileSize={fileSize}
              thumbUrl={thumbUrl}
              videoHeight="100%"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1rem',
                ...(fileType === 'audio'
                  ? {
                      padding: '1rem'
                    }
                  : {}),
                marginBottom: rewardLevel ? '1rem' : 0
              }}
            />
          ) : (
            <LoginToViewContent />
          ))}
        {contentType === 'comment' && attachedVideoShown && (
          <XPVideoPlayer
            stretch
            autoplay
            rewardLevel={rootObj.rewardLevel}
            byUser={!!rootObj.byUser}
            title={rootObj.title}
            style={{ marginBottom: '1rem' }}
            uploader={rootObj.uploader}
            hasHqThumb={rootObj.hasHqThumb}
            videoId={rootId}
            videoCode={rootObj.content}
          />
        )}
        <MainContent
          contentId={contentId}
          contentType={contentType}
          secretHidden={secretHidden}
          myId={userId}
          onClickSecretAnswer={onSecretAnswerClick}
        />
        {!isEditing && !secretHidden && (
          <div
            className="bottom-interface"
            style={{
              marginBottom:
                likes.length > 0 &&
                !(stars.length > 0) &&
                !commentsShown &&
                !xpRewardInterfaceShown &&
                '0.5rem'
            }}
          >
            <div className="buttons-bar">
              <div className="left">
                <LikeButton
                  contentType={contentType}
                  contentId={contentId}
                  likes={likes}
                  key="likeButton"
                  onClick={handleLikeClick}
                  small
                />
                <Button
                  transparent
                  key="commentButton"
                  style={{ marginLeft: '1rem' }}
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
                  {numChildComments > 0 && !commentsShown && !autoExpand && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      ({numChildComments})
                    </span>
                  )}
                </Button>
                {userCanRewardThis && (
                  <Button
                    color="pink"
                    disabled={!!xpButtonDisabled}
                    style={{ marginLeft: '1rem' }}
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
                    direction="right"
                    style={{ marginLeft: '0.5rem', display: 'inline-block' }}
                    size={contentType !== 'subject' ? 'sm' : null}
                    menuProps={editMenuItems}
                  />
                )}
                <div style={{ position: 'relative', marginLeft: '1rem' }}>
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
              </div>
              <div
                className="right"
                style={{ position: 'relative', marginRight: 0 }}
              >
                {canEditRewardLevel &&
                  (contentType === 'subject' || contentType === 'video') && (
                    <StarButton
                      byUser={!!contentObj.byUser}
                      contentId={contentObj.id}
                      rewardLevel={rewardLevel}
                      onSetRewardLevel={onSetRewardLevel}
                      onToggleByUser={onToggleByUser}
                      contentType={contentType}
                      uploader={uploader}
                    />
                  )}
              </div>
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
        {xpRewardInterfaceShown && (
          <XPRewardInterface
            innerRef={RewardInterfaceRef}
            contentType={contentType}
            contentId={contentId}
            rewardLevel={finalRewardLevel}
            uploaderId={uploader.id}
            stars={stars}
            onRewardSubmit={(data) => {
              onSetXpRewardInterfaceShown({
                contentType,
                contentId,
                shown: false
              });
              onAttachStar({ data, contentId, contentType });
            }}
          />
        )}
        <RewardStatus
          contentType={contentType}
          rewardLevel={finalRewardLevel}
          onCommentEdit={onEditRewardComment}
          stars={stars}
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
        <Comments
          autoFocus={false}
          autoExpand={
            (autoExpand && !secretHidden) ||
            (contentType === 'subject' && secretHidden)
          }
          comments={childComments}
          commentsLoadLimit={commentsLoadLimit}
          commentsShown={commentsShown && !secretHidden}
          contentId={contentId}
          inputAreaInnerRef={CommentInputAreaRef}
          inputAtBottom={inputAtBottom}
          loadMoreButton={commentsLoadMoreButton}
          inputTypeLabel={contentType === 'comment' ? 'reply' : 'comment'}
          isLoading={loadingComments}
          numPreviews={numPreviewComments}
          onAttachStar={onAttachStar}
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
          subject={contentObj.targetObj?.subject}
          commentsHidden={secretHidden}
          style={{
            padding: '0 1rem',
            paddingBottom:
              childComments.length > 0 || commentsShown ? '0.5rem' : 0
          }}
          userId={userId}
        />
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
    onCommentSubmit(params);
    if (contentObj.secretAnswer) {
      if (contentType === 'subject') {
        if (!secretShown) {
          await handleExpandComments();
        }
        onChangeSpoilerStatus({ shown: true, subjectId: contentObj.id });
      }
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
    if (!isMobile(navigator)) {
      CommentInputAreaRef.current.focus();
    }
    scrollElementToCenter(CommentInputAreaRef.current);
  }

  function onSecretAnswerClick() {
    CommentInputAreaRef.current.focus();
  }

  async function deleteThisContent() {
    await deleteContent({ contentType, id, filePath, fileName });
    if (contentType === 'comment') {
      onDeleteComment(id);
    } else {
      onDeleteContent({ contentType, contentId: id });
    }
  }

  async function handleExpandComments() {
    const data = await loadComments({
      contentType,
      contentId,
      limit: commentsLoadLimit
    });
    onLoadComments({ ...data, contentId, contentType });
    onSetCommentsShown({ contentId, contentType });
  }

  async function handleLikeClick() {
    if (!commentsShown) {
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

  function onToggleByUser(byUser) {
    onByUserStatusChange({ byUser, contentId, contentType });
  }
}
