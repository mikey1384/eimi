import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Channel from './Channel';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import ErrorBoundary from 'components/ErrorBoundary';
import { useAppContext, useChatContext } from 'contexts';
import { addEvent, removeEvent } from 'helpers/listenerHelpers';

Channels.propTypes = {
  onChannelEnter: PropTypes.func.isRequired
};

function Channels({ onChannelEnter }) {
  const {
    requestHelpers: { loadMoreChannels }
  } = useAppContext();
  const {
    state: {
      chatType,
      channelsObj,
      classChannelIds,
      customChannelNames,
      favoriteChannelIds,
      homeChannelIds,
      classLoadMoreButton,
      homeLoadMoreButton,
      selectedChannelId,
      selectedChatTab
    },
    actions: { onLoadMoreChannels }
  } = useChatContext();
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [prevChannelIds, setPrevChannelIds] = useState(homeChannelIds);
  const ChannelListRef = useRef(null);
  const loading = useRef(false);
  const channelIds = useMemo(() => {
    switch (selectedChatTab) {
      case 'home':
        return homeChannelIds;
      case 'favorite':
        return favoriteChannelIds;
      case 'class':
        return classChannelIds;
      default:
        return [];
    }
  }, [classChannelIds, favoriteChannelIds, homeChannelIds, selectedChatTab]);

  const loadMoreButtonShown = useMemo(
    () =>
      selectedChatTab === 'home' ? homeLoadMoreButton : classLoadMoreButton,
    [classLoadMoreButton, homeLoadMoreButton, selectedChatTab]
  );

  useEffect(() => {
    const ChannelList = ChannelListRef.current;
    addEvent(ChannelList, 'scroll', onListScroll);

    function onListScroll() {
      if (
        loadMoreButtonShown &&
        ChannelListRef.current.scrollTop >=
          (ChannelListRef.current.scrollHeight -
            ChannelListRef.current.offsetHeight) *
            0.7
      ) {
        handleLoadMoreChannels();
      }
    }

    return function cleanUp() {
      removeEvent(ChannelList, 'scroll', onListScroll);
    };
  });

  useEffect(() => {
    if (
      selectedChannelId === homeChannelIds[0] &&
      homeChannelIds[0] !== prevChannelIds[0]
    ) {
      ChannelListRef.current.scrollTop = 0;
    }
    setPrevChannelIds(homeChannelIds);
  }, [homeChannelIds, selectedChannelId, prevChannelIds]);

  return (
    <ErrorBoundary
      innerRef={ChannelListRef}
      style={{
        overflow: 'scroll',
        top: '17.5rem',
        width: '80%',
        height: '100%'
      }}
    >
      {channelIds
        ?.map((channelId) => channelsObj[channelId])
        .filter((channel) => !channel?.isHidden)
        .map((channel) => (
          <Channel
            key={channel.id}
            channel={channel}
            customChannelNames={customChannelNames}
            chatType={chatType}
            onChannelEnter={onChannelEnter}
            selectedChannelId={selectedChannelId}
          />
        ))}
      {loadMoreButtonShown && (
        <LoadMoreButton
          color="green"
          filled
          loading={channelsLoading}
          onClick={handleLoadMoreChannels}
          style={{
            width: '100%',
            borderRadius: 0,
            border: 0
          }}
        />
      )}
    </ErrorBoundary>
  );

  async function handleLoadMoreChannels() {
    const chatTabHash = {
      home: homeChannelIds,
      favorite: favoriteChannelIds,
      class: classChannelIds
    };
    if (!loading.current) {
      setChannelsLoading(true);
      loading.current = true;
      const channelIds = chatTabHash[selectedChatTab];
      const lastId = channelIds[channelIds.length - 1];
      const { lastUpdated } = channelsObj[lastId];
      const channels = await loadMoreChannels({
        type: selectedChatTab,
        lastUpdated,
        lastId,
        currentChannelId: selectedChannelId
      });
      onLoadMoreChannels({ type: selectedChatTab, channels });
      setChannelsLoading(false);
      loading.current = false;
    }
  }
}

export default memo(Channels);
