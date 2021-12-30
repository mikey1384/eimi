import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ProfilePic from 'components/ProfilePic';
import UsernameText from 'components/Texts/UsernameText';
import Icon from 'components/Icon';
import { useChatContext } from 'contexts';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { useMyState, useContentState } from 'helpers/hooks';

MemberListItem.propTypes = {
  onlineMembers: PropTypes.object,
  creatorId: PropTypes.number,
  member: PropTypes.object,
  style: PropTypes.object
};

function MemberListItem({ onlineMembers, creatorId, member, style }) {
  const chatStatus = useChatContext((v) => v.state.chatStatus);
  const { isAway, isBusy, username, profilePicUrl } =
    chatStatus[member.id] || {};
  const { username: memberName, profilePicUrl: memberProfilePicUrl } =
    useContentState({ contentId: member.id, contentType: 'user' });
  const { userId: myId } = useMyState();
  return username || member.username ? (
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
          profilePicUrl={
            memberProfilePicUrl || member.profilePicUrl || profilePicUrl
          }
          online={!!onlineMembers[member.id]}
          isAway={member.id === myId ? false : isAway}
          isBusy={member.id === myId ? false : isBusy}
          statusShown
        />
        <UsernameText
          style={{
            color: Color.darkerGray(),
            marginLeft: '2rem',
            maxWidth: creatorId === member.id ? '42%' : `CALC(42% + 2rem)`
          }}
          className={css`
            font-size: 1.5rem;
            @media (max-width: ${mobileMaxWidth}) {
              font-size: 1.3rem;
            }
          `}
          user={{
            id: member.id,
            username: memberName || member.username || username
          }}
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
    </div>
  ) : null;
}

export default memo(MemberListItem);
