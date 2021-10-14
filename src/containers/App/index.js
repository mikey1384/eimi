import 'regenerator-runtime/runtime'; // for async await
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Chat from 'containers/Chat';
import ContentPage from 'containers/ContentPage';
import Explore from 'containers/Explore';
import Header from './Header';
import Home from 'containers/Home';
import Button from 'components/Button';
import LinkPage from 'containers/LinkPage';
import PlaylistPage from 'containers/PlaylistPage';
import Privacy from 'containers/Privacy';
import Redirect from 'containers/Redirect';
import MissionPage from 'containers/MissionPage';
import Mission from 'containers/Mission';
import SigninModal from 'containers/Signin';
import Management from 'containers/Management';
import MobileMenu from './MobileMenu';
import Profile from 'containers/Profile';
import ResetPassword from 'containers/ResetPassword';
import Verify from 'containers/Verify';
import VideoPage from 'containers/VideoPage';
import Incoming from 'components/Stream/Incoming';
import Outgoing from 'components/Stream/Outgoing';
import { Switch, Route } from 'react-router-dom';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { socket } from 'constants/io';
import { addEvent, removeEvent } from 'helpers/listenerHelpers';
import { finalizeEmoji } from 'helpers/stringHelpers';
import { useMyState, useScrollPosition } from 'helpers/hooks';
import { isMobile } from 'helpers';
import { v1 as uuidv1 } from 'uuid';
import {
  useAppContext,
  useContentContext,
  useHomeContext,
  useInputContext,
  useViewContext,
  useNotiContext,
  useChatContext
} from 'contexts';

App.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

const deviceIsMobile = isMobile(navigator);

