import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import InfoEditForm from './InfoEditForm';
import PasswordInputModal from './PasswordInputModal';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { stringIsEmpty, trimUrl } from 'helpers/stringHelpers';
import { timeSince } from 'helpers/timeStampHelpers';
import { unix } from 'moment';
import { useHistory } from 'react-router-dom';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useChatContext, useInputContext } from 'contexts';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import localize from 'constants/localize';

const editLabel = localize('edit');
const memberSinceLabel = localize('memberSince');
const userEmailNotVerifiedLabel = localize('userEmailNotVerified');
const wasLastActiveLabel = localize('wasLastActive');
const websiteLabel = localize('Website');
const youtubeLabel = localize('youtube');

BasicInfos.propTypes = {
  authLevel: PropTypes.number,
  className: PropTypes.string,
  email: PropTypes.string,
  verifiedEmail: PropTypes.string,
  online: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  profilePicUrl: PropTypes.string,
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
  authLevel,
  className,
  email,
  verifiedEmail,
  online,
  joinDate,
  lastActive,
  profilePicUrl,
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
  const {
    userId: myId,
    username: myUsername,
    authLevel: myAuthLevel,
    banned
  } = useMyState();
  const loadDMChannel = useAppContext((v) => v.requestHelpers.loadDMChannel);
  const uploadProfileInfo = useAppContext(
    (v) => v.requestHelpers.uploadProfileInfo
  );
  const onSetUserState = useAppContext((v) => v.user.actions.onSetUserState);
  const sendVerificationEmail = useAppContext(
    (v) => v.requestHelpers.sendVerificationEmail
  );
  const onOpenNewChatTab = useChatContext((v) => v.actions.onOpenNewChatTab);
  const userInfoOnEdit = useInputContext(
    (v) => v.state.userInfo.userInfoOnEdit
  );
  const onSetUserInfoOnEdit = useInputContext(
    (v) => v.actions.onSetUserInfoOnEdit
  );
  const [passwordInputModalShown, setPasswordInputModalShown] = useState(false);
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
  }, []);

  const displayedTime = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return unix(joinDate).format('MM/DD/YYYY');
    }
    return unix(joinDate).format('LL');
  }, [joinDate]);

  const messageUserLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return <span style={{ marginLeft: '0.7rem' }}>채팅하기</span>;
    }
    return (
      <span style={{ marginLeft: '0.7rem' }}>
        {online ? 'Chat' : 'Message'}
        <span className="desktop">
          {online ? ' with' : ''} {username}
        </span>
      </span>
    );
  }, [online, username]);

  return (
    <div className={className} style={style}>
      <div style={{ marginBottom: '0.5rem' }}>
        {memberSinceLabel} {displayedTime}
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
                {myId !== userId && !emailVerified && (
                  <div style={{ color: Color.gray(), fontSize: '1.2rem' }}>
                    {userEmailNotVerifiedLabel}
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
                <span>{youtubeLabel}: </span>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                  {youtubeName || trimUrl(youtubeUrl)}
                </a>
              </div>
            )}
            {website && (
              <div style={{ marginTop: '0.5rem' }}>
                <span>{websiteLabel}: </span>
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
            onClick={() => setPasswordInputModalShown(true)}
          >
            <Icon icon="pencil-alt" />
            <span style={{ marginLeft: '0.7rem' }}>{editLabel}</span>
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
              `${wasLastActiveLabel} ${timeSince(lastActive)}`
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
                {messageUserLabel}
              </Button>
            )}
          </div>
        </div>
      ) : null}
      {passwordInputModalShown && (
        <PasswordInputModal
          onHide={() => setPasswordInputModalShown(false)}
          onConfirm={() => {
            setVerificationEmailSent(false);
            onSetUserInfoOnEdit(true);
          }}
        />
      )}
    </div>
  );

  async function handleTalkButtonClick() {
    const { pathId } = await loadDMChannel({
      recepient: { id: userId, username }
    });
    if (mounted.current) {
      if (!pathId) {
        onOpenNewChatTab({
          user: {
            username: myUsername,
            id: myId,
            profilePicUrl,
            authLevel: myAuthLevel
          },
          recepient: {
            username: username,
            id: userId,
            profilePicUrl: profilePicUrl,
            authLevel
          }
        });
      }
      history.push(pathId ? `/chat/${pathId}` : `/chat/new`);
    }
  }

  async function onEditedInfoSubmit({
    email,
    website,
    youtubeName,
    youtubeUrl
  }) {
    if (banned?.posting) {
      return;
    }
    const data = await uploadProfileInfo({
      email,
      website,
      youtubeName,
      youtubeUrl
    });
    onSetUserState({ userId, newState: data });
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
      { label: localize('email'), value: email },
      { label: localize('youtube'), value: youtubeUrl },
      { label: localize('website'), value: website }
    ].filter((item) => !item.value);
    const emptyItemsArray = unfilledItems.map((item) => item.label);
    if (SELECTED_LANGUAGE === 'kr') {
      const emptyItemsString =
        emptyItemsArray.length === 3
          ? `${emptyItemsArray[0]}, ${emptyItemsArray[1]}, ${emptyItemsArray[2]}`
          : emptyItemsArray.join(', ');
      return `아래 '수정' 버튼을 누르신 후 다음 정보를 등록하세요: ${emptyItemsString}`;
    }
    const emptyItemsString =
      emptyItemsArray.length === 3
        ? `${emptyItemsArray[0]}, ${emptyItemsArray[1]}, and ${emptyItemsArray[2]}`
        : emptyItemsArray.join(' and ');
    return `Add your ${emptyItemsString} address${
      emptyItemsArray.length > 1 ? 'es' : ''
    } by tapping the "Edit" button below`;
  }
}
