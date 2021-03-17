import PropTypes from 'prop-types';
import React, {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import DropdownButton from 'components/Buttons/DropdownButton';
import Likers from 'components/Likers';
import UserListModal from 'components/Modals/UserListModal';
import EditTextArea from 'components/Texts/EditTextArea';
import UsernameText from 'components/Texts/UsernameText';
import ProfilePic from 'components/ProfilePic';
import Button from 'components/Button';
import LikeButton from 'components/Buttons/LikeButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import LongText from 'components/Texts/LongText';
import RewardStatus from 'components/RewardStatus';
import RecommendationInterface from 'components/RecommendationInterface';
import RecommendationStatus from 'components/RecommendationStatus';
import SecretComment from 'components/SecretComment';
import XPRewardInterface from 'components/XPRewardInterface';
import SubjectLink from '../SubjectLink';
import Icon from 'components/Icon';
import LoginToViewContent from 'components/LoginToViewContent';
import ContentFileViewer from 'components/ContentFileViewer';
import { css } from '@emotion/css';
import { useHistory } from 'react-router-dom';
import { commentContainer } from '../Styles';
import { timeSince } from 'helpers/timeStampHelpers';
import { useContentState, useMyState } from 'helpers/hooks';
import {
  determineUserCanRewardThis,
  determineXpButtonDisabled,
  scrollElementToCenter
} from 'helpers';
import { borderRadius, Color } from 'constants/css';
import { getFileInfoFromFileName, stringIsEmpty } from 'helpers/stringHelpers';
import { useAppContext, useContentContext } from 'contexts';
import LocalContext from '../Context';

Comment.propTypes = {
  comment: PropTypes.shape({
    commentId: PropTypes.number,
    content: PropTypes.string.isRequired,
    deleted: PropTypes.bool,
    id: PropTypes.number.isRequired,
    likes: PropTypes.array,
    numReplies: PropTypes.number,
    profilePicUrl: PropTypes.string,
    recommendationInterfaceShown: PropTypes.bool,
    recommendations: PropTypes.array,
    replies: PropTypes.array,
    replyId: PropTypes.number,
    rewards: PropTypes.array,
    targetObj: PropTypes.object,
    targetUserName: PropTypes.string,
    targetUserId: PropTypes.number,
    timeStamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    uploader: PropTypes.object.isRequired,
    filePath: PropTypes.string,
    fileName: PropTypes.string,
    fileSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thumbUrl: PropTypes.string,
    isNotification: PropTypes.oneOfType([PropTypes.number, PropTypes.bool])
  }).isRequired,
  innerRef: PropTypes.func,
  isPreview: PropTypes.bool,
  parent: PropTypes.object,
  rootContent: PropTypes.shape({
    contentType: PropTypes.string
  }),
  subject: PropTypes.object
};

function Comment({
  comment,
  innerRef,
  isPreview,
  parent,
  rootContent = {},
  subject,
  comment: {
    id: commentId,
    replies = [],
    likes = [],
    recommendations = [],
    rewards = [],
    uploader,
    numReplies,
    filePath,
    fileName,
    fileSize,
    isNotification,
    thumbUrl: originalThumbUrl
  }
}) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  subject = subject || comment.targetObj?.subject || {};
  const { fileType } = getFileInfoFromFileName(fileName);
  const history = useHistory();
  const {
    requestHelpers: {
      checkIfUserResponded,
      editContent,
      updateCommentPinStatus
    }
  } = useAppContext();
  const {
    authLevel,
    canDelete,
    canEdit,
    canReward,
    twinkleCoins,
    userId
  } = useMyState();
  const {
    actions: {
      onChangeSpoilerStatus,
      onSetIsEditing,
      onSetXpRewardInterfaceShown,
      onUpdateCommentPinStatus
    }
  } = useContentContext();
  const {
    isEditing,
    thumbUrl: thumbUrlFromContext,
    xpRewardInterfaceShown
  } = useContentState({
    contentType: 'comment',
    contentId: comment.id
  });

  const thumbUrl = useMemo(() => thumbUrlFromContext || originalThumbUrl, [
    originalThumbUrl,
    thumbUrlFromContext
  ]);
  const subjectState = useContentState({
    contentType: 'subject',
    contentId: subject.id
  });
  const { onDelete, onEditDone, onLikeClick, onRewardCommentEdit } = useContext(
    LocalContext
  );

  const [
    recommendationInterfaceShown,
    setRecommendationInterfaceShown
  ] = useState(false);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [replying, setReplying] = useState(false);
  const prevReplies = useRef(replies);
  const ReplyRefs = {};
  const RewardInterfaceRef = useRef(null);

  const subjectId = useMemo(() => subjectState?.id || subject?.id, [
    subject?.id,
    subjectState?.id
  ]);
  const subjectHasSecretMessage = useMemo(
    () => !!subjectState?.secretAnswer || !!subject?.secretAnswer,
    [subject?.secretAnswer, subjectState?.secretAnswer]
  );
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

  const rewardLevel = useMemo(() => {
    if (isPreview) return 0;
    if (parent.contentType === 'subject' && parent.rewardLevel > 0) {
      return parent.rewardLevel;
    }
    if (rootContent.contentType === 'subject' && rootContent.rewardLevel > 0) {
      return rootContent.rewardLevel;
    }
    if (parent.contentType === 'video' || parent.contentType === 'url') {
      if (subject?.rewardLevel) {
        return subject?.rewardLevel;
      }
      if (parent.rewardLevel > 0) {
        return 1;
      }
    }
    if (
      rootContent.contentType === 'video' ||
      rootContent.contentType === 'url'
    ) {
      if (subject?.rewardLevel) {
        return subject?.rewardLevel;
      }
      if (rootContent.rewardLevel > 0) {
        return 1;
      }
    }
    return 0;
  }, [
    isPreview,
    parent.contentType,
    parent.rewardLevel,
    rootContent.contentType,
    rootContent.rewardLevel,
    subject
  ]);

  useEffect(() => {
    if (!isPreview) {
      if (replying && replies?.length > prevReplies.current?.length) {
        setReplying(false);
        scrollElementToCenter(ReplyRefs[replies[replies.length - 1].id]);
      }
      prevReplies.current = replies;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replies]);

  const userIsUploader = useMemo(() => uploader.id === userId, [
    uploader.id,
    userId
  ]);
  const userIsSubjectUploader = useMemo(
    () =>
      userId &&
      parent.contentType === 'subject' &&
      parent.uploader?.id === userId,
    [parent.contentType, parent.uploader?.id, userId]
  );
  const userIsHigherAuth = useMemo(() => authLevel > uploader.authLevel, [
    authLevel,
    uploader.authLevel
  ]);
  const dropdownButtonShown = useMemo(() => {
    const isForSecretSubject =
      (rootContent?.secretAnswer &&
        !(
          rootContent?.uploader?.id === userId ||
          authLevel > rootContent?.uploader?.authLevel
        )) ||
      (parent?.secretAnswer &&
        !(
          parent?.uploader?.id === userId ||
          authLevel > parent?.uploader?.authLevel
        )) ||
      (subject?.secretAnswer &&
        !(
          subject?.uploader?.id === userId ||
          authLevel > subject?.uploader?.authLevel
        ));
    const userCanEditThis = (canEdit || canDelete) && userIsHigherAuth;
    return (
      ((userIsUploader && !(isForSecretSubject || isNotification)) ||
        userCanEditThis ||
        (userIsSubjectUploader && !isNotification)) &&
      !isPreview
    );
  }, [
    authLevel,
    canDelete,
    canEdit,
    isNotification,
    isPreview,
    parent?.secretAnswer,
    parent?.uploader?.authLevel,
    parent?.uploader?.id,
    rootContent?.secretAnswer,
    rootContent?.uploader?.authLevel,
    rootContent?.uploader?.id,
    subject?.secretAnswer,
    subject?.uploader?.authLevel,
    subject?.uploader?.id,
    userId,
    userIsHigherAuth,
    userIsSubjectUploader,
    userIsUploader
  ]);

  const dropdownMenuItems = useMemo(() => {
    const items = [];
    if (userIsSubjectUploader) {
      items.push({
        label: (
          <>
            <Icon icon={['fas', 'thumbtack']} />
            <span style={{ marginLeft: '1rem' }}>Unpin</span>
          </>
        ),
        onClick: () => handleUnPinComment()
      });
    }
    if ((userIsUploader || canEdit) && !isNotification) {
      items.push({
        label: (
          <>
            <Icon icon="pencil-alt" />
            <span style={{ marginLeft: '1rem' }}>Edit</span>
          </>
        ),
        onClick: () =>
          onSetIsEditing({
            contentId: comment.id,
            contentType: 'comment',
            isEditing: true
          })
      });
    }
    if (userIsUploader || canDelete) {
      items.push({
        label: (
          <>
            <Icon icon="trash-alt" />
            <span style={{ marginLeft: '1rem' }}>Remove</span>
          </>
        ),
        onClick: () => setConfirmModalShown(true)
      });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canDelete,
    canEdit,
    comment.id,
    isNotification,
    userIsSubjectUploader,
    userIsUploader
  ]);

  const userCanRewardThis = useMemo(
    () =>
      determineUserCanRewardThis({
        canReward,
        authLevel,
        uploader,
        userId,
        recommendations
      }),
    [authLevel, canReward, recommendations, uploader, userId]
  );

  const isCommentForContentSubject = useMemo(
    () => parent.contentType !== 'subject' && !parent.subjectId && subject,
    [parent.contentType, parent.subjectId, subject]
  );

  const isHidden = useMemo(() => {
    const secretShown =
      subjectState.secretShown || subject?.uploader?.id === userId;
    return subjectHasSecretMessage && !secretShown;
  }, [
    subject?.uploader?.id,
    subjectHasSecretMessage,
    subjectState.secretShown,
    userId
  ]);

  const xpButtonDisabled = useMemo(() => {
    if (isPreview) return true;
    return determineXpButtonDisabled({
      rewardLevel,
      myId: userId,
      xpRewardInterfaceShown,
      rewards
    });
  }, [isPreview, rewardLevel, rewards, userId, xpRewardInterfaceShown]);

  useEffect(() => {
    if (mounted.current) {
      if (
        userId &&
        subjectHasSecretMessage &&
        subjectId &&
        subjectState.prevSecretViewerId !== userId
      ) {
        handleCheckSecretShown();
      }
      if (!userId) {
        onChangeSpoilerStatus({
          shown: false,
          subjectId
        });
      }
    }

    async function handleCheckSecretShown() {
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
  }, [subjectId, subjectState.prevSecretViewerId, userId]);

  return (
    <>
      <div
        style={isPreview ? { cursor: 'pointer' } : {}}
        className={commentContainer}
        ref={innerRef}
      >
        <div className="content-wrapper">
          <aside>
            <ProfilePic
              style={{ height: '5rem', width: '5rem' }}
              userId={uploader?.id}
              profilePicUrl={uploader.profilePicUrl}
            />
          </aside>
          {dropdownButtonShown && !isEditing && (
            <div className="dropdown-wrapper">
              <DropdownButton
                skeuomorphic
                icon="chevron-down"
                color="darkerGray"
                direction="left"
                opacity={0.8}
                menuProps={dropdownMenuItems}
              />
            </div>
          )}
          <section>
            <div>
              <UsernameText className="username" user={uploader} />{' '}
              <small className="timestamp">
                <a
                  className={css`
                    &:hover {
                      text-decoration: ${isNotification ? 'none' : 'underline'};
                    }
                  `}
                  style={{ cursor: isNotification ? 'default' : 'pointer' }}
                  onClick={() =>
                    isNotification
                      ? null
                      : history.push(`/comments/${comment.id}`)
                  }
                >
                  {timeSince(comment.timeStamp)}
                </a>
              </small>
            </div>
            <div>
              {comment.targetUserId &&
                !!comment.replyId &&
                comment.replyId !== parent.contentId && (
                  <span className="to">
                    to:{' '}
                    <UsernameText
                      user={{
                        username: comment.targetUserName,
                        id: comment.targetUserId
                      }}
                    />
                  </span>
                )}
              {filePath &&
                (userId ? (
                  <div style={{ width: '100%', paddingTop: '3rem' }}>
                    <ContentFileViewer
                      contentId={comment.id}
                      contentType="comment"
                      fileName={fileName}
                      filePath={filePath}
                      fileSize={Number(fileSize)}
                      thumbUrl={thumbUrl}
                      videoHeight="100%"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: stringIsEmpty(comment.content)
                          ? fileType === 'audio'
                            ? '2rem'
                            : '1rem'
                          : 0
                      }}
                    />
                  </div>
                ) : (
                  <LoginToViewContent />
                ))}
              {isEditing ? (
                <EditTextArea
                  allowEmptyText={!!filePath}
                  style={{ marginBottom: '1rem' }}
                  contentType="comment"
                  contentId={comment.id}
                  text={comment.content}
                  onCancel={() =>
                    onSetIsEditing({
                      contentId: comment.id,
                      contentType: 'comment',
                      isEditing: false
                    })
                  }
                  onEditDone={handleEditDone}
                />
              ) : (
                <div>
                  {isCommentForContentSubject && (
                    <SubjectLink subject={subject} />
                  )}
                  {isHidden ? (
                    <SecretComment
                      onClick={() => history.push(`/subjects/${subject?.id}`)}
                    />
                  ) : isNotification ? (
                    <div
                      style={{
                        color: Color.gray(),
                        fontWeight: 'bold',
                        margin: '1rem 0',
                        borderRadius
                      }}
                    >
                      {uploader.username} viewed the secret message
                    </div>
                  ) : (
                    !stringIsEmpty(comment.content) && (
                      <LongText className="comment__content">
                        {comment.content}
                      </LongText>
                    )
                  )}
                  {!isPreview && !isHidden && !isNotification && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div className="comment__buttons">
                          <LikeButton
                            contentType="comment"
                            contentId={comment.id}
                            onClick={handleLikeClick}
                            likes={likes}
                          />
                          <Button
                            transparent
                            style={{ marginLeft: '1rem' }}
                            onClick={() =>
                              history.push(`/comments/${comment.id}`)
                            }
                          >
                            <Icon icon="comment-alt" />
                            <span style={{ marginLeft: '1rem' }}>
                              {numReplies > 1 &&
                              parent.contentType === 'comment'
                                ? 'Replies'
                                : 'Reply'}
                              {numReplies > 0 &&
                              parent.contentType === 'comment'
                                ? ` (${numReplies})`
                                : ''}
                            </span>
                          </Button>
                          {userCanRewardThis && (
                            <Button
                              color="pink"
                              style={{ marginLeft: '0.7rem' }}
                              onClick={() =>
                                onSetXpRewardInterfaceShown({
                                  contentId: commentId,
                                  contentType: 'comment',
                                  shown: true
                                })
                              }
                              disabled={!!xpButtonDisabled}
                            >
                              <Icon icon="certificate" />
                              <span style={{ marginLeft: '0.7rem' }}>
                                {xpButtonDisabled || 'Reward'}
                              </span>
                            </Button>
                          )}
                        </div>
                        <Likers
                          className="comment__likes"
                          userId={userId}
                          likes={likes}
                          onLinkClick={() => setUserListModalShown(true)}
                        />
                      </div>
                      <div>
                        <Button
                          color="brownOrange"
                          filled={isRecommendedByUser}
                          disabled={recommendationInterfaceShown}
                          onClick={() => setRecommendationInterfaceShown(true)}
                        >
                          <Icon icon="star" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isPreview && (
              <RecommendationStatus
                style={{ marginTop: likes.length > 0 ? '0.5rem' : '1rem' }}
                contentType="comment"
                recommendations={recommendations}
              />
            )}
            {!isPreview && recommendationInterfaceShown && (
              <RecommendationInterface
                style={{ marginTop: likes.length > 0 ? '0.5rem' : '1rem' }}
                contentId={commentId}
                contentType="comment"
                onHide={() => setRecommendationInterfaceShown(false)}
                recommendations={recommendations}
                uploaderId={uploader.id}
              />
            )}
            {!isPreview && xpRewardInterfaceShown && (
              <XPRewardInterface
                innerRef={RewardInterfaceRef}
                rewardLevel={rewardLevel}
                rewards={rewards}
                contentType="comment"
                contentId={comment.id}
                onReward={() =>
                  setRecommendationInterfaceShown(
                    !isRecommendedByUser && twinkleCoins > 0
                  )
                }
                uploaderId={uploader.id}
              />
            )}
            {!isPreview && (
              <RewardStatus
                rewardLevel={rewardLevel}
                noMarginForEditButton
                onCommentEdit={onRewardCommentEdit}
                style={{
                  fontSize: '1.5rem',
                  marginTop: likes?.length > 0 ? '0.5rem' : '1rem'
                }}
                rewards={rewards}
                uploaderName={uploader.username}
              />
            )}
          </section>
        </div>
        {userListModalShown && (
          <UserListModal
            onHide={() => setUserListModalShown(false)}
            title="People who liked this comment"
            users={likes}
          />
        )}
      </div>
      {confirmModalShown && (
        <ConfirmModal
          onHide={() => setConfirmModalShown(false)}
          title="Remove Comment"
          onConfirm={() => onDelete(comment.id)}
        />
      )}
    </>
  );

  async function handleEditDone(editedComment) {
    await editContent({
      editedComment,
      contentId: comment.id,
      contentType: 'comment'
    });
    if (mounted.current) {
      onEditDone({ editedComment, commentId: comment.id });
    }
    if (mounted.current) {
      onSetIsEditing({
        contentId: comment.id,
        contentType: 'comment',
        isEditing: false
      });
    }
  }

  function handleLikeClick({ likes, isUnlike }) {
    if (!xpButtonDisabled && userCanRewardThis && !isRewardedByUser) {
      onSetXpRewardInterfaceShown({
        contentId: comment.id,
        contentType: 'comment',
        shown: !isUnlike
      });
    } else {
      if (!isRecommendedByUser && !canReward) {
        setRecommendationInterfaceShown(!isUnlike);
      }
    }
    onLikeClick({ commentId: comment.id, likes });
  }

  async function handleUnPinComment() {
    await updateCommentPinStatus({ commentId: null, subjectId });
    onUpdateCommentPinStatus({ subjectId, commentId: null });
  }
}

export default memo(Comment);
