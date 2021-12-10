import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ProfilePic from 'components/ProfilePic';
import Button from 'components/Button';
import ErrorBoundary from 'components/ErrorBoundary';
import WelcomeMessage from './WelcomeMessage';
import { container } from './Styles';
import { borderRadius } from 'constants/css';
import { MAX_PROFILE_PIC_SIZE } from 'constants/defaultValues';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { useAppContext } from 'contexts';
import localize from 'constants/localize';

const viewProfileLabel = localize('viewProfile');
const changePictureLabel = localize('changePicture');

ProfileWidget.propTypes = {
  history: PropTypes.object,
  onLoadImage: PropTypes.func,
  onShowAlert: PropTypes.func
};

export default function ProfileWidget({ history, onLoadImage, onShowAlert }) {
  const {
    user: {
      actions: { onOpenSigninModal }
    }
  } = useAppContext();
  const { profilePicUrl, realName, userId, username } = useMyState();
  const FileInputRef = useRef(null);

  return (
    <ErrorBoundary>
      <div className={container} style={{ cursor: 'pointer' }}>
        {username && (
          <div
            className="heading"
            onClick={() =>
              username ? history.push(`/users/${username}`) : null
            }
          >
            <ProfilePic
              className="widget__profile-pic"
              style={{
                cursor: userId ? 'pointer' : 'default'
              }}
              userId={userId}
              profilePicUrl={profilePicUrl}
              onClick={() => {
                if (userId) history.push(`/users/${username}`);
              }}
            />
            <div className="names">
              <a>{username}</a>
              {realName && (
                <div>
                  <span>({realName})</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={`details ${css`
            border-top-right-radius: ${username ? '' : borderRadius};
            border-top-left-radius: ${username ? '' : borderRadius};
          `}`}
        >
          {userId && (
            <div>
              <Button
                style={{ width: '100%' }}
                transparent
                onClick={() => history.push(`/users/${username}`)}
              >
                {viewProfileLabel}
              </Button>
              <Button
                style={{ width: '100%' }}
                transparent
                onClick={() => FileInputRef.current.click()}
              >
                {changePictureLabel}
              </Button>
            </div>
          )}
          <WelcomeMessage userId={userId} openSigninModal={onOpenSigninModal} />

          <input
            ref={FileInputRef}
            style={{ display: 'none' }}
            type="file"
            onChange={handlePicture}
            accept="image/*"
          />
        </div>
      </div>
    </ErrorBoundary>
  );

  function handlePicture(event) {
    const reader = new FileReader();
    const file = event.target.files[0];
    if (file.size / 1000 > MAX_PROFILE_PIC_SIZE) {
      return onShowAlert();
    }
    reader.onload = onLoadImage;
    reader.readAsDataURL(file);
    event.target.value = null;
  }
}
