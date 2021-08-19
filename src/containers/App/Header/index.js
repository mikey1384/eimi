import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AccountMenu from './AccountMenu';
import MainNavs from './MainNavs';
import TwinkleLogo from './TwinkleLogo';
import ErrorBoundary from 'components/ErrorBoundary';
import Peer from 'simple-peer';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth, desktopMinWidth } from 'constants/css';
import { socket } from 'constants/io';
import { useHistory, useLocation } from 'react-router-dom';
import { getSectionFromPathname } from 'helpers';
import { useMyState } from 'helpers/hooks';
import {
  useAppContext,
  useContentContext,
  useViewContext,
  useHomeContext,
  useMissionContext,
  useNotiContext,
  useChatContext
} from 'contexts';
import {
  GENERAL_CHAT_ID,
  TURN_USERNAME,
  TURN_PASSWORD
} from 'constants/defaultValues';

Header.propTypes = {
  onMobileMenuOpen: PropTypes.func,
  style: PropTypes.object
};

export default function Header({ onMobileMenuOpen, style = {} }) {
  const { pathname } = useLocation();
  const history = useHistory();
  const usingChat = getSectionFromPathname(pathname)?.section === 'chat';
  const {
    requestHelpers: {
      checkIfHomeOutdated,
      checkVersion,
      fetchNotifications,
      getNumberOfUnreadMessages,
      loadChatChannel,
      loadChat,
      loadRankings,
      loadCoins,
      loadXP,
      updateChatLastRead
    }
  } = useAppContext();
  const { defaultSearchFilter, userId, username, loggedIn, profilePicUrl } =
    useMyState();
  const {
    state: {
      channelOnCall,
      channelsObj,
      chatType,
      selectedChannelId,
      myStream,
      numUnreads,
      chatStatus
    },
    actions: {
      onChangeAwayStatus,
      onChangeBusyStatus,
      onChangeOnlineStatus,
      onChangeChatSubject,
      onEnableChatSubject,
      onSetReconnecting,
      onChangeChannelOwner,
      onChangeChannelSettings,
      onClearRecentChessMessage,
      onHideAttachment,
      onCallReceptionConfirm,
      onDeleteMessage,
      onEnterChannelWithId,
      onEditMessage,
      onLeaveChannel,
      onGetNumberOfUnreadMessages,
      onHangUp,
      onInitChat,
      onReceiveFirstMsg,
      onReceiveMessage,
      onReceiveMessageOnDifferentChannel,
      onReceiveVocabActivity,
      onSetCall,
      onSetMembersOnCall,
      onSetMyStream,
      onSetOnlineUserData,
      onSetPeerStreams,
      onShowIncoming,
      onShowOutgoing,
      onUpdateCollectorsRankings
    }
  } = useChatContext();

  const {
    state: { category, feeds, subFilter },
    actions: { onSetFeedsOutdated }
  } = useHomeContext();

  const {
    state: {
      numNewNotis,
      numNewPosts,
      totalRewardedTwinkles,
      totalRewardedTwinkleCoins,
      versionMatch
    },
    actions: {
      onChangeSocketStatus,
      onCheckVersion,
      onFetchNotifications,
      onGetRanks,
      onIncreaseNumNewPosts,
      onIncreaseNumNewNotis,
      onNotifyChatSubjectChange,
      onShowUpdateNotice
    }
  } = useNotiContext();

  const {
    state: { pageVisible }
  } = useViewContext();

  const {
    state,
    actions: {
      onAttachReward,
      onUpdateProfileInfo,
      onUpdateUserCoins,
      onChangeUserXP,
      onLikeContent,
      onRecommendContent,
      onUploadComment,
      onUploadReply
    }
  } = useContentContext();

  const {
    actions: { onUpdateMissionAttempt }
  } = useMissionContext();

  const prevProfilePicUrl = useRef(profilePicUrl);
  const peersRef = useRef({});
  const prevMyStreamRef = useRef(null);
  const prevIncomingShown = useRef(false);
  const membersOnCall = useRef({});
  const receivedCallSignals = useRef([]);

  useEffect(() => {
    socket.disconnect();
    socket.connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    socket.on('ban_status_updated', handleBanStatusUpdate);
    socket.on('signal_received', handleCallSignal);
    socket.on('online_status_changed', handleOnlineStatusChange);
    socket.on('away_status_changed', handleAwayStatusChange);
    socket.on('busy_status_changed', handleBusyStatusChange);
    socket.on('call_terminated', handleCallTerminated);
    socket.on('call_reception_confirmed', handleCallReceptionConfirm);
    socket.on('chat_invitation_received', handleChatInvitation);
    socket.on('chat_message_deleted', onDeleteMessage);
    socket.on('chat_message_edited', onEditMessage);
    socket.on('chat_subject_purchased', onEnableChatSubject);
    socket.on('channel_owner_changed', onChangeChannelOwner);
    socket.on('channel_settings_changed', onChangeChannelSettings);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('left_chat_from_another_tab', handleLeftChatFromAnotherTab);
    socket.on('message_attachment_hid', onHideAttachment);
    socket.on('mission_rewards_received', handleMissionRewards);
    socket.on('new_call_member', handleNewCallMember);
    socket.on('new_call_started', handleNewCall);
    socket.on('new_post_uploaded', onIncreaseNumNewPosts);
    socket.on('new_notification_received', handleNewNotification);
    socket.on('new_message_received', handleReceiveMessage);
    socket.on('new_reward_posted', handleNewReward);
    socket.on('new_recommendation_posted', handleNewRecommendation);
    socket.on('peer_accepted', handlePeerAccepted);
    socket.on('peer_hung_up', handlePeerHungUp);
    socket.on('subject_changed', handleSubjectChange);
    socket.on('username_changed', handleUsernameChange);
    socket.on('new_vocab_activity_received', handleReceiveVocabActivity);

    return function cleanUp() {
      socket.removeListener('ban_status_updated', handleBanStatusUpdate);
      socket.removeListener('signal_received', handleCallSignal);
      socket.removeListener('online_status_changed', handleOnlineStatusChange);
      socket.removeListener('away_status_changed', handleAwayStatusChange);
      socket.removeListener('busy_status_changed', handleBusyStatusChange);
      socket.removeListener('call_terminated', handleCallTerminated);
      socket.removeListener(
        'call_reception_confirmed',
        handleCallReceptionConfirm
      );
      socket.removeListener('chat_invitation_received', handleChatInvitation);
      socket.removeListener('chat_message_deleted', onDeleteMessage);
      socket.removeListener('chat_message_edited', onEditMessage);
      socket.removeListener('chat_subject_purchased', onEnableChatSubject);
      socket.removeListener('channel_owner_changed', onChangeChannelOwner);
      socket.removeListener(
        'channel_settings_changed',
        onChangeChannelSettings
      );
      socket.removeListener('connect', handleConnect);
      socket.removeListener('disconnect', handleDisconnect);
      socket.removeListener(
        'left_chat_from_another_tab',
        handleLeftChatFromAnotherTab
      );
      socket.removeListener('message_attachment_hid', onHideAttachment);
      socket.removeListener('mission_rewards_received', handleMissionRewards);
      socket.removeListener('new_call_member', handleNewCallMember);
      socket.removeListener('new_call_started', handleNewCall);
      socket.removeListener('new_post_uploaded', onIncreaseNumNewPosts);
      socket.removeListener('new_notification_received', handleNewNotification);
      socket.removeListener('new_message_received', handleReceiveMessage);
      socket.removeListener('new_reward_posted', handleNewReward);
      socket.removeListener(
        'new_recommendation_posted',
        handleNewRecommendation
      );
      socket.removeListener('peer_accepted', handlePeerAccepted);
      socket.removeListener('peer_hung_up', handlePeerHungUp);
      socket.removeListener('subject_changed', handleSubjectChange);
      socket.removeListener('username_changed', handleUsernameChange);
      socket.removeListener(
        'new_vocab_activity_received',
        handleReceiveVocabActivity
      );
    };

    function handleBanStatusUpdate(banStatus) {
      onUpdateProfileInfo({ userId, banned: banStatus });
    }

    async function handleConnect() {
      console.log('connected to socket');
      onClearRecentChessMessage();
      onChangeSocketStatus(true);
      handleCheckVersion();
      handleCheckOutdated();
      if (userId) {
        handleGetNumberOfUnreadMessages();
        socket.emit('bind_uid_to_socket', { userId, username, profilePicUrl });
        socket.emit('enter_my_notification_channel', userId);
        handleLoadChat();
      }

      async function handleLoadChat() {
        onSetReconnecting(true);
        const data = await loadChat(selectedChannelId);
        onInitChat(data);
        socket.emit(
          'check_online_members',
          selectedChannelId,
          ({ membersOnline }) => {
            const members = Object.entries(membersOnline).map(
              ([, member]) => member
            );
            for (let member of members) {
              onSetOnlineUserData(member);
            }
          }
        );
      }

      async function handleCheckOutdated() {
        const firstFeed = feeds[0];
        if (
          firstFeed?.lastInteraction &&
          (category === 'uploads' || category === 'recommended')
        ) {
          const outdated = await checkIfHomeOutdated({
            lastInteraction: feeds[0] ? feeds[0].lastInteraction : 0,
            category,
            subFilter
          });
          onSetFeedsOutdated(outdated.length > 0);
        }
      }

      async function handleCheckVersion() {
        const data = await checkVersion();
        onCheckVersion(data);
      }

      async function handleGetNumberOfUnreadMessages() {
        const numUnreads = await getNumberOfUnreadMessages();
        onGetNumberOfUnreadMessages(numUnreads);
      }
    }

    function handleOnlineStatusChange({ userId, member, isOnline }) {
      onChangeOnlineStatus({ userId, member, isOnline });
    }
    function handleAwayStatusChange({ userId, isAway }) {
      if (chatStatus[userId] && chatStatus[userId].isAway !== isAway) {
        onChangeAwayStatus({ userId, isAway });
      }
    }

    function handleBusyStatusChange({ userId, isBusy }) {
      if (chatStatus[userId] && chatStatus[userId].isBusy !== isBusy) {
        onChangeBusyStatus({ userId, isBusy });
      }
    }

    function handleCallTerminated() {
      onSetCall({});
      onSetMyStream(null);
      onSetPeerStreams({});
      onSetMembersOnCall({});
      membersOnCall.current = {};
      peersRef.current = {};
      prevMyStreamRef.current = null;
      prevIncomingShown.current = false;
      receivedCallSignals.current = [];
    }

    function handleCallReceptionConfirm(channelId) {
      onCallReceptionConfirm(channelId);
    }

    function handleCallSignal({ peerId, signal, to }) {
      if (to === userId && peersRef.current[peerId]) {
        if (peersRef.current[peerId].signal) {
          try {
            peersRef.current[peerId].signal(signal);
          } catch (error) {
            console.error(error);
          }
        }
      }
    }

    function handleChatInvitation({ message, members, isClass }) {
      let duplicate = false;
      if (selectedChannelId === 0) {
        if (
          members.filter((member) => member.userId !== userId)[0].userId ===
          channelsObj[selectedChannelId].members.filter(
            (member) => member.userId !== userId
          )[0].userId
        ) {
          duplicate = true;
        }
      }
      socket.emit('join_chat_group', message.channelId);
      onReceiveFirstMsg({ message, duplicate, isClass, pageVisible });
    }

    function handleDisconnect(reason) {
      console.log('disconnected from socket. reason: ', reason);
      onChangeSocketStatus(false);
    }

    async function handleLeftChatFromAnotherTab(channelId) {
      if (selectedChannelId === channelId) {
        onLeaveChannel(channelId);
        const data = await loadChatChannel({ channelId: GENERAL_CHAT_ID });
        onEnterChannelWithId({ data });
      } else {
        onLeaveChannel(channelId);
      }
    }

    function handleMissionRewards({
      includesCoinReward,
      includesXpReward,
      missionId
    }) {
      if (includesCoinReward) {
        handleUpdateMyCoins();
      }
      if (includesXpReward) {
        handleUpdateMyXp();
      }
      onUpdateMissionAttempt({
        missionId,
        newState: { status: 'pass', tryingAgain: false }
      });
    }

    function handleNewNotification({ type, target, likes, comment }) {
      if (type === 'like') {
        onLikeContent({
          likes,
          contentId: target.contentId,
          contentType: target.contentType
        });
      }
      if (type === 'comment') {
        if (target.commentId || target.replyId) {
          onUploadReply({
            ...target,
            ...comment
          });
        } else {
          onUploadComment({
            contentId: target.contentId,
            contentType: target.contentType,
            ...comment
          });
        }
      }
      onIncreaseNumNewNotis();
    }

    function handleNewRecommendation({
      uploaderId,
      recommendations,
      recommenderId,
      target,
      newlyRecommended
    }) {
      if (state[target.contentType + target.contentId]) {
        onRecommendContent({
          recommendations,
          contentId: target.contentId,
          contentType: target.contentType
        });
      }
      if (
        uploaderId === userId &&
        newlyRecommended &&
        target.contentType !== 'pass' &&
        recommenderId !== userId
      ) {
        onIncreaseNumNewNotis();
      }
    }

    async function handleNewReward({ target, reward, receiverId }) {
      if (reward.rewarderId !== userId) {
        onAttachReward({
          reward,
          contentId: target.contentId,
          contentType: target.contentType
        });
      }
      if (receiverId === userId) {
        const data = await fetchNotifications();
        onFetchNotifications(data);
      }
    }

    function handleNewCallMember({ socketId, memberId }) {
      if (!channelOnCall.members?.[memberId]) {
        onSetMembersOnCall({ [memberId]: socketId });
      }
      membersOnCall.current[socketId] = true;
    }

    function handleNewCall({ memberId, channelId, peerId }) {
      if (!channelOnCall.id) {
        if (memberId !== userId && !membersOnCall.current[peerId]) {
          onSetCall({
            channelId,
            isClass: channelsObj[selectedChannelId]?.isClass
          });
        }
      }
      if (
        !channelOnCall.id ||
        (channelOnCall.id === channelId && channelOnCall.imCalling)
      ) {
        if (!channelOnCall.members?.[memberId]) {
          onSetMembersOnCall({ [memberId]: peerId });
        }
        membersOnCall.current[peerId] = true;
      }
    }

    function handlePeerAccepted({ channelId, to, peerId }) {
      if (to === userId) {
        try {
          handleNewPeer({
            peerId,
            channelId,
            stream: myStream
          });
        } catch (error) {
          console.error(error);
        }
      }
    }

    function handlePeerHungUp({ channelId, memberId, peerId }) {
      if (
        Number(channelId) === Number(channelOnCall.id) &&
        membersOnCall.current[peerId]
      ) {
        delete membersOnCall.current[peerId];
        onHangUp({ peerId, memberId, iHungUp: memberId === userId });
      }
    }

    async function handleReceiveMessage({ message, channel, newMembers }) {
      const messageIsForCurrentChannel =
        message.channelId === selectedChannelId;
      const senderIsUser = message.userId === userId;
      if (senderIsUser) return;
      if (messageIsForCurrentChannel) {
        if (usingChat) {
          await updateChatLastRead(message.channelId);
        }
        onReceiveMessage({
          message,
          pageVisible,
          usingChat,
          newMembers
        });
      }
      if (!messageIsForCurrentChannel) {
        onReceiveMessageOnDifferentChannel({
          channel,
          pageVisible,
          usingChat
        });
      }
      if (message.targetMessage?.userId === userId && message.rewardAmount) {
        handleUpdateMyXp();
      }
    }

    function handleUsernameChange({ userId, newUsername }) {
      onUpdateProfileInfo({ userId, username: newUsername });
    }

    function handleReceiveVocabActivity(activity) {
      const senderIsNotTheUser = activity.userId !== userId;
      if (senderIsNotTheUser) {
        onReceiveVocabActivity({
          activity,
          usingVocabSection: chatType === 'vocabulary'
        });
        onUpdateCollectorsRankings({
          id: activity.userId,
          username: activity.username,
          profilePicUrl: activity.profilePicUrl,
          numWordsCollected: activity.numWordsCollected,
          rank: activity.rank
        });
      }
    }

    function handleSubjectChange({ channelId, subject }) {
      if (channelId === GENERAL_CHAT_ID) {
        onNotifyChatSubjectChange(subject);
      }
      onChangeChatSubject({ subject, channelId });
    }
  });

  useEffect(() => {
    socket.emit(
      'check_online_members',
      selectedChannelId,
      ({ callData, membersOnline }) => {
        if (callData && Object.keys(membersOnCall.current).length === 0) {
          const membersHash = {};
          for (let member of Object.entries(membersOnline)
            .map(([, member]) => member)
            .filter((member) => !!callData.peers[member.socketId])) {
            membersHash[member.id] = member.socketId;
          }
          onSetCall({
            channelId: selectedChannelId,
            isClass: channelsObj[selectedChannelId]?.isClass
          });
          onSetMembersOnCall(membersHash);
          membersOnCall.current = callData.peers;
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  useEffect(() => {
    if (userId && profilePicUrl !== prevProfilePicUrl.current) {
      socket.emit('change_profile_pic', profilePicUrl);
    }
    prevProfilePicUrl.current = profilePicUrl;
  }, [profilePicUrl, userId, username]);

  useEffect(() => {
    if (
      !prevIncomingShown.current &&
      channelOnCall.incomingShown &&
      !channelOnCall.imCalling
    ) {
      for (let peerId in membersOnCall.current) {
        socket.emit('inform_peer_signal_accepted', {
          peerId,
          channelId: channelOnCall.id
        });
        socket.emit('join_call', { channelId: channelOnCall.id, userId });
        handleNewPeer({
          peerId: peerId,
          channelId: channelOnCall.id,
          initiator: true
        });
      }
    }
    prevIncomingShown.current = channelOnCall.incomingShown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelOnCall.id, channelOnCall.incomingShown, channelOnCall.imCalling]);

  useEffect(() => {
    const newNotiNum =
      (pathname === '/' ? numNewPosts : 0) + numNewNotis + numUnreads;
    document.title = `Twinkle${newNotiNum > 0 ? ' *' : ''}`;
    console.log(newNotiNum, pathname, numNewPosts, numNewNotis, numUnreads);
  }, [numNewNotis, numNewPosts, numUnreads, pathname]);

  useEffect(() => {
    onShowUpdateNotice(!versionMatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionMatch]);

  useEffect(() => {
    if (myStream && !prevMyStreamRef.current) {
      if (channelOnCall.imCalling) {
        socket.emit('start_new_call', channelOnCall.id);
      } else {
        for (let peerId in membersOnCall.current) {
          try {
            if (peersRef.current[peerId]) {
              peersRef.current[peerId].addStream(myStream);
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    prevMyStreamRef.current = myStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelOnCall.isClass, myStream]);

  return (
    <ErrorBoundary>
      <nav
        className={`unselectable ${css`
          z-index: 30000;
          position: relative;
          font-family: sans-serif, Arial, Helvetica;
          font-size: 1.7rem;
          background: #fff;
          display: flex;
          box-shadow: 0 3px 3px -3px ${Color.black(0.6)};
          align-items: center;
          width: 100%;
          margin-bottom: 0px;
          height: 4.5rem;
          @media (min-width: ${desktopMinWidth}) {
            top: 0;
          }
          @media (max-width: ${mobileMaxWidth}) {
            bottom: 0;
            box-shadow: none;
            height: 5rem;
            border-top: 1px solid ${Color.borderGray()};
          }
        `}`}
        style={{
          justifyContent: 'space-around',
          position: 'fixed',
          ...style
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <TwinkleLogo style={{ marginLeft: '3rem' }} />
          <MainNavs
            loggedIn={loggedIn}
            defaultSearchFilter={defaultSearchFilter}
            numChatUnreads={numUnreads}
            numNewNotis={numNewNotis}
            numNewPosts={numNewPosts}
            onMobileMenuOpen={onMobileMenuOpen}
            pathname={pathname}
            totalRewardAmount={
              totalRewardedTwinkles + totalRewardedTwinkleCoins
            }
          />
          <AccountMenu
            className={css`
              margin-right: 3rem;
              @media (max-width: ${mobileMaxWidth}) {
                margin-right: 0;
              }
            `}
            history={history}
          />
        </div>
      </nav>
    </ErrorBoundary>
  );

  function handleNewPeer({ peerId, channelId, initiator, stream }) {
    if (initiator || channelOnCall.members[userId]) {
      peersRef.current[peerId] = new Peer({
        config: {
          iceServers: [
            {
              urls: 'turn:13.230.133.153:3478',
              username: TURN_USERNAME,
              credential: TURN_PASSWORD
            },
            {
              urls: 'stun:stun.l.google.com:19302'
            }
          ]
        },
        initiator,
        stream
      });

      peersRef.current[peerId].on('signal', (signal) => {
        socket.emit('send_signal', {
          socketId: peerId,
          signal,
          channelId
        });
      });

      peersRef.current[peerId].on('stream', (stream) => {
        onShowIncoming();
        onSetPeerStreams({ peerId, stream });
      });

      peersRef.current[peerId].on('connect', () => {
        onShowOutgoing();
      });

      peersRef.current[peerId].on('close', () => {
        delete peersRef.current[peerId];
      });

      peersRef.current[peerId].on('error', (e) => {
        console.error('Peer error %s:', peerId, e);
      });
    }
  }

  async function handleUpdateMyCoins() {
    const coins = await loadCoins();
    onUpdateUserCoins({ coins, userId });
  }

  async function handleUpdateMyXp() {
    const { all, top30s } = await loadRankings();
    onGetRanks({ all, top30s });
    const { xp, rank } = await loadXP();
    onChangeUserXP({ xp, rank, userId });
  }
}
