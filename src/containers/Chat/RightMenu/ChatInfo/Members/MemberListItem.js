import React, { memo, useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ProfilePic from 'components/ProfilePic';
import UsernameText from 'components/Texts/UsernameText';
import Icon from 'components/Icon';
import ConfirmModal from 'components/Modals/ConfirmModal';
import { useChatContext } from 'contexts';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { socket } from 'constants/io';

MemberListItem.propTypes = {
  onlineMembers: PropTypes.object,
  creatorId: PropTypes.number,
  isClass: PropTypes.bool,
  member: PropTypes.object,
  style: PropTypes.object
};

function MemberListItem({ onlineMembers, creatorId, isClass, member, style }) {
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const {
    state: {
      ['user' + member.id]: { isAway, isBusy, username, profilePicUrl } = {}
    },
    actions: { onSetUserData }
  } = useChatContext();

  useEffect(() => {
    if (member.id && member.username) {
      onSetUserData(member);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const usernameWidth = useMemo(() => (isClass ? '20%' : '42%'), [isClass]);

  return username ? (
    <div
      style={{
        display: 'flex',
        width: '100%',
        padding: '1rem',
        ...style
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ProfilePic
          className={css`
            height: 4rem;
            width: 4rem;
            @media (max-width: ${mobileMaxWidth}) {
              height: 3rem;
              width: 3rem;
            }
          `}
          userId={member.id}
          profilePicUrl={profilePicUrl}
          online={!!onlineMembers[member.id]}
          isAway={isAway}
          isBusy={isBusy}
          statusShown
        />
        <UsernameText
          style={{
            color: Color.darkerGray(),
            marginLeft: '2rem',
            maxWidth:
              creatorId === member.id
                ? usernameWidth
                : `CALC(${usernameWidth} + 2rem)`
          }}
          user={{ id: member.id, username }}
        />
        {creatorId === member.id ? (
          <div
            style={{
              marginLeft: '1rem'
            }}
          >
            <Icon icon="crown" style={{ color: Color.brownOrange() }} />
          </div>
        ) : null}
      </div>
      {confirmModalShown && (
        <ConfirmModal
          onHide={() => setConfirmModalShown(false)}
          title="Showing over 2 students at a time may slow down the performance or cause errors"
          onConfirm={handleConfirmShowPeer}
        />
      )}
    </div>
  ) : null;

  function handleConfirmShowPeer() {
    socket.emit('show_peer_stream', member.id);
    setConfirmModalShown(false);
  }
}

export default memo(MemberListItem);
