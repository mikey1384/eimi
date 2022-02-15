import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ProfilePic from 'components/ProfilePic';
import { Color, borderRadius } from 'constants/css';
import { css } from '@emotion/css';

TopRanker.propTypes = {
  userId: PropTypes.number,
  profilePicUrl: PropTypes.string,
  style: PropTypes.object,
  username: PropTypes.string,
  rank: PropTypes.number
};

export default function TopRanker({
  userId,
  profilePicUrl,
  style,
  username,
  rank
}) {
  const rankColor = useMemo(() => {
    return rank === 1 ? Color.gold() : rank === 2 ? '#fff' : Color.bronze();
  }, [rank]);
  const backgroundColor = useMemo(() => {
    return rank === 1
      ? Color.gold(0.5)
      : rank === 2
      ? Color.lighterGray(0.3)
      : Color.brownOrange(0.3);
  }, [rank]);

  return (
    <div style={{ width: '30%', ...style }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: `1px solid ${Color.borderGray()}`,
          borderBottom: 0,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          background: backgroundColor,
          padding: '2rem'
        }}
      >
        <ProfilePic
          className={css`
            width: 100%;
            cursor: pointer;
          `}
          userId={userId}
          profilePicUrl={profilePicUrl}
        />
      </div>
      <div
        style={{
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          padding: '1rem',
          textAlign: 'center',
          background: Color.black()
        }}
      >
        <div
          style={{
            color: rankColor,
            fontWeight: 'bold'
          }}
        >
          #{rank}
        </div>
        <div
          style={{
            width: '100%',
            fontWeight: 'bold',
            color: rankColor,
            overflowX: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {username}
        </div>
      </div>
    </div>
  );
}
