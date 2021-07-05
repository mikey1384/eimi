import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CopyCode from './CopyCode';
import PasteCode from './PasteCode';
import Button from 'components/Button';
import StepSlide from '../../../components/StepSlide';
import { css } from '@emotion/css';

CopyAndPasteCode.propTypes = {
  onCorrectCodeEntered: PropTypes.func.isRequired
};

const initialCode = `${Math.random().toString(36).substr(2, 6)}`;
const codeToCopy = `import { useEffect, useState } from 'react';

function HomePage() {
  const [code, setCode] = useState('');
  const initialCode = '${initialCode}';
  useEffect(() => {
    let result = '';
    for (let i = 0; i < initialCode.length; i++) {
      const number = initialCode.charCodeAt(i) % 10;
      result += number;
    }
    setCode(result);
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          height: 'CALC(100vh - 1rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}
      >
        {code}
      </div>
    </div>
  )
}

export default HomePage;`;

export default function CopyAndPasteCode({ onCorrectCodeEntered }) {
  const [codeCopied, setCodeCopied] = useState(false);
  return (
    <StepSlide title="Copy the following code">
      <CopyCode codeToCopy={codeToCopy} style={{ marginTop: '1.5rem' }} />
      <div style={{ marginTop: '2.5rem', width: '100%' }}>
        {!codeCopied && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <p
              className={css`
                margin-top: 3.5rem;
                margin-bottom: 3.5rem;
              `}
            >
              Did you copy it?
            </p>
            <Button
              skeuomorphic
              color="green"
              style={{ marginTop: '3rem' }}
              onClick={() => setCodeCopied(true)}
            >
              Yes
            </Button>
          </div>
        )}
        {codeCopied && (
          <PasteCode
            style={{ marginTop: '2rem' }}
            initialCode={initialCode}
            onCorrectCodeEntered={onCorrectCodeEntered}
          />
        )}
      </div>
    </StepSlide>
  );
}
