import React, { useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { capitalize, stringIsEmpty } from 'helpers/stringHelpers';
import { css } from 'emotion';
import { mobileMaxWidth } from 'constants/css';
import { useAppContext } from 'contexts';
import Input from 'components/Texts/Input';
import Button from 'components/Button';

QuestionEditForm.propTypes = {
  onEditQuestion: PropTypes.func.isRequired,
  correctChoice: PropTypes.string.isRequired,
  leftSideText: PropTypes.string.isRequired,
  rightSideText: PropTypes.string.isRequired,
  wrongChoice1: PropTypes.string.isRequired,
  wrongChoice2: PropTypes.string.isRequired,
  wrongChoice3: PropTypes.string.isRequired,
  questionId: PropTypes.number.isRequired
};

export default function QuestionEditForm({
  onEditQuestion,
  correctChoice,
  leftSideText,
  rightSideText,
  wrongChoice1,
  wrongChoice2,
  wrongChoice3,
  questionId
}) {
  const mounted = useRef(true);
  const {
    requestHelpers: { editGrammarQuestion }
  } = useAppContext();
  const [editedLeftSideText, setEditedLeftSideText] = useState(
    leftSideText.trim()
  );
  const [editedRightSideText, setEditedRightSideText] = useState(
    rightSideText.trim()
  );
  const [editedCorrectChoice, setEditedCorrectChoice] = useState(correctChoice);
  const [editedWrongChoice1, setEditedWrongChoice1] = useState(wrongChoice1);
  const [editedWrongChoice2, setEditedWrongChoice2] = useState(wrongChoice2);
  const [editedWrongChoice3, setEditedWrongChoice3] = useState(wrongChoice3);

  function finalizeLeftSideText(text) {
    return capitalize(text.trim());
  }
  function finalizeRightSideText(text) {
    if (stringIsEmpty(text)) {
      return '.';
    }
    if (!text || ['.', '?', '!'].includes(text)) {
      return text;
    }
    const trimmedRightSideText = text.trim();
    if (
      /^[a-zA-Z]+$/i.test(trimmedRightSideText[trimmedRightSideText.length - 1])
    ) {
      return `${trimmedRightSideText}.`;
    }
    return trimmedRightSideText;
  }

  const finalLeftSideText = useMemo(() => {
    return finalizeLeftSideText(editedLeftSideText);
  }, [editedLeftSideText]);
  const finalRightSideText = useMemo(() => {
    return finalizeRightSideText(editedRightSideText);
  }, [editedRightSideText]);

  const submitDisabled = useMemo(() => {
    if (
      stringIsEmpty(editedLeftSideText) & stringIsEmpty(setEditedRightSideText)
    ) {
      return true;
    }
    if (
      stringIsEmpty(editedCorrectChoice) ||
      stringIsEmpty(editedWrongChoice1) ||
      stringIsEmpty(editedWrongChoice2) ||
      stringIsEmpty(editedWrongChoice3)
    ) {
      return true;
    }
    if (
      finalLeftSideText === finalizeLeftSideText(leftSideText) &&
      finalRightSideText === finalizeRightSideText(rightSideText) &&
      editedCorrectChoice === correctChoice &&
      editedWrongChoice1 === wrongChoice1 &&
      editedWrongChoice2 === wrongChoice2 &&
      editedWrongChoice3 === wrongChoice3
    ) {
      return true;
    }
    return false;
  }, [
    correctChoice,
    editedCorrectChoice,
    editedLeftSideText,
    editedWrongChoice1,
    editedWrongChoice2,
    editedWrongChoice3,
    finalLeftSideText,
    finalRightSideText,
    leftSideText,
    rightSideText,
    wrongChoice1,
    wrongChoice2,
    wrongChoice3
  ]);

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  return (
    <div>
      {(!stringIsEmpty(editedLeftSideText) ||
        !stringIsEmpty(editedRightSideText)) && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '2rem'
          }}
        >
          {finalLeftSideText} _____
          {['.', '?', '!'].includes(finalRightSideText)
            ? finalRightSideText
            : ` ${finalRightSideText}`}
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
          onChange={setEditedLeftSideText}
          placeholder="Enter text that goes to the left side of the blank"
          value={editedLeftSideText}
        />
        <span style={{ margin: '0 1rem' }}>_____</span>
        <Input
          onChange={setEditedRightSideText}
          placeholder="Enter text that goes to the right side of the blank"
          value={editedRightSideText}
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
            onChange={setEditedCorrectChoice}
            placeholder="Enter the correct choice"
            value={editedCorrectChoice}
          />
          <h3 style={{ marginTop: '3rem' }}>Enter 3 wrong choices</h3>
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setEditedWrongChoice1}
            placeholder="Enter a wrong choice"
            value={editedWrongChoice1}
          />
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setEditedWrongChoice2}
            placeholder="Enter a wrong choice"
            value={editedWrongChoice2}
          />
          <Input
            style={{ marginTop: '1rem' }}
            onChange={setEditedWrongChoice3}
            placeholder="Enter a wrong choice"
            value={editedWrongChoice3}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: '3rem',
          width: '100%',
          justifyContent: 'center',
          display: 'flex'
        }}
      >
        <Button
          style={{ fontSize: '2rem' }}
          color="logoBlue"
          filled
          disabled={submitDisabled}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );

  async function handleSubmit() {
    const editedQuestion = await editGrammarQuestion({
      leftSideText: finalLeftSideText,
      rightSideText: finalRightSideText,
      correctChoice: editedCorrectChoice,
      wrongChoice1: editedWrongChoice1,
      wrongChoice2: editedWrongChoice2,
      wrongChoice3: editedWrongChoice3,
      questionId
    });
    if (mounted.current) {
      onEditQuestion(editedQuestion);
    }
  }
}