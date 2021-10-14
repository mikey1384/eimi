import React, { useEffect, useState, useRef } from 'react';
import { useAppContext, useExploreContext } from 'contexts';
import ErrorBoundary from 'components/ErrorBoundary';
import SectionPanel from 'components/SectionPanel';
import VideoThumb from 'components/VideoThumb';
import Icon from 'components/Icon';
import { useMyState } from 'helpers/hooks';

export default function ContinueWatchingPanel() {
  const { userId, loaded: profileLoaded } = useMyState();
  const {
    requestHelpers: { loadContinueWatching }
  } = useAppContext();
  const {
    state: {
      videos: {
        continueWatchingVideos,
        continueWatchingLoaded,
        loadMoreContinueWatchingButton,
        showingRecommendedVideos
      },
      prevUserId
    },
    actions: { onLoadContinueWatching, onLoadMoreContinueWatching }
  } = useExploreContext();
  const [loaded, setLoaded] = useState(continueWatchingLoaded);
  const loadingRef = useRef(false);
  const loadedRef = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    if (
      !loadingRef.current &&
      profileLoaded &&
      (!(continueWatchingLoaded || loadedRef.current) || userId !== prevUserId)
    ) {
      init();
    }

    async function init() {
      loadingRef.current = true;
      const { videos, loadMoreButton, noVideosToContinue } =
        await loadContinueWatching();
      if (mounted.current) {
        onLoadContinueWatching({
          videos,
          loadMoreButton,
          showingRecommendedVideos: !!noVideosToContinue
        });
      }
      loadedRef.current = true;
      if (mounted.current) {
        setLoaded(true);
      }
      loadingRef.current = false;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continueWatchingLoaded, userId, prevUserId, profileLoaded]);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      <SectionPanel
        loaded={loaded || loadedRef.current}
        innerStyle={{ fontSize: '1.5rem' }}
        emptyMessage="We don't have any videos to recommend to you at the moment"
        isEmpty={continueWatchingVideos.length === 0}
        title={
          loaded || loadedRef.current ? (
            showingRecommendedVideos ? (
              'Recommended'
            ) : (
              'Continue Watching'
            )
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                verticalAlign: 0
              }}
            >
              <span>Loading</span>
              <Icon style={{ marginLeft: '1rem' }} icon="spinner" pulse />
            </div>
          )
        }
        onLoadMore={handleLoadMoreContinueWatching}
        loadMoreButtonShown={loadMoreContinueWatchingButton}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          {continueWatchingVideos.map((video, index) => (
            <VideoThumb
              to={`videos/${video.id}${
                showingRecommendedVideos ? '' : '?continue=true'
              }`}
              style={{
                width: `CALC(25% - 0.75rem)`,
                marginLeft: index % 4 > 0 ? '1rem' : 0,
                marginTop: index > 3 ? '1.5rem' : 0
              }}
              key={index}
              video={video}
              user={video.uploader}
            />
          ))}
        </div>
      </SectionPanel>
    </ErrorBoundary>
  );

  async function handleLoadMoreContinueWatching() {
    const { videos, loadMoreButton } = await loadContinueWatching(
      continueWatchingVideos[continueWatchingVideos.length - 1]?.viewTimeStamp
    );
    if (mounted.current) {
      onLoadMoreContinueWatching({ videos, loadMoreButton });
    }
  }
}
