import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ChannelDetail from './ChannelDetail';
import Button from 'components/Button';
import { mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { parseChannelPath } from 'helpers';
import { useMyState } from 'helpers/hooks';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import { useAppContext, useChatContext } from 'contexts';
import localize from 'constants/localize';

const alreadyJoinedLabel = localize('alreadyJoined');

Invitation.propTypes = {
  invitationChannelId: PropTypes.number,
  invitePath: PropTypes.number.isRequired,
  channelId: PropTypes.number.isRequired,
  messageId: PropTypes.number.isRequired,
  onAcceptGroupInvitation: PropTypes.func.isRequired,
  sender: PropTypes.object.isRequired
};

export default function Invitation({
  invitationChannelId,
  invitePath,
  channelId: currentChannelId,
  messageId,
  onAcceptGroupInvitation,
  sender
}) {
  const { userId, profileTheme } = useMyState();
  const loadChatChannel = useAppContext(
    (v) => v.requestHelpers.loadChatChannel
  );
  const channelPathIdHash = useChatContext((v) => v.state.channelPathIdHash);
  const channelsObj = useChatContext((v) => v.state.channelsObj);
  const onSetChatInvitationDetail = useChatContext(
    (v) => v.actions.onSetChatInvitationDetail
  );
  const onUpdateChannelPathIdHash = useChatContext(
    (v) => v.actions.onUpdateChannelPathIdHash
  );

  useEffect(() => {
    if (!invitationChannelId) {
      init();
    }
    async function init() {
      const channelId =
        channelPathIdHash[invitePath] || parseChannelPath(invitePath);
      if (!channelPathIdHash[invitePath]) {
        onUpdateChannelPathIdHash({
          channelId,
          pathId: invitePath
        });
      }
      const { channel } = await loadChatChannel({
        channelId,
        isForInvitation: true,
        skipUpdateChannelId: true
      });
      onSetChatInvitationDetail({
        channel,
        messageId,
        channelId: currentChannelId
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationChannelId]);

  const invitationChannel = useMemo(
    () => channelsObj[invitationChannelId],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitationChannelId]
  );

  const alreadyJoined = useMemo(() => {
    const memberIds = invitationChannel?.members.map((member) => member.id);
    return memberIds?.includes(userId);
  }, [invitationChannel, userId]);

  const desktopHeight = useMemo(() => {
    if (userId === sender.id) {
      if (!invitationChannel || invitationChannel.members?.length > 3) {
        return '9rem';
      } else {
        return '7rem';
      }
    } else {
      if (!invitationChannel || invitationChannel.members?.length > 3) {
        return '14rem';
      } else {
        return '12rem';
      }
    }
  }, [invitationChannel, sender.id, userId]);

  const mobileHeight = useMemo(() => {
    if (userId === sender.id) {
      if (!invitationChannel || invitationChannel.members?.length > 3) {
        return '7rem';
      } else {
        return '5rem';
      }
    } else {
      if (!invitationChannel || invitationChannel.members?.length > 3) {
        return '12rem';
      } else {
        return '10rem';
      }
    }
  }, [invitationChannel, sender.id, userId]);

  const handleAcceptGroupInvitation = useCallback(() => {
    onAcceptGroupInvitation(invitePath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitePath]);

  const acceptGroupInvitationLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return `${sender.username}님의 초대 수락`;
    }
    return `Accept ${sender.username}'s Invitation`;
  }, [sender?.username]);

  return (
    <div
      className={css`
        height: ${desktopHeight};
        @media (max-width: ${mobileMaxWidth}) {
          height: ${mobileHeight};
        }
      `}
    >
      {invitationChannel && (
        <ChannelDetail
          invitePath={invitePath}
          alreadyJoined={alreadyJoined}
          channelName={invitationChannel.channelName}
          members={invitationChannel.members}
        />
      )}
      {userId !== sender.id && (
        <Button
          filled
          color={profileTheme}
          onClick={handleAcceptGroupInvitation}
          disabled={alreadyJoined}
        >
          {alreadyJoined ? alreadyJoinedLabel : acceptGroupInvitationLabel}
        </Button>
      )}
    </div>
  );
}
