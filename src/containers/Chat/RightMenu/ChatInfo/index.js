import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import Members from './Members';
import ChannelDetails from './ChannelDetails';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { useMyState } from 'helpers/hooks';
import { GENERAL_CHAT_ID } from 'constants/defaultValues';
import localize from 'constants/localize';

const onlineLabel = localize('online');

ChatInfo.propTypes = {
  channelName: PropTypes.string,
  currentChannel: PropTypes.object.isRequired,
  currentChannelOnlineMembers: PropTypes.object.isRequired,
  selectedChannelId: PropTypes.number
};

function ChatInfo({
  selectedChannelId,
  currentChannel,
  currentChannel: { theme },
  currentChannelOnlineMembers,
  channelName
}) {
  const { userId: myId, username, profilePicUrl } = useMyState();

  const displayedChannelMembers = useMemo(() => {
    const totalChannelMembers = currentChannel?.members || [];
    const me = { id: myId, username, profilePicUrl };
    let currentChannelOnlineMembersOtherThanMe = Object.entries(
      currentChannelOnlineMembers
    )
      .map(([, member]) => member)
      .filter((member) => !!member.id && member.id !== myId);
    if (selectedChannelId !== GENERAL_CHAT_ID) {
      const totalChannelMemberIds = totalChannelMembers.map(
        (member) => member.id
      );
      currentChannelOnlineMembersOtherThanMe =
        currentChannelOnlineMembersOtherThanMe.filter((member) =>
          totalChannelMemberIds.includes(member.id)
        );
    }
    const totalValidChannelMembers = totalChannelMembers.filter(
      (member) => !!member.id
    );
    const currentlyOnlineIds = Object.keys(currentChannelOnlineMembers).map(
      (memberId) => Number(memberId)
    );
    if (totalValidChannelMembers.length > 0) {
      const offlineChannelMembers = totalValidChannelMembers.filter(
        (member) =>
          !currentlyOnlineIds.includes(member.id) && member.id !== myId
      );
      return [
        me,
        ...currentChannelOnlineMembersOtherThanMe,
        ...offlineChannelMembers
      ];
    }
    return [me, ...currentChannelOnlineMembersOtherThanMe];
  }, [
    currentChannel?.members,
    myId,
    username,
    profilePicUrl,
    currentChannelOnlineMembers,
    selectedChannelId
  ]);

  const numOnline = useMemo(() => {
    return Object.keys(currentChannelOnlineMembers).length;
  }, [currentChannelOnlineMembers]);

  return (
    <>
      <div
        className={css`
          width: 100%;
          display: flex;
          padding-bottom: 1rem;
          justify-content: center;
          color: ${Color.darkerGray()};
        `}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            width: '100%'
          }}
          className="unselectable"
        >
          <ChannelDetails
            style={{ marginTop: '1rem' }}
            channelId={currentChannel.id}
            channelName={channelName}
          />
          {displayedChannelMembers.length > 2 && (
            <div
              className={css`
                color: ${Color[theme || 'green']()};
                font-size: 1.5rem;
                font-weight: bold;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.3rem;
                }
              `}
            >
              {numOnline}
              {currentChannel.id !== GENERAL_CHAT_ID &&
                '/' + displayedChannelMembers.length}{' '}
              {onlineLabel}
            </div>
          )}
        </div>
      </div>
      <Members
        channelId={selectedChannelId}
        creatorId={currentChannel.creatorId}
        members={displayedChannelMembers}
        onlineMembers={currentChannelOnlineMembers}
      />
    </>
  );
}

export default memo(ChatInfo);
