import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import Button from 'components/Button';
import ProfilePic from 'components/ProfilePic';
import { useChatContext } from 'contexts';
import { mobileMaxWidth } from 'constants/css';
import { socket } from 'constants/io';
import { css } from '@emotion/css';

CallScreen.propTypes = {
  style: PropTypes.object
};

export default function CallScreen({ style }) {
  const {
    state: { channelOnCall, ...state },
    actions: { onShowIncoming }
  } = useChatContext();

  const calling = useMemo(() => {
    return !channelOnCall.callReceived && channelOnCall.imCalling;
  }, [channelOnCall.callReceived, channelOnCall.imCalling]);

  const answerButtonShown = useMemo(
    () => !channelOnCall.imCalling && !channelOnCall.incomingShown,
    [channelOnCall.imCalling, channelOnCall.incomingShown]
  );

  const peers = useMemo(() => {
    return Object.keys(channelOnCall.members)?.map((memberId) => {
      return Number(memberId);
    });
  }, [channelOnCall.members]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 5,
        ...style
      }}
    >
      {peers.length > 0 && (
        <div
          style={{
            display: 'flex',
            height: 'CALC(70% - 1rem)',
            justifyContent: 'center',
            alignItems: 'flex-end'
          }}
        >
          {peers.map((peerId, index) => {
            return (
              <ProfilePic
                key={peerId}
                className={css`
                  height: 10rem;
                  width: 10rem;
                  margin-left: ${index === 0 ? 0 : '1.5rem'};
                  @media (max-width: ${mobileMaxWidth}) {
                    height: 7rem;
                    width: 7rem;
                  }
                `}
                userId={peerId}
                profilePicUrl={state['user' + peerId]?.profilePicUrl}
              />
            );
          })}
        </div>
      )}
      {answerButtonShown && (
        <div
          style={{
            width: '100%',
            height: 'CALC(30% + 1rem)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Button filled color="green">
            <Icon icon="phone-volume" />
            <span style={{ marginLeft: '1rem' }} onClick={handleShowIncoming}>
              Answer
            </span>
          </Button>
        </div>
      )}
      {calling && (
        <div
          style={{
            height: 'CALC(30% + 1rem)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          Calling...
        </div>
      )}
    </div>
  );

  function handleShowIncoming() {
    socket.emit('confirm_call_reception', channelOnCall.id);
    onShowIncoming();
  }
}