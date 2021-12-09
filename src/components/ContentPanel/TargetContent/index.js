import React, { useEffect, useMemo, useRef, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import LocalContext from '../Context';
import UsernameText from 'components/Texts/UsernameText';
import Button from 'components/Button';
import LikeButton from 'components/Buttons/LikeButton';
import Likers from 'components/Likers';
import UserListModal from 'components/Modals/UserListModal';
import InputForm from 'components/Forms/InputForm';
import Comment from './Comment';
import LongText from 'components/Texts/LongText';
import ContentLink from 'components/ContentLink';
import RecommendationStatus from 'components/RecommendationStatus';
import RecommendationInterface from 'components/RecommendationInterface';
import RewardStatus from 'components/RewardStatus';
import XPRewardInterface from 'components/XPRewardInterface';
import ErrorBoundary from 'components/ErrorBoundary';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import ContentFileViewer from 'components/ContentFileViewer';
import SecretComment from 'components/SecretComment';
import Icon from 'components/Icon';
import LoginToViewContent from 'components/LoginToViewContent';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { timeSince } from 'helpers/timeStampHelpers';
import {
  determineUserCanRewardThis,
  determineXpButtonDisabled,
  isMobile
} from 'helpers';
import { getFileInfoFromFileName } from 'helpers/stringHelpers';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useInputContext } from 'contexts';
import { useHistory } from 'react-router-dom';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import { v1 as uuidv1 } from 'uuid';
import localize from 'constants/localize';

const commentRemovedLabel = localize('commentRemoved');
const replyLabel = localize('reply');
const rewardLabel = localize('reward');
const deviceIsMobile = isMobile(navigator);

TargetContent.propTypes = {
  className: PropTypes.string,
  contentId: PropTypes.number,
  contentType: PropTypes.string,
  rootObj: PropTypes.object,
  rootType: PropTypes.string.isRequired,
  onShowTCReplyInput: PropTypes.func.isRequired,
  style: PropTypes.object,
  targetObj: PropTypes.object
};

