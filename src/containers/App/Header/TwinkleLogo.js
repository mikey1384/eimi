import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/css';

TwinkleLogo.propTypes = {
  style: PropTypes.object
};

export default function TwinkleLogo({ style }) {
  return (
    <div
      style={style}
      className={`desktop ${css`
        cursor: pointer;
        position: relative;
        height: 2rem;
      `}`}
      onClick={() => {
        window.location.href = '/';
      }}
    >
      <div
        onClick={() => (document.getElementById('App').scrollTop = 0)}
        className={css`
          width: 13rem;
          height: 5rem;
          margin-top: -17px;
          font-size: 2rem;
          font-weight: bold;
          font-family: 'Ubuntu', sans-serif, Arial, Helvetica;
          line-height: 0.9;
        `}
      >
        <img style={{ width: '100%', height: '100%' }} src="/favicon.png" />
      </div>
    </div>
  );
}
