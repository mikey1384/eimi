import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import { Color } from 'constants/css';
import { css } from '@emotion/css';

DropdownList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  style: PropTypes.object,
  isReversed: PropTypes.bool,
  direction: PropTypes.string
};

export default function DropdownList({
  children,
  className,
  innerRef,
  style = {},
  isReversed,
  direction
}) {
  return (
    <ErrorBoundary>
      <ul
        ref={innerRef}
        style={style}
        className={`${css`
          float: left;
          margin-top: 0;
          display: block;
          z-index: 10;
          padding: 0;
          top: 100%;
          transform: translate(
            ${direction === 'left' ? '-100%' : 0},
            ${isReversed
              ? direction === 'left'
                ? '-100%'
                : 'CALC(-100% - 2rem)'
              : direction !== 'left'
              ? '0'
              : '-4rem'}
          );
          right: 0;
          left: 0;
          min-width: 10rem;
          border: none;
          list-style: none;
          position: absolute;
          background: #fff;
          box-shadow: 1px 1px 2px ${Color.black(0.6)};
          font-weight: normal !important;
          line-height: 1.5;
          li {
            display: inline-block;
            clear: both;
            float: left;
            border-radius: 0 !important;
            border: none !important;
            padding: 1rem;
            text-align: center;
            font-size: 1.5rem;
            color: ${Color.darkerGray()};
            cursor: pointer;
            border-bottom: none !important;
            width: 100%;
            &:hover {
              background: ${Color.highlightGray()};
            }
            a {
              text-decoration: none;
            }
          }
        `} ${className}`}
      >
        {children}
      </ul>
    </ErrorBoundary>
  );
}