function App({ location, history }) {
  const {
    user: {
      actions: { onCloseSigninModal, onInitUser, onLogout, onSetSessionLoaded }
    },
    requestHelpers: {
      auth,
      loadMyData,
      recordUserTraffic,
      uploadFile,
      uploadContent,
      uploadFileOnChat
    }
  } = useAppContext();
  const { authLevel, profilePicUrl, signinModalShown, userId, username } =
    useMyState();
  const {
    state: {
      channelOnCall,
      channelsObj,
      currentChannelName,
      selectedChannelId
    },
    actions: {
      onDisplayAttachedFile,
      onSetReplyTarget,
      onPostFileUploadStatus,
      onPostUploadComplete,
      onResetChat,
      onSendFirstDirectMessage,
      onUpdateChatUploadProgress
    }
  } = useChatContext();
  const {
    actions: { onInitContent }
  } = useContentContext();
  const {
    actions: {
      onLoadNewFeeds,
      onSetFileUploadComplete,
      onSetSecretAttachmentUploadComplete,
      onSetSubmittingSubject,
      onUpdateFileUploadProgress,
      onUpdateSecretAttachmentUploadProgress,
      onClearFileUploadProgress,
      onSetUploadingFile
    }
  } = useHomeContext();
  const {
    state: { updateDetail, updateNoticeShown }
  } = useNotiContext();
  const {
    state: { pageVisible, scrollPositions },
    actions: { onChangePageVisibility, onRecordScrollPosition }
  } = useViewContext();
  const {
    actions: { onResetSubjectInput }
  } = useInputContext();
  const [mobileMenuShown, setMobileMenuShown] = useState(false);
  const currentChannel = useMemo(
    () => channelsObj[selectedChannelId] || {},
    [channelsObj, selectedChannelId]
  );
  const visibilityChangeRef = useRef(null);
  const hiddenRef = useRef(null);
  const authRef = useRef(null);
  const mounted = useRef(true);

  useScrollPosition({
    onRecordScrollPosition,
    pathname: location.pathname,
    scrollPositions,
    isMobile: deviceIsMobile
  });

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!auth()?.headers?.authorization && !signinModalShown) {
      onLogout();
      onResetChat();
      onSetSessionLoaded();
    } else {
      if (
        authRef.current?.headers?.authorization !==
        auth()?.headers?.authorization
      ) {
        init();
      } else {
        onSetSessionLoaded();
      }
    }
    authRef.current = auth();
    async function init() {
      await recordUserTraffic(location.pathname);
      if (authRef.current?.headers?.authorization) {
        const data = await loadMyData(location.pathname);
        if (mounted.current) {
          onInitContent({
            contentType: 'user',
            contentId: data.userId,
            ...data
          });
          if (data?.userId) onInitUser(data);
        }
      }
      onSetSessionLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location.pathname, pageVisible, signinModalShown]);

  useEffect(() => {
    window.ga('send', 'pageview', location.pathname);
    history.listen((location) => {
      window.ga('send', 'pageview', location.pathname);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document.hidden !== 'undefined') {
      hiddenRef.current = 'hidden';
      visibilityChangeRef.current = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hiddenRef.current = 'msHidden';
      visibilityChangeRef.current = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hiddenRef.current = 'webkitHidden';
      visibilityChangeRef.current = 'webkitvisibilitychange';
    }
    addEvent(document, visibilityChangeRef.current, handleVisibilityChange);
    function handleVisibilityChange() {
      const visible = !document[hiddenRef.current];
      socket.emit('change_away_status', visible);
      onChangePageVisibility(visible);
    }
    return function cleanUp() {
      removeEvent(
        document,
        visibilityChangeRef.current,
        handleVisibilityChange
      );
    };
  });

  const outgoingShown = useMemo(() => {
    return channelOnCall.imCalling || channelOnCall.outgoingShown;
  }, [channelOnCall.imCalling, channelOnCall.outgoingShown]);

  const handleFileUploadOnChat = useCallback(
    async ({
      channelId,
      content,
      filePath,
      fileToUpload,
      recepientId,
      messageId: tempMessageId,
      targetMessageId,
      subjectId
    }) => {
      onPostFileUploadStatus({
        channelId,
        content,
        fileName: fileToUpload.name,
        filePath,
        fileToUpload,
        recepientId
      });
      const { channel, message, messageId } = await uploadFileOnChat({
        channelId,
        content,
        selectedFile: fileToUpload,
        onUploadProgress: handleUploadProgress,
        recepientId,
        path: filePath,
        targetMessageId,
        subjectId
      });
      onPostUploadComplete({
        path: filePath,
        channelId,
        tempMessageId,
        messageId: messageId,
        result: !!messageId
      });
      const params = {
        content,
        fileName: fileToUpload.name,
        filePath,
        fileSize: fileToUpload.size,
        id: messageId,
        uploaderAuthLevel: authLevel,
        channelId,
        userId,
        username,
        profilePicUrl,
        targetMessage: currentChannel.replyTarget
      };
      onDisplayAttachedFile(params);
      if (channelId) {
        const channelData = {
          id: channelId,
          channelName: currentChannelName,
          members: currentChannel.members,
          twoPeople: currentChannel.twoPeople
        };
        socket.emit('new_chat_message', {
          message: { ...params, isNewMessage: true },
          channel: channelData
        });
      }
      onSetReplyTarget({ channelId, target: null });
      if (channel) {
        onSendFirstDirectMessage({ channel, message });
        socket.emit('join_chat_group', message.channelId);
        socket.emit('send_bi_chat_invitation', {
          userId: recepientId,
          members: currentChannel.members,
          message
        });
      }
      function handleUploadProgress({ loaded, total }) {
        onUpdateChatUploadProgress({
          channelId,
          path: filePath,
          progress: loaded / total
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authLevel,
      currentChannel,
      currentChannelName,
      profilePicUrl,
      currentChannel.replyTarget,
      userId,
      username
    ]
  );

  const handleFileUploadOnHome = useCallback(
    async ({
      attachment,
      byUser,
      description,
      filePath,
      file,
      hasSecretAnswer,
      rewardLevel,
      secretAnswer,
      secretAttachment,
      title
    }) => {
      try {
        const promises = [];
        const secretAttachmentFilePath = uuidv1();
        if (attachment?.contentType === 'file') {
          promises.push(
            uploadFile({
              filePath,
              file,
              onUploadProgress: handleUploadProgress
            })
          );
        }
        if (hasSecretAnswer && secretAttachment) {
          promises.push(
            uploadFile({
              filePath: secretAttachmentFilePath,
              file: secretAttachment?.file,
              onUploadProgress: handleSecretAttachmentUploadProgress
            })
          );
        }
        await Promise.all(promises);
        if (attachment) {
          onSetFileUploadComplete();
        }
        if (hasSecretAnswer && secretAttachment) {
          onSetSecretAttachmentUploadComplete();
        }
        const data = await uploadContent({
          title,
          byUser,
          description: finalizeEmoji(description),
          secretAnswer: hasSecretAnswer ? secretAnswer : '',
          rewardLevel,
          ...(hasSecretAnswer && secretAttachment
            ? {
                secretAttachmentFilePath,
                secretAttachmentFileName: secretAttachment.file.name,
                secretAttachmentFileSize: secretAttachment.file.size
              }
            : {}),
          ...(attachment?.contentType === 'file'
            ? { filePath, fileName: file.name, fileSize: file.size }
            : {}),
          ...(attachment && attachment.contentType !== 'file'
            ? { rootId: attachment.id, rootType: attachment.contentType }
            : {})
        });
        if (data) {
          onLoadNewFeeds([data]);
          onResetSubjectInput();
        }
        onSetSubmittingSubject(false);
        onClearFileUploadProgress();
        onSetUploadingFile(false);
      } catch (error) {
        console.error(error);
      }
      function handleSecretAttachmentUploadProgress({ loaded, total }) {
        onUpdateSecretAttachmentUploadProgress(loaded / total);
      }
      function handleUploadProgress({ loaded, total }) {
        onUpdateFileUploadProgress(loaded / total);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div
      className={css`
        height: CALC(100% - 4.5rem);
        width: 100%;
        @media (max-width: ${mobileMaxWidth}) {
          height: 100%;
        }
      `}
    >
      {mobileMenuShown && (
        <MobileMenu
          location={location}
          history={history}
          username={username}
          onClose={() => setMobileMenuShown(false)}
        />
      )}
      {updateNoticeShown && (
        <div
          className={css`
            position: fixed;
            width: 80%;
            left: 10%;
            top: 2rem;
            z-index: 100000;
            background: ${Color.blue()};
            color: #fff;
            padding: 1rem;
            text-align: center;
            font-size: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
              left: 0;
            }
          `}
        >
          <p>
            The website has been updated. Click the button below to apply the
            update.
          </p>
          <p style={{ fontSize: '1.3em' }}>
            {
              "Warning: Update is mandatory. Some features will not work properly if you don't update!"
            }
          </p>
          {updateDetail && (
            <p style={{ color: Color.gold() }}>{updateDetail}</p>
          )}
          <Button
            color="gold"
            filled
            style={{ marginTop: '3rem', width: '20%', alignSelf: 'center' }}
            onClick={() => window.location.reload()}
          >
            Update!
          </Button>
        </div>
      )}
      <Header
        history={history}
        onMobileMenuOpen={() => setMobileMenuShown(true)}
      />
      <div
        id="App"
        className={css`
          margin-top: 4.5rem;
          height: 100%;
          @media (max-width: ${mobileMaxWidth}) {
            margin-top: 0;
            padding-top: 0;
            padding-bottom: 5rem;
          }
        `}
      >
        <Switch>
          <Route
            path="/users/:username"
            render={({ history, location, match }) => (
              <Profile history={history} location={location} match={match} />
            )}
          />
          <Route path="/comments/:contentId" component={ContentPage} />
          <Route path="/videos/:videoId" component={VideoPage} />
          <Route path="/videos" component={Explore} />
          <Route path="/links/:linkId" component={LinkPage} />
          <Route path="/links" component={Explore} />
          <Route path="/subjects/:contentId" component={ContentPage} />
          <Route path="/subjects" component={Explore} />
          <Route path="/playlists" component={PlaylistPage} />
          <Route
            path="/missions/:missionType/:taskType"
            component={MissionPage}
          />
          <Route path="/missions/:missionType" component={MissionPage} />
          <Route path="/missions" component={Mission} />
          <Route
            path="/chat"
            render={() => <Chat onFileUpload={handleFileUploadOnChat} />}
          />
          <Route path="/management" exact component={Management} />
          <Route path="/management/mod-activities" component={Management} />
          <Route path="/reset" component={ResetPassword} />
          <Route path="/verify" component={Verify} />
          <Route path="/privacy" component={Privacy} />
          <Route
            exact
            path="/"
            render={({ history, location }) => (
              <Home
                history={history}
                location={location}
                onFileUpload={handleFileUploadOnHome}
              />
            )}
          />
          <Route
            path="/earn"
            render={({ history, location }) => (
              <Home history={history} location={location} />
            )}
          />
          <Route
            path="/store"
            render={({ history, location }) => (
              <Home history={history} location={location} />
            )}
          />
          <Route
            exact
            path="/users/"
            render={({ history, location }) => (
              <Home history={history} location={location} />
            )}
          />
          <Route path="/:username" component={Redirect} />
        </Switch>
      </div>
      {signinModalShown && <SigninModal show onHide={onCloseSigninModal} />}
      {channelOnCall.incomingShown && <Incoming />}
      {outgoingShown && <Outgoing />}
    </div>
  );
}

export default memo(App);
