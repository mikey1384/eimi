import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ProfilePic from 'components/ProfilePic';
import Button from 'components/Button';
import ImageEditModal from 'components/Modals/ImageEditModal';
import BioEditModal from 'components/Modals/BioEditModal';
import AlertModal from 'components/Modals/AlertModal';
import RankBar from 'components/RankBar';
import Icon from 'components/Icon';
import Comments from 'components/Comments';
import Link from 'components/Link';
import UserDetails from 'components/UserDetails';
import Loading from 'components/Loading';
import { useHistory } from 'react-router-dom';
import {
  MAX_PROFILE_PIC_SIZE,
  SELECTED_LANGUAGE
} from 'constants/defaultValues';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { timeSince } from 'helpers/timeStampHelpers';
import { useContentState, useLazyLoad, useMyState } from 'helpers/hooks';
import { useInView } from 'react-intersection-observer';
import {
  useAppContext,
  useChatContext,
  useContentContext,
  useProfileContext
} from 'contexts';
import localize from 'constants/localize';

const chatLabel = localize('chat2');
const changePicLabel = localize('changePic');
const editBioLabel = localize('editBio');
const imageTooLarge10MBLabel = localize('imageTooLarge10MB');
const lastOnlineLabel = localize('lastOnline');
const pleaseSelectSmallerImageLabel = localize('pleaseSelectSmallerImage');
const viewProfileLabel = localize('viewProfile');
const visitWebsiteLabel = localize('visitWebsite');
const visitYoutubeLabel = localize('visitYoutube');

ProfilePanel.propTypes = {
  expandable: PropTypes.bool,
  profileId: PropTypes.number,
  style: PropTypes.object
};

