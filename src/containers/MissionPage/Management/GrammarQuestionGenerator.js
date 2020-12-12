import React, { useMemo, useState } from 'react';
import Input from 'components/Texts/Input';
import Button from 'components/Button';
import { css } from 'emotion';
import { capitalize, stringIsEmpty } from 'helpers/stringHelpers';
import { Color, borderRadius, mobileMaxWidth } from 'constants/css';

export default function GrammarQuestionGenerator() {
  const [leftSideText, setLeftSideText] = useState('');
  const [rightSideText, setRightSideText] = useState('');
  const [correctChoice, setCorrectChoice] = useState('');
  const [wrongChoice1, setWrongChoice1] = useState('');
  const [wrongChoice2, setWrongChoice2] = useState('');
  const [wrongChoice3, setWrongChoice3] = useState('');

  const finalLeftSideText = useMemo(() => {
    return capitalize(leftSideText.trim());
  }, [leftSideText]);

  const finalRightSideText = useMemo(() => {
    if (stringIsEmpty(rightSideText)) {
      return '.';
    }
    if (!rightSideText || ['.', '?'].includes(rightSideText)) {
      return rightSideText;
    }
    const trimmedRightSideText = rightSideText.trim();
    if (
      /^[a-zA-Z]+$/i.test(trimmedRightSideText[trimmedRightSideText.length - 1])
    ) {
      return ` ${trimmedRightSideText}.`;
    }
    return ` ${trimmedRightSideText}`;
  }, [rightSideText]);

  const submitDisabled = useMemo(() => {
    if (stringIsEmpty(leftSideText) & stringIsEmpty(rightSideText)) {
      return true;
    }
    if (
      stringIsEmpty(correctChoice) ||
      stringIsEmpty(wrongChoice1) ||
      stringIsEmpty(wrongChoice2) ||
      stringIsEmpty(wrongChoice3)
    ) {
      return true;
    }
    return false;
  }, [
    correctChoice,
    leftSideText,
    rightSideText,
    wrongChoice1,
    wrongChoice2,
    wrongChoice3
  ]);

  return (
    <div
      className={css`
        width: 100%;
        display: flex;
        flex-direction: column;
        background: #fff;
        padding: 1rem 1rem 1.5rem 1rem;
        border: 1px solid ${Color.borderGray()};
        border-radius: ${borderRadius};
        @media (max-width: ${mobileMaxWidth}) {
          border-radius: 0;
          border-left: 0;
          border-right: 0;
        }
      `}
    >
      <h2>Grammar Question Generator</h2>
      {(!stringIsEmpty(leftSideText) || !stringIsEmpty(rightSideText)) && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '5rem',
            fontSize: '2rem'
          }}
        >
          {finalLeftSideText} _____
          {finalRightSideText}
        </div>
      )}
      <div
        className={css`
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          font-size: 1.5rem;
        `}
      >
        <Input
          onChange={setLeftSideText}
          placeholder="Enter text that goes to the left side of the blank"
          value={leftSideText}
        />
        <span style={{ margin: '0 1rem' }}>_____</span>
        <Input
          onChange={setRightSideText}
          placeholder="Enter text that goes to the right side of the blank"
          value={rightSideText}
        />
      </div>
      <div
        style={{
          marginTop: '3rem',
          display: 'flex',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <div
          className={css`
            width: 50%;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
            }
          `}
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <h3>Enter the correct choice</h3>
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setCorrectChoice}
            placeholder="Enter the correct choice"
            value={correctChoice}
          />
          <h3 style={{ marginTop: '3rem' }}>Enter 3 wrong choices</h3>
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setWrongChoice1}
            placeholder="Enter a wrong choice"
            value={wrongChoice1}
          />
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setWrongChoice2}
            placeholder="Enter a wrong choice"
            value={wrongChoice2}
          />
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setWrongChoice3}
            placeholder="Enter a wrong choice"
            value={wrongChoice3}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Button
          disabled={submitDisabled}
          style={{ fontSize: '2rem' }}
          color="logoBlue"
          filled
          onClick={() => console.log('clicked')}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
