import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import StatusMsg from 'components/UserDetails/StatusMsg';
import StatusInput from 'components/UserDetails/StatusInput';
import RankBar from 'components/RankBar';
import Button from 'components/Button';
import Icon from 'components/Icon';
import DropDownButton from 'components/Buttons/DropdownButton';
import LoginToViewContent from 'components/LoginToViewContent';
import BasicInfos from './BasicInfos';
import ConfirmModal from 'components/Modals/ConfirmModal';
import BioEditModal from 'components/Modals/BioEditModal';
import Bio from 'components/Texts/Bio';
import ErrorBoundary from 'components/ErrorBoundary';
import request from 'axios';
import URL from 'constants/URL';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { Color, mobileMaxWidth } from 'constants/css';
import { useAppContext, useContentContext, useInputContext } from 'contexts';
import {
  addEmoji,
  renderText,
  stringIsEmpty,
  finalizeEmoji
} from 'helpers/stringHelpers';
import localize from 'constants/localize';

const editLabel = localize('edit');
const enterMessageForVisitorsLabel = localize('enterMessageForVisitors');
const removeLabel = localize('remove');

Intro.propTypes = {
  profile: PropTypes.object,
  selectedTheme: PropTypes.string.isRequired
};

export default function Intro({ profile, selectedTheme }) {
  const {
    requestHelpers: { auth, uploadGreeting, uploadBio }
  } = useAppContext();
  const {
    actions: {
      onRemoveStatusMsg,
      onUpdateStatusMsg,
      onUpdateGreeting,
      onUpdateBio
    }
  } = useContentContext();
  const {
    state: { editedStatusMsg, editedStatusColor },
    actions: { onSetEditedStatusColor, onSetEditedStatusMsg }
  } = useInputContext();
  const { userId, banned } = useMyState();
  const [bioEditModalShown, setBioEditModalShown] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  useEffect(() => {
    onSetEditedStatusColor('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const {
    authLevel,
    email,
    id,
    verifiedEmail,
    greeting,
    joinDate,
    lastActive,
    online,
    profilePicUrl,
    profileTheme,
    profileFirstRow,
    profileSecondRow,
    profileThirdRow,
    statusColor,
    statusMsg,
    username,
    website,
    youtubeName,
    youtubeUrl
  } = profile;

  const StatusInputRef = useRef(null);
  const bioExists = profileFirstRow || profileSecondRow || profileThirdRow;
  const usernameColor = Color[selectedTheme]();
  let defaultMessage = `<p>Welcome to <b style="color: ${usernameColor}">${username}</b>'s Profile Page</p>`;
  const displayedStatusColor =
    userId === profile.id ? editedStatusColor : statusColor;
  const displayedStatusMsg =
    userId === profile.id ? editedStatusMsg : statusMsg;

  return (
    <ErrorBoundary>
      <SectionPanel
        loaded
        customColorTheme={selectedTheme}
        title={greeting || 'Welcome!'}
        canEdit={id === userId}
        placeholder={enterMessageForVisitorsLabel}
        onEditTitle={handleEditGreeting}
      >
        <div
          style={{
            display: 'flex',
            minHeight: '10rem',
            width: '100%',
            marginTop: '1rem',
            paddingBottom: '4rem'
          }}
        >
          <div
            style={{
              width: 'CALC(50% - 1rem)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: '1rem'
            }}
          >
            <div
              style={{
                width: '90%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              {userId === profile.id && (
                <StatusInput
                  innerRef={StatusInputRef}
                  profile={profile}
                  statusColor={editedStatusColor || statusColor}
                  editedStatusMsg={editedStatusMsg}
                  setColor={(color) => onSetEditedStatusColor(color)}
                  onTextChange={(event) => {
                    onSetEditedStatusMsg(
                      addEmoji(renderText(event.target.value))
                    );
                    if (!event.target.value) {
                      onSetEditedStatusColor('');
                    }
                  }}
                  onCancel={() => {
                    onSetEditedStatusMsg('');
                    onSetEditedStatusColor('');
                  }}
                  onStatusSubmit={handleStatusMsgSubmit}
                />
              )}
              {(!stringIsEmpty(statusMsg) || displayedStatusMsg) && (
                <StatusMsg
                  style={{
                    fontSize: '1.6rem',
                    width: '100%',
                    marginTop: profile.twinkleXP > 0 || bioExists ? '1rem' : 0,
                    marginBottom:
                      profile.twinkleXP > 0 || bioExists ? '2rem' : 0
                  }}
                  statusColor={
                    displayedStatusColor || statusColor || 'logoBlue'
                  }
                  statusMsg={displayedStatusMsg || statusMsg}
                />
              )}
              {userId === profile.id &&
                !editedStatusMsg &&
                !stringIsEmpty(statusMsg) && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '-1rem',
                      marginBottom:
                        profile.twinkleXP > 0 || bioExists ? '1rem' : 0
                    }}
                  >
                    <Button
                      transparent
                      onClick={() => {
                        onSetEditedStatusMsg(statusMsg);
                        StatusInputRef.current.focus();
                      }}
                    >
                      <Icon icon="pencil-alt" />
                      <span style={{ marginLeft: '0.7rem' }}>{editLabel}</span>
                    </Button>
                    <Button
                      transparent
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => setConfirmModalShown(true)}
                    >
                      <Icon icon="trash-alt" />
                      <span style={{ marginLeft: '0.7rem' }}>
                        {removeLabel}
                      </span>
                    </Button>
                  </div>
                )}
              {userId !== profile.id && stringIsEmpty(statusMsg) && (
                <div
                  style={{
                    width: '100%',
                    fontSize: '2rem',
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center'
                  }}
                  dangerouslySetInnerHTML={{ __html: defaultMessage }}
                />
              )}
            </div>
          </div>
          {userId ? (
            <BasicInfos
              authLevel={authLevel}
              profileTheme={profileTheme}
              className={css`
                font-size: 1.7rem;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.5rem;
                }
              `}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 'CALC(50% - 1rem)',
                marginLeft: '1rem',
                marginBottom: '1rem'
              }}
              email={email}
              verifiedEmail={verifiedEmail}
              joinDate={joinDate}
              online={online}
              lastActive={lastActive}
              profilePicUrl={profilePicUrl}
              userId={id}
              username={username}
              selectedTheme={selectedTheme}
              website={website}
              youtubeName={youtubeName}
              youtubeUrl={youtubeUrl}
            />
          ) : (
            <LoginToViewContent />
          )}
        </div>
        {profile.twinkleXP > 0 && (
          <RankBar
            profile={profile}
            className={css`
              margin-left: ${!!profile.rank && profile.rank < 4
                ? '-11px'
                : '-10px'};
              margin-right: ${!!profile.rank && profile.rank < 4
                ? '-11px'
                : '-10px'};
              @media (max-width: ${mobileMaxWidth}) {
                margin-left: -1rem !important;
                margin-right: -1rem !important;
              }
            `}
            style={{
              display: 'block',
              borderRadius: 0,
              borderRight: 0,
              borderLeft: 0
            }}
          />
        )}
        {!profile.twinkleXP && bioExists && (
          <hr
            style={{
              padding: '1px',
              background: '#fff',
              borderTop: `2px solid ${Color[selectedTheme || 'logoBlue'](0.6)}`,
              borderBottom: `2px solid ${Color[selectedTheme || 'logoBlue'](
                0.6
              )}`
            }}
          />
        )}
        {bioExists && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {userId === profile.id && (
              <DropDownButton
                direction="left"
                opacity={0.7}
                style={{ right: 0, top: '1rem', position: 'absolute' }}
                skeuomorphic
                color="darkerGray"
                menuProps={[
                  {
                    label: editLabel,
                    onClick: () => setBioEditModalShown(true)
                  },
                  {
                    label: removeLabel,
                    onClick: () =>
                      uploadBio({
                        firstLine: '',
                        secondLine: '',
                        thirdLine: ''
                      })
                  }
                ]}
              />
            )}
            <Bio
              style={{ fontSize: '1.6rem', marginBottom: '1rem' }}
              firstRow={profileFirstRow}
              secondRow={profileSecondRow}
              thirdRow={profileThirdRow}
            />
          </div>
        )}
        {!bioExists && profile.id === userId && (
          <div
            style={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              marginTop: '1rem'
            }}
          >
            <Button
              style={{ fontSize: '2rem' }}
              transparent
              onClick={() => setBioEditModalShown(true)}
            >
              Add a Bio
            </Button>
          </div>
        )}
      </SectionPanel>
      {bioEditModalShown && (
        <BioEditModal
          firstLine={profileFirstRow}
          secondLine={profileSecondRow}
          thirdLine={profileThirdRow}
          onSubmit={handleUploadBio}
          onHide={() => setBioEditModalShown(false)}
        />
      )}
      {confirmModalShown && (
        <ConfirmModal
          onConfirm={handleRemoveStatus}
          onHide={() => setConfirmModalShown(false)}
          title={`Remove Status Message`}
        />
      )}
    </ErrorBoundary>
  );

  async function handleUploadBio(params) {
    if (banned?.posting) {
      return;
    }
    const data = await uploadBio({
      ...params,
      profileId: profile.id
    });
    onUpdateBio(data);
    setBioEditModalShown(false);
  }

  async function handleEditGreeting(greeting) {
    if (banned?.posting) {
      return;
    }
    await uploadGreeting({ greeting });
    onUpdateGreeting({ greeting, userId });
  }

  async function handleRemoveStatus() {
    await request.delete(`${URL}/user/statusMsg`, auth());
    onRemoveStatusMsg(userId);
    setConfirmModalShown(false);
  }

  async function handleStatusMsgSubmit() {
    if (banned?.posting) {
      return;
    }
    const statusMsg = finalizeEmoji(editedStatusMsg);
    const statusColor = editedStatusColor || profile.statusColor;
    const { data } = await request.post(
      `${URL}/user/statusMsg`,
      {
        statusMsg,
        statusColor
      },
      auth()
    );
    onSetEditedStatusColor('');
    onSetEditedStatusMsg('');
    onUpdateStatusMsg(data);
  }
}
