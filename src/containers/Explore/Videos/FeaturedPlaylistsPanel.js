import React, { useEffect, useMemo, useRef } from 'react';
import PlaylistsPanel from './PlaylistsPanel';
import ErrorBoundary from 'components/ErrorBoundary';
import ButtonGroup from 'components/Buttons/ButtonGroup';
import SelectFeaturedPlaylists from '../Modals/SelectFeaturedPlaylists';
import ReorderFeaturedPlaylists from '../Modals/ReorderFeaturedPlaylists';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useExploreContext } from 'contexts';
import localize from 'constants/localize';

const featuredPlaylistsLabel = localize('featuredPlaylists');
const selectLabel = localize('select');
const reorderLabel = localize('reorder');

export default function FeaturedPlaylistsPanel() {
  const {
    requestHelpers: { loadFeaturedPlaylists, loadPlaylistList }
  } = useAppContext();
  const { canPinPlaylists, userId } = useMyState();
  const {
    state: {
      videos: {
        featuredPlaylists,
        featuredPlaylistsLoaded,
        reorderFeaturedPlaylistsShown,
        selectFeaturedPlaylistsModalShown
      },
      prevUserId
    },
    actions: {
      onCloseReorderFeaturedPlaylists,
      onCloseSelectFeaturedPlaylists,
      onLoadFeaturedPlaylists,
      onOpenReorderFeaturedPlaylists,
      onOpenSelectFeaturedPlaylists
    }
  } = useExploreContext();
  const loadedRef = useRef(false);
  useEffect(() => {
    if (
      !(featuredPlaylistsLoaded || loadedRef.current) ||
      userId !== prevUserId
    ) {
      init();
    }
    async function init() {
      const playlists = await loadFeaturedPlaylists();
      onLoadFeaturedPlaylists(playlists);
      loadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredPlaylistsLoaded, userId, prevUserId]);

  const menuButtons = useMemo(() => {
    const buttons = [
      {
        label: selectLabel,
        onClick: handleOpenSelectPlaylistsToPinModal,
        skeuomorphic: true,
        color: 'darkerGray'
      }
    ];
    if (featuredPlaylists.length > 0) {
      buttons.push({
        label: reorderLabel,
        onClick: onOpenReorderFeaturedPlaylists,
        skeuomorphic: true,
        color: 'darkerGray'
      });
    }
    return buttons;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredPlaylists.length]);

  return (
    <ErrorBoundary>
      <PlaylistsPanel
        buttonGroupShown={!!canPinPlaylists}
        buttonGroup={() => (
          <ButtonGroup style={{ marginLeft: 'auto' }} buttons={menuButtons} />
        )}
        title={featuredPlaylistsLabel}
        userId={userId}
        playlists={featuredPlaylists}
        loaded={featuredPlaylistsLoaded || loadedRef.current}
      />
      {selectFeaturedPlaylistsModalShown && (
        <SelectFeaturedPlaylists
          selectedPlaylists={featuredPlaylists.map((playlist) => {
            return playlist.id;
          })}
          onHide={onCloseSelectFeaturedPlaylists}
        />
      )}
      {reorderFeaturedPlaylistsShown && (
        <ReorderFeaturedPlaylists
          playlistIds={featuredPlaylists.map((playlist) => playlist.id)}
          onHide={onCloseReorderFeaturedPlaylists}
        />
      )}
    </ErrorBoundary>
  );

  async function handleOpenSelectPlaylistsToPinModal() {
    const data = await loadPlaylistList();
    onOpenSelectFeaturedPlaylists(data);
  }
}
