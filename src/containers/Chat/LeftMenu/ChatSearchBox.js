import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from 'components/Loading';
import SearchInput from 'components/Texts/SearchInput';
import { useMyState, useSearch } from 'helpers/hooks';
import { useAppContext, useChatContext } from 'contexts';
import { Color } from 'constants/css';
import { useHistory } from 'react-router-dom';

ChatSearchBox.propTypes = {
  style: PropTypes.object
};

function ChatSearchBox({ style }) {
  const history = useHistory();
  const {
    requestHelpers: { searchChat }
  } = useAppContext();
  const { profilePicUrl, userId, username, authLevel } = useMyState();
  const {
    state: { chatSearchResults, selectedChannelId },
    actions: { onClearChatSearchResults, onOpenNewChatTab, onSearchChat }
  } = useChatContext();
  const [searchText, setSearchText] = useState('');
  const handleSearchChat = useCallback(async (text) => {
    const data = await searchChat(text);
    onSearchChat(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { handleSearch, searching } = useSearch({
    onSearch: handleSearchChat,
    onClear: onClearChatSearchResults,
    onSetSearchText: setSearchText
  });
  const handleSelect = useCallback(
    async (item) => {
      if (item.primary || !!item.pathId) {
        history.push(`/chat/${item.pathId}`);
      } else {
        onOpenNewChatTab({
          user: { username, id: userId, profilePicUrl, authLevel },
          recepient: {
            username: item.label,
            id: item.id,
            profilePicUrl: item.profilePicUrl,
            authLevel: item.authLevel
          }
        });
        history.push(`/chat/new`);
      }
      setSearchText('');
      onClearChatSearchResults();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authLevel, profilePicUrl, selectedChannelId, userId, username]
  );

  return (
    <div style={style}>
      <SearchInput
        placeholder="Search..."
        onChange={handleSearch}
        value={searchText}
        searchResults={chatSearchResults}
        renderItemLabel={(item) =>
          !item.primary || (item.primary && item.twoPeople) ? (
            <span>
              {item.label}{' '}
              {item.subLabel && <small>{`(${item.subLabel})`}</small>}
            </span>
          ) : (
            <span
              style={{
                color: item.channelId === 2 ? Color.green() : Color.logoBlue(),
                fontWeight: 'bold'
              }}
            >
              {item.label}
            </span>
          )
        }
        onClickOutSide={() => {
          setSearchText('');
          onClearChatSearchResults();
        }}
        onSelect={handleSelect}
      />
      {searching && (
        <Loading style={{ height: '7rem', position: 'absolute' }} />
      )}
    </div>
  );
}

export default memo(ChatSearchBox);