function ProfilePanel({ expandable, profileId, style }) {
  const mounted = useRef(true);
  const onSetUserState = useAppContext((v) => v.user.actions.onSetUserState);
  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  const history = useHistory();
  const profilePanelState = useContentState({
    contentType: 'user',
    contentId: profileId
  });
  const profile = useAppContext((v) => v.user.state.userObj[profileId] || {});

  const {
    comments = [],
    commentsLoaded,
    commentsLoadMoreButton,
    commentsShown,
    visible: previousVisible,
    placeholderHeight: previousPlaceholderHeight,
    previewLoaded
  } = profilePanelState;

  const {
    online,
    lastActive,
    loaded: profileLoaded,
    numMessages,
    username: profileName,
    twinkleXP,
    userType,
    profileFirstRow,
    profileSecondRow,
    profileThirdRow,
    profilePicUrl,
    profileTheme,
    website,
    youtubeUrl
  } = profile;

  const onOpenNewChatTab = useChatContext((v) => v.actions.onOpenNewChatTab);
  const onDeleteComment = useContentContext((v) => v.actions.onDeleteComment);
  const onEditComment = useContentContext((v) => v.actions.onEditComment);
  const onEditRewardComment = useContentContext(
    (v) => v.actions.onEditRewardComment
  );
  const onInitContent = useContentContext((v) => v.actions.onInitContent);
  const onLikeComment = useContentContext((v) => v.actions.onLikeComment);
  const onLoadComments = useContentContext((v) => v.actions.onLoadComments);
  const onLoadMoreComments = useContentContext(
    (v) => v.actions.onLoadMoreComments
  );
  const onLoadMoreReplies = useContentContext(
    (v) => v.actions.onLoadMoreReplies
  );
  const onLoadRepliesOfReply = useContentContext(
    (v) => v.actions.onLoadRepliesOfReply
  );
  const onReloadContent = useContentContext((v) => v.actions.onReloadContent);
  const onSetCommentsShown = useContentContext(
    (v) => v.actions.onSetCommentsShown
  );
  const onUploadComment = useContentContext((v) => v.actions.onUploadComment);
  const onUploadReply = useContentContext((v) => v.actions.onUploadReply);
  const onSetPlaceholderHeight = useContentContext(
    (v) => v.actions.onSetPlaceholderHeight
  );
  const onSetVisible = useContentContext((v) => v.actions.onSetVisible);

  const [ComponentRef, inView] = useInView({
    rootMargin: '50px 0px 0px 0px',
    threshold: 0
  });
  const PanelRef = useRef(null);
  const ContainerRef = useRef(null);
  const visibleRef = useRef(previousVisible);
  const [visible, setVisible] = useState(previousVisible);
  const [placeholderHeight, setPlaceholderHeight] = useState(
    previousPlaceholderHeight
  );
  const placeholderHeightRef = useRef(previousPlaceholderHeight);
  useLazyLoad({
    PanelRef,
    inView,
    onSetPlaceholderHeight: (height) => {
      setPlaceholderHeight(height);
      placeholderHeightRef.current = height;
    },
    onSetVisible: (visible) => {
      setVisible(visible);
      visibleRef.current = visible;
    },
    delay: 1000
  });

  useEffect(() => {
    return function cleanUp() {
      onSetPlaceholderHeight({
        contentType: 'user',
        contentId: profileId,
        height: placeholderHeightRef.current
      });
      onSetVisible({
        contentType: 'user',
        contentId: profileId,
        visible: visibleRef.current
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIfUserOnline = useAppContext(
    (v) => v.requestHelpers.checkIfUserOnline
  );
  const loadDMChannel = useAppContext((v) => v.requestHelpers.loadDMChannel);
  const loadComments = useAppContext((v) => v.requestHelpers.loadComments);
  const loadProfile = useAppContext((v) => v.requestHelpers.loadProfile);
  const uploadBio = useAppContext((v) => v.requestHelpers.uploadBio);
  const onResetProfile = useProfileContext((v) => v.actions.onResetProfile);

  const { isCreator, userId, username, banned, authLevel } = useMyState();

  const [bioEditModalShown, setBioEditModalShown] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [imageUri, setImageUri] = useState();
  const [imageEditModalShown, setImageEditModalShown] = useState(false);
  const [mouseEnteredProfile, setMouseEnteredProfile] = useState(false);
  const [alertModalShown, setAlertModalShown] = useState(false);
  const CommentInputAreaRef = useRef(null);
  const FileInputRef = useRef(null);
  const loading = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      if (mounted.current) {
        handleCheckIfUserOnline();
      }
    }, 100);
    if (!profileLoaded && !loading.current && profileId) {
      handleInitProfile();
    }
    if (!commentsLoaded && !previewLoaded) {
      handleLoadComments();
    }
    async function handleCheckIfUserOnline() {
      const online = await checkIfUserOnline(profileId);
      if (mounted.current) {
        onSetUserState({ userId: profileId, newState: { online } });
      }
    }
    async function handleInitProfile() {
      loading.current = true;
      const data = await loadProfile(profileId);
      if (mounted.current) {
        onInitContent({
          contentType: 'user',
          contentId: profileId
        });
        onSetUserState({
          userId: profileId,
          newState: { ...data, loaded: true }
        });
        loading.current = false;
      }
    }
    async function handleLoadComments() {
      try {
        const data = await loadComments({
          contentId: profileId,
          contentType: 'user',
          limit: 1
        });
        if (mounted.current) {
          onLoadComments({
            ...data,
            contentId: profileId,
            contentType: 'user',
            isPreview: true
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, userId, profileLoaded, commentsLoaded, previewLoaded]);

  const canEdit = useMemo(
    () => userId === profileId || isCreator,
    [isCreator, profileId, userId]
  );
  const noBio = useMemo(
    () => !profileFirstRow && !profileSecondRow && !profileThirdRow,
    [profileFirstRow, profileSecondRow, profileThirdRow]
  );
  const heightNotSet = useMemo(
    () => !placeholderHeight && !previousPlaceholderHeight,
    [placeholderHeight, previousPlaceholderHeight]
  );
  const contentShown = useMemo(
    () => !profileLoaded || heightNotSet || visible || inView,
    [heightNotSet, inView, profileLoaded, visible]
  );
  const leaveMessageLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return (
        <>
          메시지
          {profileId === userId ? '' : ' 남기기'}
        </>
      );
    }
    return (
      <>
        {profileId === userId ? '' : 'Leave '}
        Message
      </>
    );
  }, [profileId, userId]);

  return (
    <div style={style} ref={ComponentRef} key={profileId}>
      <div
        ref={ContainerRef}
        style={{
          width: '100%',
          height: contentShown ? 'auto' : placeholderHeight || '15rem'
        }}
      >
        {contentShown && (
          <div
            ref={PanelRef}
            className={css`
              background: #fff;
              width: 100%;
              line-height: 2.3rem;
              font-size: 1.5rem;
              position: relative;
            `}
          >
            <div
              className={css`
                background: ${Color[profileTheme || 'logoBlue']()};
                min-height: 2.5rem;
                border-top-right-radius: ${borderRadius};
                border-top-left-radius: ${borderRadius};
                border-bottom: none;
                display: flex;
                align-items: center;
                justify-content: center;
                @media (max-width: ${mobileMaxWidth}) {
                  border-radius: 0;
                  border-left: none;
                  border-right: none;
                }
              `}
              style={{ padding: userType ? '0.5rem' : undefined }}
            >
              {userType && (
                <div
                  style={{
                    fontSize: '2.2rem',
                    color: '#fff'
                  }}
                >
                  {userType.includes('teacher') ? 'teacher' : userType}
                </div>
              )}
            </div>
            <div
              className={css`
                display: flex;
                flex-direction: column;
                padding: 1rem;
                border: ${Color.borderGray()} 1px solid;
                ${twinkleXP
                  ? 'border-bottom: none;'
                  : `
                  border-bottom-left-radius: ${borderRadius};
                  border-bottom-right-radius: ${borderRadius};
                `};
                border-top: none;
                @media (max-width: ${mobileMaxWidth}) {
                  border-radius: 0;
                  border-left: none;
                  border-right: none;
                }
              `}
            >
              {profileLoaded ? (
                <div
                  style={{ display: 'flex', height: '100%', marginTop: '1rem' }}
                >
                  <div
                    style={{
                      width: '20rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      onMouseEnter={() => setMouseEnteredProfile(true)}
                      onMouseLeave={() => setMouseEnteredProfile(false)}
                    >
                      <Link
                        onClick={handleReloadProfile}
                        to={`/users/${profileName}`}
                      >
                        <ProfilePic
                          style={{
                            width: '18rem',
                            height: '18rem',
                            cursor: 'pointer'
                          }}
                          userId={profileId}
                          profilePicUrl={profilePicUrl}
                          online={!!online}
                          statusShown
                          large
                        />
                      </Link>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '1.5rem'
                      }}
                    >
                      <Button
                        color="orange"
                        transparent
                        style={{
                          color: mouseEnteredProfile && Color.orange(),
                          padding: '0.5rem'
                        }}
                        onClick={() => history.push(`/users/${profileName}`)}
                      >
                        {viewProfileLabel}
                      </Button>
                    </div>
                    {youtubeUrl && (
                      <Button
                        color="red"
                        transparent
                        style={{ padding: '0.5rem' }}
                        onClick={() => window.open(youtubeUrl)}
                      >
                        {visitYoutubeLabel}
                      </Button>
                    )}
                    {website && (
                      <Button
                        color="blue"
                        transparent
                        style={{ padding: '0.5rem' }}
                        onClick={() => window.open(website)}
                      >
                        {visitWebsiteLabel}
                      </Button>
                    )}
                  </div>
                  <div
                    style={{
                      marginLeft: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      width: 'CALC(100% - 19rem)'
                    }}
                  >
                    <UserDetails
                      profile={profile}
                      removeStatusMsg={(userId) =>
                        onSetUserState({
                          userId,
                          newState: { statusMsg: '', statusColor: '' }
                        })
                      }
                      updateStatusMsg={(data) => {
                        if (banned?.posting) {
                          return;
                        }
                        onSetUserState({ userId: data.userId, newState: data });
                      }}
                      onSetBioEditModalShown={setBioEditModalShown}
                      userId={userId}
                    />
                    {canEdit && (
                      <div
                        style={{
                          zIndex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ display: 'flex' }}>
                          <Button
                            transparent
                            onClick={onChangeProfilePictureClick}
                          >
                            {changePicLabel}
                          </Button>
                          <Button
                            transparent
                            onClick={() => {
                              if (banned?.posting) {
                                return;
                              }
                              setBioEditModalShown(true);
                            }}
                            style={{ marginLeft: '0.5rem' }}
                          >
                            {editBioLabel}
                          </Button>
                          {profileId === userId &&
                            comments.length > 0 &&
                            renderMessagesButton({
                              style: { marginLeft: '0.5rem' }
                            })}
                        </div>
                      </div>
                    )}
                    {expandable && userId !== profileId && (
                      <div
                        style={{
                          marginTop: noBio ? '2rem' : '1rem',
                          display: 'flex'
                        }}
                      >
                        <Button color="green" onClick={handleTalkClick}>
                          <Icon icon="comments" />
                          <span style={{ marginLeft: '0.7rem' }}>
                            {chatLabel}
                          </span>
                        </Button>
                        {renderMessagesButton()}
                      </div>
                    )}
                    {lastActive && !online && profileId !== userId && (
                      <div
                        style={{
                          marginTop: '1rem',
                          fontSize: '1.5rem',
                          color: Color.gray()
                        }}
                      >
                        <p>
                          {lastOnlineLabel} {timeSince(lastActive)}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={FileInputRef}
                    style={{ display: 'none' }}
                    type="file"
                    onChange={handlePicture}
                    accept="image/*"
                  />
                  {bioEditModalShown && (
                    <BioEditModal
                      firstLine={profileFirstRow}
                      secondLine={profileSecondRow}
                      thirdLine={profileThirdRow}
                      onSubmit={handleUploadBio}
                      onHide={() => setBioEditModalShown(false)}
                    />
                  )}
                  {imageEditModalShown && (
                    <ImageEditModal
                      isProfilePic
                      imageUri={imageUri}
                      onEditDone={handleImageEditDone}
                      onHide={() => {
                        setImageUri(undefined);
                        setImageEditModalShown(false);
                      }}
                    />
                  )}
                </div>
              ) : (
                <Loading />
              )}
              {profileLoaded && (
                <Comments
                  comments={comments}
                  commentsLoadLimit={5}
                  commentsShown={commentsShown}
                  contentId={profileId}
                  inputAreaInnerRef={CommentInputAreaRef}
                  inputTypeLabel={`message to ${profileName}`}
                  isLoading={loadingComments}
                  loadMoreButton={commentsLoadMoreButton}
                  noInput={profileId === userId}
                  numPreviews={1}
                  onCommentSubmit={onUploadComment}
                  onDelete={onDeleteComment}
                  onEditDone={onEditComment}
                  onLikeClick={onLikeComment}
                  onLoadMoreComments={onLoadMoreComments}
                  onLoadMoreReplies={onLoadMoreReplies}
                  onLoadRepliesOfReply={onLoadRepliesOfReply}
                  onPreviewClick={onExpandComments}
                  onReplySubmit={onUploadReply}
                  onRewardCommentEdit={onEditRewardComment}
                  parent={{
                    ...profile,
                    ...profilePanelState,
                    contentType: 'user'
                  }}
                  style={{ marginTop: '1rem' }}
                  userId={userId}
                />
              )}
            </div>
            {!!twinkleXP && <RankBar profile={profile} />}
            {alertModalShown && (
              <AlertModal
                title={imageTooLarge10MBLabel}
                content={pleaseSelectSmallerImageLabel}
                onHide={() => setAlertModalShown(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  function handleImageEditDone({ filePath }) {
    onSetUserState({
      userId,
      newState: { profilePicUrl: `/profile/${filePath}` }
    });
    setImageEditModalShown(false);
  }

  function handlePicture(event) {
    const reader = new FileReader();
    const file = event.target.files[0];
    if (file.size / 1000 > MAX_PROFILE_PIC_SIZE) {
      return setAlertModalShown(true);
    }
    reader.onload = (upload) => {
      setImageEditModalShown(true);
      setImageUri(upload.target.result);
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  }

  function handleReloadProfile() {
    onReloadContent({
      contentId: profileId,
      contentType: 'user'
    });
    onResetProfile(username);
  }

  async function handleTalkClick() {
    const { pathId } = await loadDMChannel({ recepient: profile });
    if (mounted.current) {
      if (!pathId) {
        onOpenNewChatTab({
          user: { username, id: userId, profilePicUrl, authLevel },
          recepient: {
            username: profile.username,
            id: profile.id,
            profilePicUrl: profile.profilePicUrl,
            authLevel: profile.authLevel
          }
        });
      }
      history.push(pathId ? `/chat/${pathId}` : `/chat/new`);
    }
  }

  function onChangeProfilePictureClick() {
    FileInputRef.current.click();
  }

  async function onExpandComments() {
    if (!commentsShown) {
      setLoadingComments(true);
      const { comments, loadMoreButton } = await loadComments({
        contentId: profileId,
        contentType: 'user',
        limit: 5
      });
      if (mounted.current) {
        onLoadComments({
          comments,
          contentId: profileId,
          contentType: 'user',
          loadMoreButton
        });
        onSetCommentsShown({ contentId: profileId, contentType: 'user' });
        setLoadingComments(false);
      }
    }
  }

  async function onMessagesButtonClick() {
    await onExpandComments();
    if (mounted.current) {
      if (profileId !== userId) CommentInputAreaRef.current?.focus();
    }
  }

  function renderMessagesButton() {
    return (
      <Button
        style={{ marginLeft: '1rem' }}
        disabled={commentsShown && profileId === userId}
        color="logoBlue"
        onClick={onMessagesButtonClick}
      >
        <Icon icon="comment-alt" />
        <span style={{ marginLeft: '0.7rem' }}>
          {leaveMessageLabel}
          {profileId === userId && Number(numMessages) > 0 && !commentsShown
            ? `${numMessages > 1 ? 's' : ''}`
            : ''}
          {Number(numMessages) > 0 && !commentsShown ? ` (${numMessages})` : ''}
        </span>
      </Button>
    );
  }

  async function handleUploadBio(params) {
    const data = await uploadBio({
      ...params,
      profileId
    });
    if (mounted.current) {
      onSetUserState({ userId: data.userId, newState: data.bio });
      setBioEditModalShown(false);
    }
  }
}

export default memo(ProfilePanel);
