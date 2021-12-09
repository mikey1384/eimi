import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'components/Link';
import { Color, mobileMaxWidth } from 'constants/css';
import { queryStringForArray } from 'helpers/stringHelpers';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import ErrorBoundary from 'components/ErrorBoundary';
import VideoThumbImage from 'components/VideoThumbImage';
import FilterBar from 'components/FilterBar';
import Notification from 'components/Notification';
import Loading from 'components/Loading';
import SwitchButton from 'components/Buttons/SwitchButton';
import Icon from 'components/Icon';
import request from 'axios';
import URL from 'constants/URL';
import { socket } from 'constants/io';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useNotiContext } from 'contexts';
import localize from 'constants/localize';

const hideWatchedLabel = localize('hideWatched');
const videosLabel = localize('videos');
const newsLabel = localize('news');
const leaderboardLabel = localize('leaderboard');
const rewardsLabel = localize('rewards');
const newVideosLabel = localize('newVideos');
const relatedVideosLabel = localize('relatedVideos');
const upNextLabel = localize('upNext');
const uploadedByLabel = localize('uploadedBy');
const continueWatchingLabel = localize('continueWatching');

NavMenu.propTypes = {
  playlistId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  videoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isContinuing: PropTypes.bool
};

export default function NavMenu({ playlistId, videoId, isContinuing }) {
  const {
    user: {
      actions: { onToggleHideWatched }
    },
    requestHelpers: {
      auth,
      fetchNotifications,
      loadRightMenuVideos,
      toggleHideWatched
    }
  } = useAppContext();
  const { hideWatched, profileTheme, userId } = useMyState();
  const {
    state: { numNewNotis, totalRewardedTwinkles, totalRewardedTwinkleCoins },
    actions: { onFetchNotifications }
  } = useNotiContext();

  const [continueWatchingVideos, setContinueWatchingVideos] = useState([]);
  const [nextVideos, setNextVideos] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [otherVideos, setOtherVideos] = useState([]);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [rewardsExist, setRewardsExist] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState();
  const [filtering, setFiltering] = useState(false);
  const [playlistVideosLoading, setPlaylistVideosLoading] = useState(false);
  const [playlistVideosLoadMoreShown, setPlaylistVideosLoadMoreShown] =
    useState(false);
  const [videoTabActive, setVideoTabActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  const noVideos = useMemo(() => {
    return (
      nextVideos.length +
        relatedVideos.length +
        otherVideos.length +
        playlistVideos.length ===
      0
    );
  }, [
    nextVideos.length,
    otherVideos.length,
    playlistVideos.length,
    relatedVideos.length
  ]);

  useEffect(() => {
    socket.on('new_reward_posted', handleNewReward);

    return function cleanUp() {
      socket.removeListener('new_reward_posted', handleNewReward);
    };

    async function handleNewReward({ receiverId }) {
      if (receiverId === userId) {
        handleFetchNotifications();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    handleLoadRightMenuVideos();
    async function handleLoadRightMenuVideos() {
      try {
        setLoading(true);
        const data = await loadRightMenuVideos({
          videoId,
          playlistId,
          isContinuing
        });
        if (mounted.current) {
          if (data.playlistTitle) {
            setPlaylistTitle(data.playlistTitle);
          }
          if (data.continueWatching) {
            setContinueWatchingVideos(data.continueWatching);
          }
          if (data.nextVideos) {
            setNextVideos(data.nextVideos);
          }
          if (data.relatedVideos) {
            setRelatedVideos(data.relatedVideos);
          }
          if (data.playlistVideos) {
            setPlaylistVideos(data.playlistVideos);
          }
          setPlaylistVideosLoadMoreShown(!!data.playlistVideosLoadMoreShown);
          if (data.otherVideos) {
            setOtherVideos(data.otherVideos);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, hideWatched, userId]);

  useEffect(() => {
    setRewardsExist(totalRewardedTwinkles + totalRewardedTwinkleCoins > 0);
  }, [totalRewardedTwinkles, totalRewardedTwinkleCoins]);

  return (
    <ErrorBoundary
      className={css`
        width: 30%;
        font-size: 2rem;
        > section {
          padding: 1rem;
          background: #fff;
          border: 1px solid ${Color.borderGray()};
          margin-bottom: 1rem;
          p {
            margin-bottom: 1rem;
            font-size: 2.5rem;
            font-weight: bold;
          }
          a {
            font-size: 1.7rem;
            font-weight: bold;
            line-height: 1.7rem;
          }
        }
        @media (max-width: ${mobileMaxWidth}) {
          width: 100%;
          margin: 0;
          padding-bottom: 5rem;
          section {
            margin: 0;
            border-left: 0;
            border-right: 0;
            margin-bottom: 1rem;
          }
        }
      `}
    >
      <FilterBar
        style={{
          border: `1px solid ${Color.borderGray()}`,
          borderBottom: 0
        }}
        className="desktop"
      >
        <nav
          className={videoTabActive ? 'active' : ''}
          onClick={() => setVideoTabActive(true)}
        >
          {videosLabel}
        </nav>
        <nav
          className={`${!videoTabActive ? 'active' : ''} ${
            rewardsExist || numNewNotis > 0 ? 'alert' : ''
          }`}
          onClick={() => setVideoTabActive(false)}
        >
          {rewardsExist ? rewardsLabel : userId ? newsLabel : leaderboardLabel}
        </nav>
      </FilterBar>
      {userId && videoTabActive && playlistId && (
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          {filtering && (
            <Icon
              style={{ marginRight: '1rem', color: Color[profileTheme]() }}
              icon="spinner"
              pulse
            />
          )}
          <SwitchButton
            checked={!!hideWatched}
            label={hideWatchedLabel}
            onChange={handleToggleHideWatched}
            labelStyle={{ fontSize: '1.6rem' }}
          />
        </section>
      )}
      {loading && noVideos && <Loading />}
      {videoTabActive && (
        <>
          {nextVideos.length > 0 && (
            <section key={videoId + 'up next'}>
              <p>{upNextLabel}</p>
              {renderVideos({
                videos: nextVideos,
                arePlaylistVideos: playlistId && playlistVideos.length > 0
              })}
            </section>
          )}
          {continueWatchingVideos.length > 0 && (
            <section key={videoId + 'continue watching'}>
              <p>{continueWatchingLabel}</p>
              {renderVideos({
                videos: continueWatchingVideos,
                areContinueWatchingVideos: true
              })}
            </section>
          )}
          {playlistId && playlistVideos.length > 0 && (
            <section
              key={videoId + 'playlist videos'}
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <Link
                  style={{
                    fontSize: '2.5rem',
                    textDecoration: 'none'
                  }}
                  to={`/playlists/${playlistId}`}
                >
                  {playlistTitle}
                </Link>
              </div>
              {renderVideos({
                videos: playlistVideos,
                arePlaylistVideos: true
              })}
              {playlistVideosLoadMoreShown && (
                <LoadMoreButton
                  loading={playlistVideosLoading}
                  onClick={handleLoadMorePlaylistVideos}
                  color="green"
                  filled
                  style={{ marginTop: '1.5rem', width: '100%' }}
                />
              )}
            </section>
          )}
          {relatedVideos.length > 0 && (
            <section key={videoId + 'related videos'}>
              <p>{relatedVideosLabel}</p>
              {renderVideos({ videos: relatedVideos })}
            </section>
          )}
          {otherVideos.length > 0 && (
            <section key={videoId + 'new videos'}>
              <p>{newVideosLabel}</p>
              {renderVideos({ videos: otherVideos })}
            </section>
          )}
        </>
      )}
      {!videoTabActive && <Notification style={{ paddingTop: 0 }} />}
      <div style={{ height: '1rem', marginTop: '-1rem' }} />
    </ErrorBoundary>
  );

  async function handleFetchNotifications() {
    const data = await fetchNotifications();
    if (mounted.current) {
      onFetchNotifications(data);
    }
  }

  async function handleToggleHideWatched() {
    setFiltering(true);
    const hideWatched = await toggleHideWatched();
    if (mounted.current) {
      onToggleHideWatched(hideWatched);
      setFiltering(false);
    }
  }

  async function handleLoadMorePlaylistVideos() {
    setPlaylistVideosLoading(true);
    const shownVideos = queryStringForArray({
      array: playlistVideos,
      originVar: 'videoId',
      destinationVar: 'shownVideos'
    });
    try {
      const {
        data: {
          playlistVideos: newPlaylistVideos,
          playlistVideosLoadMoreShown: shown
        }
      } = await request.get(
        `${URL}/video/more/playlistVideos?videoId=${videoId}&playlistId=${playlistId}&${shownVideos}`,
        auth()
      );
      setPlaylistVideosLoading(false);
      setPlaylistVideos(playlistVideos.concat(newPlaylistVideos));
      setPlaylistVideosLoadMoreShown(shown);
    } catch (error) {
      console.error(error);
    }
  }

  function renderVideos({
    videos,
    areContinueWatchingVideos,
    arePlaylistVideos
  }) {
    return videos.map((video, index) => (
      <div
        key={video.id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
          marginTop: index !== 0 ? '1rem' : 0
        }}
      >
        <div style={{ width: '50%' }}>
          <Link
            to={`/videos/${video.videoId}${
              arePlaylistVideos
                ? `?playlist=${playlistId}`
                : areContinueWatchingVideos
                ? '?continue=true'
                : ''
            }`}
          >
            <VideoThumbImage
              rewardLevel={video.rewardLevel}
              videoId={video.videoId}
              src={`https://img.youtube.com/vi/${video.content}/mqdefault.jpg`}
            />
          </Link>
        </div>
        <div
          style={{
            paddingLeft: '1rem',
            width: '50%',
            lineHeight: 1.1,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            marginTop: '-0.5rem'
          }}
        >
          <Link
            to={`/videos/${video.videoId}${
              arePlaylistVideos ? `?playlist=${playlistId}` : ''
            }`}
            style={{
              color: video.byUser ? Color[profileTheme](0.9) : Color.blue()
            }}
          >
            {video.title}
          </Link>
          <small
            style={{
              color: Color.gray(),
              display: 'block',
              fontSize: '1.3rem',
              marginTop: '1rem'
            }}
          >
            {uploadedByLabel} {video.username}
          </small>
        </div>
      </div>
    ));
  }
}
