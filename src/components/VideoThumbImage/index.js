import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from 'contexts';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import WatchProgressBar from './WatchProgressBar';
import { useMyState } from 'helpers/hooks';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';

VideoThumbImage.propTypes = {
  height: PropTypes.string,
  rewardLevel: PropTypes.number,
  onClick: PropTypes.func,
  src: PropTypes.string.isRequired,
  style: PropTypes.object,
  videoId: PropTypes.number
};

function VideoThumbImage({
  rewardLevel,
  height = '55%',
  onClick,
  src,
  style,
  videoId
}) {
  const loadVideoWatchPercentage = useAppContext(
    (v) => v.requestHelpers.loadVideoWatchPercentage
  );
  const { userId } = useMyState();
  const [progressBarPercentage, setProgressBarPercentage] = useState(0);
  const mounted = useRef(true);

  const Stars = useMemo(
    () =>
      [...Array(rewardLevel)].map((elem, index) => (
        <Icon key={index} style={{ verticalAlign: 0 }} icon="star" />
      )),
    [rewardLevel]
  );

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    init();

    async function init() {
      if (userId) {
        const percentage = await loadVideoWatchPercentage(videoId);
        if (mounted.current) {
          setProgressBarPercentage(percentage);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, videoId]);

  const tagColor = useMemo(
    () =>
      rewardLevel === 5
        ? Color.gold()
        : rewardLevel === 4
        ? Color.cranberry()
        : rewardLevel === 3
        ? Color.orange()
        : rewardLevel === 2
        ? Color.pink()
        : Color.logoBlue(),
    [rewardLevel]
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          overFlow: 'hidden',
          paddingBottom: height,
          position: 'relative',
          cursor: onClick && 'pointer',
          ...style
        }}
        onClick={onClick}
      >
        <img
          alt="Thumbnail"
          src={src}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            margin: 'auto'
          }}
        />
        {!!rewardLevel && (
          <div
            className={css`
              display: flex;
              justify-content: center;
              align-items: center;
              min-width: 4rem;
              position: absolute;
              padding: 0.5rem 0.5rem;
              background: ${tagColor};
              font-size: 1.5rem;
              font-weight: bold;
              color: #fff;
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1rem;
              }
            `}
          >
            <div style={{ fontSize: '1rem', lineHeight: 1 }}>{Stars}</div>
          </div>
        )}
        {progressBarPercentage > 0 && (
          <WatchProgressBar
            style={{
              position: 'absolute',
              width: '100%',
              background: Color.darkerBorderGray()
            }}
            className={css`
              bottom: 0;
            `}
            percentage={progressBarPercentage}
          />
        )}
      </div>
    </div>
  );
}

export default memo(VideoThumbImage);
