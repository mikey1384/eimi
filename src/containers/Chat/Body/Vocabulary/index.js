import React, { useEffect, useMemo, useRef, useState } from 'react';
import Input from './Input';
import Loading from 'components/Loading';
import ActivitiesContainer from './ActivitiesContainer';
import Definition from './Definition';
import Icon from 'components/Icon';
import WordRegisterStatus from './WordRegisterStatus';
import { Color, mobileMaxWidth } from 'constants/css';
import {
  useAppContext,
  useChatContext,
  useContentContext,
  useInputContext
} from 'contexts';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { css } from 'emotion';

export default function Vocabulary() {
  const {
    user: {
      actions: { onUpdateNumWordsCollected }
    },
    requestHelpers: { lookUpWord, registerWord }
  } = useAppContext();
  const {
    state: { vocabErrorMessage, wordsObj, wordRegisterStatus },
    actions: {
      onRegisterWord,
      onSetWordRegisterStatus,
      onSetWordsObj,
      onUpdateCollectorsRankings
    }
  } = useChatContext();
  const {
    actions: { onChangeUserXP }
  } = useContentContext();
  const {
    state,
    actions: { onEnterComment }
  } = useInputContext();
  const { userId } = useMyState();
  const inputText = state['vocabulary'] || '';
  const wordObj = useMemo(() => wordsObj[inputText] || {}, [
    inputText,
    wordsObj
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    text.current = inputText;
    if (!stringIsEmpty(inputText)) {
      clearTimeout(timerRef.current);
      setLoading(true);
      timerRef.current = setTimeout(() => changeInput(inputText), 1000);
    }
    async function changeInput(input) {
      const word = await lookUpWord(input);
      if (
        (!wordObj.content && word.notFound) ||
        (word.content && word.content === text.current)
      ) {
        onSetWordsObj(word);
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const widgetHeight = useMemo(() => {
    return stringIsEmpty(inputText) || loading
      ? wordRegisterStatus
        ? '16rem'
        : '10rem'
      : `20rem`;
  }, [inputText, loading, wordRegisterStatus]);

  const containerHeight = useMemo(() => {
    return `CALC(100% - ${widgetHeight} - 6.5rem)`;
  }, [widgetHeight]);

  const notRegistered = useMemo(
    () => wordObj.isNew && !stringIsEmpty(inputText) && !loading,
    [wordObj.isNew, inputText, loading]
  );

  const alreadyRegistered = useMemo(
    () =>
      !!wordObj.content &&
      !wordObj.isNew &&
      !stringIsEmpty(inputText) &&
      !loading,
    [wordObj.content, wordObj.isNew, inputText, loading]
  );

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column'
      }}
    >
      <ActivitiesContainer
        style={{
          width: '100%',
          overflow: 'scroll',
          height: containerHeight
        }}
      />
      <div
        style={{
          zIndex: 5,
          width: '100%',
          height: widgetHeight,
          boxShadow:
            !wordRegisterStatus &&
            stringIsEmpty(inputText) &&
            `0 -5px 6px -3px ${Color.gray()}`,
          borderTop:
            (!!wordRegisterStatus || !stringIsEmpty(inputText)) &&
            `1px solid ${Color.borderGray()}`
        }}
      >
        {stringIsEmpty(inputText) && !!wordRegisterStatus && (
          <WordRegisterStatus />
        )}
        {!wordRegisterStatus && stringIsEmpty(inputText) && (
          <div
            className={css`
              padding: 1rem;
              font-size: 3rem;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              background: ${Color.black()};
              color: #fff;
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 2rem;
              }
            `}
          >
            <div>
              <span>Type a word in the text box below</span>
              <Icon style={{ marginLeft: '1rem' }} icon="arrow-down" />
            </div>
          </div>
        )}
        {!stringIsEmpty(inputText) &&
          (loading ? (
            <Loading style={{ height: '100%' }} text="Looking up..." />
          ) : (
            <div
              style={{
                display: 'flex',
                position: 'relative',
                paddingRight: '1rem',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                overflow: 'scroll'
              }}
            >
              <div
                className={css`
                  font-weight: bold;
                  font-size: 3rem;
                  @media (max-width: ${mobileMaxWidth}) {
                    font-size: 2rem;
                  }
                `}
                style={{
                  display: 'flex',
                  width: '20%',
                  alignItems: 'center',
                  padding: '1rem'
                }}
              >
                {wordObj.content}
              </div>
              <Definition wordObj={wordObj} />
            </div>
          ))}
      </div>
      {(notRegistered ||
        alreadyRegistered ||
        vocabErrorMessage ||
        isSubmitting) && (
        <div
          className={css`
            font-size: 2rem;
            @media (max-width: ${mobileMaxWidth}) {
              font-size: 1.5rem;
            }
          `}
          style={{
            display: 'flex',
            background: vocabErrorMessage
              ? Color.rose()
              : notRegistered
              ? Color.green()
              : Color.darkerGray(),
            color: '#fff',
            width: '100%',
            padding: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            height: '7rem'
          }}
        >
          {vocabErrorMessage ||
            (notRegistered
              ? isSubmitting
                ? 'Collecting...'
                : 'This word has not been collected yet. Collect and earn XP!'
              : 'This word has already been collected')}
        </div>
      )}
      <div
        style={{
          height: '6.5rem',
          background: Color.inputGray(),
          padding: '1rem',
          borderTop: `1px solid ${Color.borderGray()}`
        }}
      >
        <Input
          onInput={() => {
            if (isSubmitting) {
              setIsSubmitting(false);
            }
          }}
          onSubmit={handleSubmit}
          innerRef={inputRef}
          registerButtonShown={notRegistered}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );

  async function handleSubmit() {
    const { isNew, ...definitions } = wordObj;
    delete definitions.deletedDefIds;
    if (isNew && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const { xp, rank, word, rankings } = await registerWord(definitions);
        onChangeUserXP({ xp, rank, userId });
        onUpdateNumWordsCollected(word.numWordsCollected);
        onRegisterWord(word);
        onUpdateCollectorsRankings({ rankings });
        onSetWordRegisterStatus(wordObj);
        onEnterComment({
          contentType: 'vocabulary',
          text: ''
        });
        setIsSubmitting(false);
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
      }
    }
  }
}
