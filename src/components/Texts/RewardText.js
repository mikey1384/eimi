import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import { addCommasToNumber } from 'helpers/stringHelpers';
import { Color } from 'constants/css';
import { css } from 'emotion';

RewardText.propTypes = {
  xpReward: PropTypes.number,
  coinReward: PropTypes.number,
  labelClassName: PropTypes.string,
  rewardClassName: PropTypes.string,
  style: PropTypes.object
};

export default function RewardText({
  xpReward,
  coinReward,
  labelClassName,
  rewardClassName,
  style
}) {
  return xpReward || coinReward ? (
    <div style={{ ...style, display: 'flex' }}>
      <p
        className={
          labelClassName ||
          css`
            font-size: 1.7rem;
          `
        }
        style={{ fontWeight: 'bold' }}
      >
        Reward:
      </p>
      <div
        className={
          rewardClassName ||
          css`
            font-size: 1.5rem;
          `
        }
        style={{ display: 'flex', alignItems: 'center', marginLeft: '0.7rem' }}
      >
        {xpReward && (
          <div>
            <span style={{ fontWeight: 'bold', color: Color.logoGreen() }}>
              {addCommasToNumber(xpReward)}
            </span>{' '}
            <span style={{ color: Color.gold(), fontWeight: 'bold' }}>XP</span>
            {coinReward && ','}
          </div>
        )}
        {coinReward && (
          <div
            style={{
              color: Color.brownOrange(),
              marginLeft: xpReward ? '0.8rem' : 0,
              fontWeight: 'bold'
            }}
          >
            <Icon icon={['far', 'badge-dollar']} /> {coinReward}
          </div>
        )}
      </div>
    </div>
  ) : null;
}