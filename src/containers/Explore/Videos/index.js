import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from 'components/Buttons/ButtonGroup';
import FeaturedPlaylistsPanel from './FeaturedPlaylistsPanel';
import PlaylistsPanel from './PlaylistsPanel';
import ContinueWatchingPanel from './ContinueWatchingPanel';
import AddPlaylistModal from 'components/Modals/AddPlaylistModal';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { scrollElementToCenter } from 'helpers';
import { useMyState, useSearch } from 'helpers/hooks';
import { useAppContext, useExploreContext, useInputContext } from 'contexts';
import localize from 'constants/localize';

const addPlaylistLabel = localize('addPlaylist');
const allPlaylistsLabel = localize('allPlaylists');

Videos.propTypes = {
  history: PropTypes.object.isRequired
};

export default function Videos({ history }) {
  const loadPlaylists = useAppContext((v) => v.requestHelpers.loadPlaylists);
  const searchContent = useAppContext((v) => v.requestHelpers.searchContent);
  const { authLevel, userId } = useMyState();
  const addPlaylistModalShown = useExploreContext(
    (v) => v.state.videos.addPlaylistModalShown
  );
  const loadMorePlaylistsButton = useExploreContext(
    (v) => v.state.videos.loadMorePlaylistsButton
  );
  const loadMoreSearchedPlaylistsButton = useExploreContext(
    (v) => v.state.videos.loadMoreSearchedPlaylistsButton
  );
  const allPlaylistsLoaded = useExploreContext(
    (v) => v.state.videos.allPlaylistsLoaded
  );
  const allPlaylists = useExploreContext((v) => v.state.videos.allPlaylists);
  const searchedPlaylists = useExploreContext(
    (v) => v.state.videos.searchedPlaylists
  );
  const prevUserId = useExploreContext((v) => v.state.prevUserId);
  const onCloseAddPlaylistModal = useExploreContext(
    (v) => v.actions.onCloseAddPlaylistModal
  );
  const onLoadPlaylists = useExploreContext((v) => v.actions.onLoadPlaylists);
  const onOpenAddPlaylistModal = useExploreContext(
    (v) => v.actions.onOpenAddPlaylistModal
  );
  const onSetSearchedPlaylists = useExploreContext(
    (v) => v.actions.onSetSearchedPlaylists
  );
  const onUploadPlaylist = useExploreContext((v) => v.actions.onUploadPlaylist);

  const {
    state: { playlistSearchText },
    actions: { onSetSearchText }
  } = useInputContext();
  const { handleSearch, searching } = useSearch({
    onSearch: handleSearchPlaylist,
    onClear: () =>
      onSetSearchedPlaylists({ playlists: [], loadMoreButton: false }),
    onSetSearchText: (searchText) =>
      onSetSearchText({ category: 'playlist', searchText })
  });
  const AllPlaylistsPanelRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!(allPlaylistsLoaded || loadedRef.current) || userId !== prevUserId) {
      init();
    }
    async function init() {
      const { results, loadMoreButton } = await loadPlaylists();
      onLoadPlaylists({
        playlists: results,
        loadMoreButton
      });
      loadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlaylistsLoaded, userId, prevUserId]);

  const playlists = useMemo(
    () =>
      !stringIsEmpty(playlistSearchText) ? searchedPlaylists : allPlaylists,
    [allPlaylists, playlistSearchText, searchedPlaylists]
  );

  return (
    <div>
      <ContinueWatchingPanel />
      <FeaturedPlaylistsPanel history={history} />
      <PlaylistsPanel
        key="allplaylists"
        style={{ marginTop: '2.5rem' }}
        innerRef={AllPlaylistsPanelRef}
        buttonGroup={() => (
          <ButtonGroup
            style={{
              marginLeft: 'auto',
              opacity: !!userId && authLevel > 0 ? 1 : 0
            }}
            buttons={[
              {
                label: `+ ${addPlaylistLabel}`,
                onClick: onOpenAddPlaylistModal,
                skeuomorphic: true,
                color: 'darkerGray',
                disabled: !userId || authLevel === 0
              }
            ]}
          />
        )}
        title={allPlaylistsLabel}
        loadMoreButton={
          !stringIsEmpty(playlistSearchText)
            ? loadMoreSearchedPlaylistsButton
            : loadMorePlaylistsButton
        }
        userId={userId}
        playlists={playlists}
        loaded={allPlaylistsLoaded || loadedRef.current}
        isSearching={searching}
        onSearch={handleSearch}
        searchQuery={playlistSearchText}
      />
      {addPlaylistModalShown && (
        <AddPlaylistModal
          onUploadPlaylist={onUploadPlaylist}
          onHide={onCloseAddPlaylistModal}
          focusPlaylistPanelAfterUpload={() =>
            scrollElementToCenter(AllPlaylistsPanelRef.current, 150)
          }
        />
      )}
    </div>
  );

  async function handleSearchPlaylist(text) {
    const { results, loadMoreButton } = await searchContent({
      filter: 'playlist',
      searchText: text,
      limit: 3
    });
    onSetSearchedPlaylists({ playlists: results, loadMoreButton });
  }
}
