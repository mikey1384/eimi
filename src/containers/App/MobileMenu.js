import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import HomeMenuItems from 'components/HomeMenuItems';
import ProfileWidget from 'components/ProfileWidget';
import Notification from 'components/Notification';
import AlertModal from 'components/Modals/AlertModal';
import ImageEditModal from 'components/Modals/ImageEditModal';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import { useSpring, animated } from 'react-spring';
import { Color } from 'constants/css';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useChatContext, useContentContext } from 'contexts';

MobileMenu.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
  onClose: PropTypes.func.isRequired
};

export default function MobileMenu({ location, history, onClose }) {
  const styles = useSpring({
    to: { marginLeft: '0' },
    from: { marginLeft: '-100%' }
  });

  const mounted = useRef(true);
  const displayedRef = useRef(false);
  const onLogout = useAppContext((v) => v.user.actions.onLogout);
  const onResetChat = useChatContext((v) => v.actions.onResetChat);
  const onUploadProfilePic = useContentContext(
    (v) => v.actions.onUploadProfilePic
  );
  const onSetOnline = useContentContext((v) => v.actions.onSetOnline);
  const { username, userId } = useMyState();
  const [alertModalShown, setAlertModalShown] = useState(false);
  const [imageEditStatus, setImageEditStatus] = useState({
    imageEditModalShown: false,
    imageUri: null
  });
  const { imageEditModalShown, imageUri } = imageEditStatus;

  useEffect(() => {
    if (displayedRef.current) {
      onClose();
    }
    displayedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    mounted.current = true;
    return function onDismount() {
      mounted.current = false;
    };
  }, []);

  return (
    <ErrorBoundary
      className={`mobile ${css`
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: fixed;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
      `}`}
    >
      <animated.div
        style={styles}
        className={`momentum-scroll-enabled ${css`
          height: 100%;
          width: 70%;
          position: relative;
          background: ${Color.whiteGray()};
          overflow-y: scroll;
        `}`}
      >
        <ProfileWidget
          history={history}
          onShowAlert={() => setAlertModalShown(true)}
          onLoadImage={(upload) =>
            setImageEditStatus({
              ...imageEditStatus,
              imageEditModalShown: true,
              imageUri: upload.target.result
            })
          }
        />
        <HomeMenuItems
          history={history}
          location={location}
          style={{ marginTop: '1rem' }}
        />
        <Notification location="home" />
        {username && (
          <div
            className={css`
              border-top: 1px solid ${Color.borderGray()};
              border-bottom: 1px solid ${Color.borderGray()};
              background: #fff;
              width: 100%;
              text-align: center;
              color: ${Color.red()};
              font-size: 3rem;
              padding: 1rem;
              margin-top: 1rem;
            `}
            onClick={handleLogout}
          >
            Log out
          </div>
        )}
      </animated.div>
      <div style={{ width: '30%', position: 'relative' }} onClick={onClose}>
        <Icon
          icon="times"
          style={{
            color: '#fff',
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            fontSize: '4rem',
            opacity: '0.8'
          }}
        />
      </div>
      {imageEditModalShown && (
        <ImageEditModal
          isProfilePic
          imageUri={imageUri}
          onEditDone={handleImageEditDone}
          onHide={() =>
            setImageEditStatus({
              imageUri: null,
              imageEditModalShown: false
            })
          }
        />
      )}
      {alertModalShown && (
        <AlertModal
          title="Image is too large (limit: 10mb)"
          content="Please select a smaller image"
          onHide={() => setAlertModalShown(false)}
        />
      )}
    </ErrorBoundary>
  );

  function handleImageEditDone({ filePath }) {
    onUploadProfilePic({ userId, imageUrl: `/profile/${filePath}` });
    setImageEditStatus({
      imageUri: null,
      imageEditModalShown: false
    });
  }

  function handleLogout() {
    if (mounted.current) {
      onLogout();
    }
    if (mounted.current) {
      onSetOnline({ contentId: userId, contentType: 'user', online: false });
    }
    if (mounted.current) {
      onResetChat();
    }
  }
}
