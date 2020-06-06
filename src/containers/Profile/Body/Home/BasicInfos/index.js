import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import InfoEditForm from './InfoEditForm';
import { css } from 'emotion';
import { Color, mobileMaxWidth } from 'constants/css';
import { stringIsEmpty, trimUrl } from 'helpers/stringHelpers';
import { timeSince } from 'helpers/timeStampHelpers';
import { unix } from 'moment';
import { useHistory } from 'react-router-dom';
import { useMyState } from 'helpers/hooks';
import {
  useAppContext,
  useChatContext,
  useContentContext,
  useInputContext
} from 'contexts';

BasicInfos.propTypes = {
  className: PropTypes.string,
  email: PropTypes.string,
  verifiedEmail: PropTypes.string,
  online: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  profilePicId: PropTypes.number,
  profileTheme: PropTypes.string,
  joinDate: PropTypes.string,
  lastActive: PropTypes.string,
  selectedTheme: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  website: PropTypes.string,
  youtubeName: PropTypes.string,
  youtubeUrl: PropTypes.string,
  style: PropTypes.object
};

export default function BasicInfos({
  className,
  email,
  verifiedEmail,
  online,
  joinDate,
  lastActive,
  profilePicId,
  profileTheme,
  selectedTheme,
  userId,
  username,
  website,
  youtubeName,
  youtubeUrl,
  style
}) {
  const history = useHistory();
  const { userId: myId, username: myUsername } = useMyState();
  const {
    requestHelpers: {
      loadChat,
      loadDMChannel,
      uploadProfileInfo,
      sendVerificationEmail
    }
  } = useAppContext();
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  const {
    state: { loaded },
    actions: { onInitChat, onOpenDirectMessageChannel }
  } = useChatContext();
  const {
    state: {
      userInfo: { userInfoOnEdit }
    },
    actions: { onSetUserInfoOnEdit }
  } = useInputContext();
  const [emailCheckHighlighted, setEmailCheckHighlighted] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const mounted = useRef(true);
  const emailVerified = useMemo(
    () => !stringIsEmpty(email) && email === verifiedEmail,
    [email, verifiedEmail]
  );

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  });

  return (
    <div className={className} style={style}>
      <div
        style={{
          color: Color[selectedTheme](),
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontSize: '2rem'
        }}
      >
        About {username}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        Member since {unix(joinDate).format('LL')}
      </div>
      {userInfoOnEdit && userId === myId && (
        <InfoEditForm
          email={email}
          youtubeUrl={youtubeUrl}
          youtubeName={youtubeName}
          website={website}
          onCancel={() => onSetUserInfoOnEdit(false)}
          onSubmit={onEditedInfoSubmit}
        />
      )}
      {(!userInfoOnEdit || userId !== myId) &&
        (email || youtubeUrl || website) && (
          <div
            className={css`
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1.4rem;
              }
            `}
            style={{ textAlign: 'center' }}
          >
            {email && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      lineHeight:
                        myId === userId && !emailVerified ? '0.5rem' : undefined
                    }}
                  >
                    <a
                      href={`mailto:${email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {email}
                    </a>
                  </div>
                  <Icon
                    onMouseEnter={() =>
                      setEmailCheckHighlighted(
                        !verificationEmailSent && myId === userId
                      )
                    }
                    onMouseLeave={() => setEmailCheckHighlighted(false)}
                    className={css`
                      margin-left: 0.5rem;
                    `}
                    style={{
                      cursor:
                        verificationEmailSent ||
                        myId !== userId ||
                        emailVerified
                          ? 'default'
                          : 'pointer',
                      color:
                        emailVerified || emailCheckHighlighted
                          ? Color[selectedTheme]()
                          : Color.lighterGray()
                    }}
                    icon="check-circle"
                    onClick={
                      myId !== userId || emailVerified
                        ? () => {}
                        : onVerifyEmail
                    }
                  />
                </div>
                {myId === userId && !emailVerified && (
                  <div>
                    <a
                      onMouseEnter={() =>
                        setEmailCheckHighlighted(!verificationEmailSent)
                      }
                      onMouseLeave={() => setEmailCheckHighlighted(false)}
                      style={{
                        textDecoration: emailCheckHighlighted
                          ? 'underline'
                          : undefined,
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: Color[selectedTheme]()
                      }}
                      onClick={
                        verificationEmailSent ? goToEmail : onVerifyEmail
                      }
                    >
                      {verificationEmailSent
                        ? 'Email has been sent. Tap here to check your inbox'
                        : 'Please verify your email'}
                    </a>
                  </div>
                )}
                {myId !== userId && !emailVerified && (
                  <div style={{ color: Color.gray(), fontSize: '1.2rem' }}>
                    {`This user's email has not been verified, yet`}
                  </div>
                )}
              </>
            )}
            {youtubeUrl && (
              <div
                style={{
                  marginTop: '0.5rem'
                }}
              >
                <span>YouTube: </span>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                  {youtubeName || trimUrl(youtubeUrl)}
                </a>
              </div>
            )}
            {website && (
              <div style={{ marginTop: '0.5rem' }}>
                <span>Website: </span>
                <a href={website} target="_blank" rel="noopener noreferrer">
                  {trimUrl(website)}
                </a>
              </div>
            )}
          </div>
        )}
      {!userInfoOnEdit &&
        myId === userId &&
        (!email || !youtubeUrl || !website) && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              marginTop: email || youtubeUrl ? '1rem' : 0
            }}
          >
            {renderEditMessage({ email, youtubeUrl, website })}
          </div>
        )}
      {myId === userId ? (
        !userInfoOnEdit ? (
          <Button
            style={{
              marginTop: !email || !youtubeUrl || !website ? 0 : '1rem',
              marginBottom: '0.5rem'
            }}
            transparent
            onClick={() => onSetUserInfoOnEdit(true)}
          >
            <Icon icon="pencil-alt" />
            <span style={{ marginLeft: '0.7rem' }}>Edit</span>
          </Button>
        ) : null
      ) : lastActive ? (
        <div
          style={{
            marginTop: email || youtubeUrl ? '1rem' : 0,
            textAlign: 'center'
          }}
        >
          <div>
            {online ? (
              <span
                style={{ fontWeight: 'bold', color: Color.green() }}
              >{`${username} is online`}</span>
            ) : (
              `Was last active ${timeSince(lastActive)}`
            )}
            {myId !== userId && (
              <Button
                style={{
                  marginTop: '1rem',
                  width: '100%'
                }}
                skeuomorphic
                color={selectedTheme || profileTheme || 'logoBlue'}
                onClick={handleTalkButtonClick}
              >
                <Icon icon="comments" />
                <span style={{ marginLeft: '0.7rem' }}>
                  {online ? 'Talk' : 'Message'}
                  <span className="desktop">
                    {online ? ' with' : ''} {username}
                  </span>
                </span>
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  async function handleTalkButtonClick() {
    if (!loaded) {
      const initialData = await loadChat();
      onInitChat(initialData);
    }
    const data = await loadDMChannel({
      recepient: { id: userId, username }
    });
    onOpenDirectMessageChannel({
      user: { id: myId, username: myUsername },
      recepient: { id: userId, username, profilePicId },
      channelData: data
    });
    history.push('/chat');
  }

  function goToEmail() {
    const emailProvider = 'http://www.' + email.split('@')[1];
    window.location = emailProvider;
  }

  async function onEditedInfoSubmit({
    email,
    website,
    youtubeName,
    youtubeUrl
  }) {
    const data = await uploadProfileInfo({
      email,
      website,
      youtubeName,
      youtubeUrl
    });
    onUpdateProfileInfo({ userId, ...data });
    if (mounted.current) {
      onSetUserInfoOnEdit(false);
    }
  }

  function onVerifyEmail() {
    sendVerificationEmail({ email, userId });
    setEmailCheckHighlighted(false);
    setVerificationEmailSent(true);
  }

  function renderEditMessage({ email, youtubeUrl, website }) {
    const unfilledItems = [
      { label: 'email', value: email },
      { label: 'YouTube', value: youtubeUrl },
      { label: 'website', value: website }
    ].filter(item => !item.value);
    const emptyItemsArray = unfilledItems.map(item => item.label);
    const emptyItemsString =
      emptyItemsArray.length === 3
        ? `${emptyItemsArray[0]}, ${emptyItemsArray[1]}, and ${emptyItemsArray[2]}`
        : emptyItemsArray.join(' and ');
    return `Add your ${emptyItemsString} address${
      emptyItemsArray.length > 1 ? 'es' : ''
    } by tapping the "Edit" button below`;
  }
}
