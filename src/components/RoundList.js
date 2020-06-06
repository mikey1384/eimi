import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';

RoundList.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};

export default function RoundList({ children, style }) {
  return (
    <div
      className={css`
        list-style: none;
        padding: 0;
        margin-top: 0;
        margin-bottom: 0;
        width: 100%;
        font-size: 1.5rem;
        nav {
          width: 100%;
          padding: 1.5rem;
          border: 1px solid ${Color.borderGray()};
          margin-bottom: -1px;
          @media (max-width: ${mobileMaxWidth}) {
            border-left: 0;
            border-right: 0;
          }
        }
        nav:first-of-type {
          border-top-left-radius: ${borderRadius};
          border-top-right-radius: ${borderRadius};
          @media (max-width: ${mobileMaxWidth}) {
            border-radius: 0;
          }
        }
        nav:last-child {
          border-bottom-left-radius: ${borderRadius};
          border-bottom-right-radius: ${borderRadius};
          @media (max-width: ${mobileMaxWidth}) {
            border-radius: 0;
          }
        }
        @media (max-width: ${mobileMaxWidth}) {
          margin-top: 2rem;
        }
      `}
      style={style}
    >
      {children}
    </div>
  );
}
