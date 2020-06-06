import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Loading from 'components/Loading';
import XPVideoPlayer from 'components/XPVideoPlayer';
import Link from 'components/Link';
import VideoThumbImage from 'components/VideoThumbImage';
import { useHistory } from 'react-router-dom';
import { css } from 'emotion';
import { mobileMaxWidth } from 'constants/css';
import { useAppContext, useContentContext } from 'contexts';
import { useContentState } from 'helpers/hooks';

TwinkleVideo.propTypes = {
  imageOnly: PropTypes.bool,
  onPlay: PropTypes.func,
  style: PropTypes.object,
  videoId: PropTypes.number.isRequired
};

export default function TwinkleVideo({ imageOnly, onPlay, style, videoId }) {
  const history = useHistory();
  const {
    requestHelpers: { loadContent }
  } = useAppContext();
  const {
    actions: { onInitContent }
  } = useContentContext();
  const {
    loaded,
    notFound,
    byUser,
    content,
    hasHqThumb,
    rewardLevel,
    uploader
  } = useContentState({
    contentId: videoId,
    contentType: 'video'
  });
  useEffect(() => {
    if (!loaded) {
      init();
    }

    async function init() {
      const data = await loadContent({
        contentId: videoId,
        contentType: 'video'
      });
      onInitContent({ ...data, contentType: 'video' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !notFound ? (
    <div style={{ position: 'relative', ...style }}>
      {!loaded ? (
        <Loading style={{ height: '100%' }} />
      ) : imageOnly ? (
        <VideoThumbImage
          style={{ paddingBottom: 0, width: '100%', height: '100%' }}
          rewardLevel={rewardLevel}
          src={`https://img.youtube.com/vi/${content}/mqdefault.jpg`}
          onClick={() => history.push(`/videos/${videoId}`)}
        />
      ) : (
        <XPVideoPlayer
          isChat
          style={{ width: '100%', height: '100%' }}
          byUser={!!byUser}
          rewardLevel={rewardLevel}
          hasHqThumb={hasHqThumb}
          uploader={uploader}
          videoCode={content}
          videoId={videoId}
          onPlay={onPlay}
        />
      )}
      {loaded && !imageOnly && (
        <div
          style={{
            width: '100%',
            marginTop: rewardLevel > 0 ? '-2rem' : '-4rem'
          }}
        >
          <Link
            className={css`
              font-weight: bold;
              font-size: 1.7rem;
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1rem;
              }
            `}
            to={`/videos/${videoId}`}
          >
            Comment or post subjects about this video
          </Link>
        </div>
      )}
    </div>
  ) : null;
}
