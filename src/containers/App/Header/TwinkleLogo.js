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
          font-size: 2rem;
          font-weight: bold;
          font-family: 'Ubuntu', sans-serif, Arial, Helvetica;
          line-height: 0.9;
        `}
      >
        EIMICC
      </div>
    </div>
  );
}