export default function TargetContent({
  className,
  contentId,
  contentType,
  rootObj,
  rootType,
  onShowTCReplyInput,
  style,
  targetObj: {
    comment,
    comment: { comments = [] } = {},
    replyInputShown,
    subject,
    contentType: type
  }
}) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  const history = useHistory();
  const {
    requestHelpers: { uploadComment, uploadFile }
  } = useAppContext();
  const {
    authLevel,
    canReward,
    profilePicUrl,
    userId,
    twinkleCoins,
    username
  } = useMyState();
  const {
    actions: {
      onSetXpRewardInterfaceShown,
      onClearCommentFileUploadProgress,
      onUpdateCommentFileUploadProgress,
      onSetCommentFileUploadComplete
    }
  } = useContentContext();
  const {
    onDeleteComment,
    onEditComment,
    onEditRewardComment,
    onUploadTargetComment
  } = useContext(LocalContext);
  const { xpRewardInterfaceShown, fileUploadComplete, fileUploadProgress } =
    useContentState({
      contentType: 'comment',
      contentId: comment.id
    });
  const subjectState = useContentState({
    contentType: 'subject',
    contentId: subject?.id
  });
  const {
    state,
    actions: { onEnterComment, onSetCommentAttachment }
  } = useInputContext();
  const attachment = state['comment' + comment.id]?.attachment;
  const { fileType } = comment?.fileName
    ? getFileInfoFromFileName(comment?.fileName)
    : '';
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recommendationInterfaceShown, setRecommendationInterfaceShown] =
    useState(false);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const InputFormRef = useRef(null);
  const RewardInterfaceRef = useRef(null);
  const userCanRewardThis = useMemo(() => {
    let canRewardThis;
    if (comment && !comment.notFound) {
      canRewardThis = determineUserCanRewardThis({
        canReward,
        authLevel,
        recommendations: comment.recommendations,
        uploader: comment.uploader,
        userId
      });
    }
    return canRewardThis;
  }, [authLevel, canReward, comment, userId]);

  const uploader = useMemo(() => {
    let result = {};
    if (comment && !comment.notFound) {
      result = comment.uploader;
    }
    return result;
  }, [comment]);

  const finalRewardLevel = useMemo(() => {
    const rootRewardLevel =
      rootType === 'video' || rootType === 'url'
        ? rootObj.rewardLevel > 0
          ? 1
          : 0
        : rootObj.rewardLevel;
    return subject?.rewardLevel || rootRewardLevel;
  }, [rootObj.rewardLevel, rootType, subject]);

  const isRecommendedByUser = useMemo(() => {
    return comment
      ? comment.recommendations?.filter(
          (recommendation) => recommendation.userId === userId
        ).length > 0
      : false;
  }, [comment, userId]);

  const isRewardedByUser = useMemo(() => {
    return comment
      ? comment.rewards?.filter((reward) => reward.rewarderId === userId)
          .length > 0
      : false;
  }, [comment, userId]);

  const xpButtonDisabled = useMemo(
    () =>
      determineXpButtonDisabled({
        rewardLevel: finalRewardLevel,
        rewards: comment?.rewards || [],
        myId: userId,
        xpRewardInterfaceShown
      }),
    [comment, finalRewardLevel, userId, xpRewardInterfaceShown]
  );

  const DetailText = useMemo(() => {
    return (
      <div>
        {SELECTED_LANGUAGE === 'kr' ? renderKoreanText() : renderEnglishText()}
      </div>
    );

    function renderEnglishText() {
      return (
        <>
          <UsernameText user={comment.uploader} color={Color.blue()} />{' '}
          <ContentLink
            content={{
              id: comment.id,
              title: `${
                type === 'reply'
                  ? 'replied'
                  : type === 'comment'
                  ? rootType === 'user'
                    ? 'left a message'
                    : 'commented'
                  : 'responded'
              }:`
            }}
            contentType="comment"
            style={{ color: Color.green() }}
          />
        </>
      );
    }
    function renderKoreanText() {
      return (
        <>
          <UsernameText user={comment.uploader} color={Color.blue()} />
          님이{' '}
          <ContentLink
            content={{
              id: comment.id,
              title: `${
                type === 'reply'
                  ? '답글을 남겼습니다'
                  : type === 'comment'
                  ? rootType === 'user'
                    ? '메시지를 남겼습니다'
                    : '댓글을 남겼습니다'
                  : '댓글을 남겼습니다'
              }`
            }}
            contentType="comment"
            style={{ color: Color.green() }}
          />
          :
        </>
      );
    }
  }, [comment.id, comment.uploader, rootType, type]);

  useEffect(() => {
    onSetXpRewardInterfaceShown({
      contentType: 'comment',
      contentId: comment.id,
      shown: xpRewardInterfaceShown && userCanRewardThis
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const contentHidden = useMemo(() => {
    const hasSecretAnswer = subject?.secretAnswer;
    const secretShown =
      subjectState.secretShown || subject?.uploader?.id === userId;
    return hasSecretAnswer && !secretShown;
  }, [subject, subjectState.secretShown, userId]);

  return (
    <ErrorBoundary
      className={`${className} ${css`
        font-size: 1.6rem;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-break: break-word;
        border-radius: ${borderRadius};
        border: 1px solid ${Color.darkerBorderGray()};
        padding: 2rem 0 0.5rem 0;
        line-height: 1.5;
        background: ${Color.whiteGray()};
        margin-top: -1rem;
        transition: background 0.5s;
        .left {
          margin-top: 2rem;
          display: flex;
          width: 100%;
          justify-content: space-between;
          @media (max-width: ${mobileMaxWidth}) {
            button,
            span {
              font-size: 1rem;
            }
          }
        }
        .right {
          @media (max-width: ${mobileMaxWidth}) {
            button,
            span {
              font-size: 1rem;
            }
          }
        }
        .detail-block {
          display: flex;
          justify-content: space-between;
        }
        .timestamp {
          color: ${Color.gray()};
          font-size: 1.2rem;
        }
        &:hover {
          background: #fff;
        }
        @media (max-width: ${mobileMaxWidth}) {
          font-size: 1.7rem;
          border-left: 0;
          border-right: 0;
        }
      `}`}
      style={style}
    >
      <div>
        {comment &&
          (!!comment.notFound || !!comment.isDeleted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <span>{commentRemovedLabel}</span>
            </div>
          ) : (
            <div style={{ marginTop: 0 }}>
              <div style={{ padding: '0 1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div className="detail-block">
                    {DetailText}
                    <div>
                      <span
                        className={`timestamp ${css`
                          cursor: pointer;
                          &:hover {
                            text-decoration: underline;
                          }
                        `}`}
                        onClick={() => history.push(`/comments/${comment.id}`)}
                      >
                        ({timeSince(comment.timeStamp)})
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    {comment &&
                      comment.filePath &&
                      !contentHidden &&
                      (userId ? (
                        <ContentFileViewer
                          contentId={comment.id}
                          contentType="comment"
                          fileName={comment.fileName}
                          filePath={comment.filePath}
                          fileSize={comment.fileSize}
                          thumbUrl={comment.thumbUrl}
                          videoHeight="100%"
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '1rem',
                            marginBottom: comment.content ? '2.5rem' : 0,
                            ...(fileType === 'audio'
                              ? {
                                  padding: '1rem'
                                }
                              : {})
                          }}
                        />
                      ) : (
                        <LoginToViewContent />
                      ))}
                    {contentHidden ? (
                      <SecretComment
                        style={{ marginBottom: '1rem' }}
                        onClick={() => history.push(`/subjects/${subject.id}`)}
                      />
                    ) : (
                      <LongText>{comment.content}</LongText>
                    )}
                  </div>
                </div>
                {!contentHidden && (
                  <ErrorBoundary
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '1.5rem',
                      paddingTop: '1rem'
                    }}
                  >
                    <div
                      className="left"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        paddingBottom: comment.likes.length === 0 && '1rem'
                      }}
                    >
                      <div style={{ display: 'flex' }}>
                        <LikeButton
                          contentType="comment"
                          contentId={comment.id}
                          onClick={handleLikeClick}
                          likes={comment.likes}
                          small
                        />
                        <Button
                          style={{ marginLeft: '1rem' }}
                          transparent
                          onClick={handleReplyClick}
                        >
                          <Icon icon="comment-alt" />
                          <span style={{ marginLeft: '0.7rem' }}>
                            {replyLabel}
                          </span>
                        </Button>
                        {userCanRewardThis && (
                          <Button
                            style={{ marginLeft: '1rem' }}
                            color="pink"
                            disabled={!!xpButtonDisabled}
                            onClick={handleSetXpRewardInterfaceShown}
                          >
                            <Icon icon="certificate" />
                            <span style={{ marginLeft: '0.7rem' }}>
                              {xpButtonDisabled || rewardLabel}
                            </span>
                          </Button>
                        )}
                      </div>
                      <Likers
                        className={css`
                          font-weight: bold;
                          color: ${Color.darkerGray()};
                          font-size: 1.2rem;
                          line-height: 2;
                        `}
                        userId={userId}
                        likes={comment.likes}
                        onLinkClick={() => setUserListModalShown(true)}
                      />
                    </div>
                    {false && (
                      <div
                        style={{ display: 'flex', alignItems: 'center' }}
                        className="right"
                      >
                        <Button
                          color="brownOrange"
                          filled={isRecommendedByUser}
                          disabled={recommendationInterfaceShown}
                          onClick={() => setRecommendationInterfaceShown(true)}
                        >
                          <Icon icon="star" />
                        </Button>
                      </div>
                    )}
                  </ErrorBoundary>
                )}
              </div>
              {comment && false && (
                <RecommendationStatus
                  style={{
                    marginTop: 0,
                    marginBottom: '1rem'
                  }}
                  contentType="comment"
                  recommendations={comment.recommendations}
                />
              )}
              {recommendationInterfaceShown && (
                <RecommendationInterface
                  style={{
                    marginTop: '0.5rem'
                  }}
                  contentId={comment.id}
                  contentType="comment"
                  onHide={() => setRecommendationInterfaceShown(false)}
                  recommendations={comment.recommendations}
                  uploaderId={comment.uploader.id}
                />
              )}
              {xpRewardInterfaceShown && (
                <XPRewardInterface
                  innerRef={RewardInterfaceRef}
                  contentType={'comment'}
                  contentId={comment.id}
                  rewardLevel={finalRewardLevel}
                  uploaderAuthLevel={comment.uploader.authLevel}
                  uploaderId={comment.uploader.id}
                  onReward={() =>
                    setRecommendationInterfaceShown(
                      !isRecommendedByUser && twinkleCoins > 0
                    )
                  }
                  rewards={comment.rewards}
                />
              )}
              <RewardStatus
                contentType="comment"
                contentId={comment.id}
                className={css`
                  margin-left: -1px;
                  margin-right: -1px;
                  @media (max-width: ${mobileMaxWidth}) {
                    margin-left: 0px;
                    margin-right: 0px;
                  }
                `}
                style={{
                  marginTop: 0
                }}
                rewardLevel={finalRewardLevel}
                onCommentEdit={onEditRewardComment}
                rewards={comment.rewards}
                uploaderName={uploader.username}
              />
              {replyInputShown && !contentHidden && !uploadingFile && (
                <InputForm
                  innerRef={InputFormRef}
                  style={{
                    padding: '0 1rem'
                  }}
                  onSubmit={handleSubmit}
                  parent={{ contentType: 'comment', contentId: comment.id }}
                  rows={4}
                  placeholder={`Write a reply...`}
                />
              )}
              {uploadingFile && (
                <FileUploadStatusIndicator
                  style={{
                    fontSize: '1.7rem',
                    fontWeight: 'bold',
                    marginTop: 0,
                    marginLeft: '1rem',
                    marginRight: '1rem'
                  }}
                  fileName={attachment?.file?.name}
                  uploadComplete={fileUploadComplete}
                  uploadProgress={fileUploadProgress}
                />
              )}
              {comments.length > 0 && (
                <div>
                  {comments
                    .filter((comment) => !comment.isDeleted)
                    .map((comment) => (
                      <Comment
                        key={comment.id}
                        comment={comment}
                        username={username}
                        userId={userId}
                        profilePicUrl={profilePicUrl}
                        onDelete={onDeleteComment}
                        onEditDone={onEditComment}
                      />
                    ))}
                </div>
              )}
              {userListModalShown && (
                <UserListModal
                  onHide={() => setUserListModalShown(false)}
                  title="People who liked this comment"
                  users={comment.likes}
                />
              )}
            </div>
          ))}
      </div>
    </ErrorBoundary>
  );

  function handleLikeClick({ isUnlike }) {
    if (!xpButtonDisabled && userCanRewardThis && !isRewardedByUser) {
      onSetXpRewardInterfaceShown({
        contentType: 'comment',
        contentId: comment.id,
        shown: !isUnlike
      });
    } else {
      if (!isRecommendedByUser && !canReward) {
        setRecommendationInterfaceShown(!isUnlike);
      }
    }
    if (comments.length === 0) {
      onShowTCReplyInput({ contentId, contentType });
    }
  }

  function handleSetXpRewardInterfaceShown() {
    onSetXpRewardInterfaceShown({
      contentType: 'comment',
      contentId: comment.id,
      shown: true
    });
  }

  function handleReplyClick() {
    if (!replyInputShown) onShowTCReplyInput({ contentId, contentType });
    if (!deviceIsMobile) {
      setTimeout(() => InputFormRef.current.focus(), 0);
    }
  }

  async function handleSubmit(text) {
    try {
      if (attachment) {
        setUploadingFile(true);
        const filePath = uuidv1();
        await uploadFile({
          filePath,
          file: attachment.file,
          onUploadProgress: handleUploadProgress
        });
        const data = await uploadComment({
          content: text,
          parent: {
            contentType: rootType,
            contentId: rootObj.id
          },
          targetCommentId: comment.id,
          attachment,
          filePath,
          fileName: attachment.file.name,
          fileSize: attachment.file.size
        });
        if (mounted.current) {
          onSetCommentFileUploadComplete({
            contentType: 'comment',
            contentId: comment.id
          });
          setUploadingFile(false);
          onUploadTargetComment({ ...data.comment, contentId, contentType });
          onClearCommentFileUploadProgress({
            contentType: 'comment',
            contentId: comment.id
          });
          setUploadingFile(false);
          onEnterComment({
            contentType: 'comment',
            contentId: comment.id,
            text: ''
          });
          onSetCommentAttachment({
            attachment: undefined,
            contentType: 'comment',
            contentId: comment.id
          });
        }
      } else {
        const data = await uploadComment({
          content: text,
          parent: {
            contentType: rootType,
            contentId: rootObj.id
          },
          targetCommentId: comment.id
        });
        onUploadTargetComment({ ...data.comment, contentId, contentType });
      }
    } catch (error) {
      console.error(error);
    }

    function handleUploadProgress({ loaded, total }) {
      onUpdateCommentFileUploadProgress({
        contentType: 'comment',
        contentId: comment.id,
        progress: loaded / total
      });
    }
  }
}
