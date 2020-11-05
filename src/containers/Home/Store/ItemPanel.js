import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';

ItemPanel.propTypes = {
  itemName: PropTypes.string.isRequired,
  karmaPoints: PropTypes.number,
  style: PropTypes.object
};

export default function ItemPanel({ itemName, style, karmaPoints }) {
  return (
    <div
      className={css`
        border-radius: ${borderRadius};
        @media (max-width: ${mobileMaxWidth}) {
          border-radius: 0;
        }
      `}
      style={{
        background: '#fff',
        border: `1px solid ${Color.borderGray()}`,
        padding: '1rem',
        ...style
      }}
    >
      <div>You have {karmaPoints} karma points</div>
      <div style={{ fontWeight: 'bold', fontSize: '1.7rem' }}>{itemName}</div>
    </div>
  );
}
