import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from 'components/Texts/Input';
import StepSlide from '../components/StepSlide';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';

LetsLaunch.propTypes = {
  index: PropTypes.number
};

export default function LetsLaunch({ index }) {
  const [url, setUrl] = useState('');
  const [hasUrlError] = useState(false);
  return (
    <StepSlide
      title={
        <>
          Launch your website by importing your {`website's`} GitHub repository
          to Vercel.
          <br />
          When you are done, copy the {`website's`} url address generated by
          Vercel and paste it into the text box below.
        </>
      }
      index={index}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Input
          autoFocus
          value={url}
          onChange={setUrl}
          placeholder="Paste your website's vercel url here..."
          className={css`
            margin-top: 2rem;
            width: 50%;
            @media (max-width: ${mobileMaxWidth}) {
              margin-top: 1rem;
              width: 100%;
            }
          `}
        />
        {hasUrlError && (
          <p style={{ fontSize: '1.5rem', color: Color.red() }}>
            {`That is not a valid vercel URL`}
          </p>
        )}
      </div>
    </StepSlide>
  );
}
