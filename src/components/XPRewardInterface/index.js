import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import SelectRewardAmount from './SelectRewardAmount';
import { css } from 'emotion';
import {
  addEmoji,
  exceedsCharLimit,
  finalizeEmoji,
  stringIsEmpty
} from 'helpers/stringHelpers';
import Button from 'components/Button';
import request from 'axios';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useInputContext } from 'contexts';
import URL from 'constants/URL';

XPRewardInterface.propTypes = {
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.number.isRequired,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  rewardLevel: PropTypes.number,
  uploaderId: PropTypes.number.isRequired,
  noPadding: PropTypes.bool,
  onRewardSubmit: PropTypes.func.isRequired
};

export default function XPRewardInterface({
  contentId,
  contentType,
  innerRef,
  rewardLevel,
  noPadding,
  onRewardSubmit,
  uploaderId
}) {
  const {
    requestHelpers: { auth }
  } = useAppContext();
  const { userId } = useMyState();
  const {
    state,
    actions: { onSetRewardForm }
  } = useInputContext();
  const rewardForm = state['reward' + contentType + contentId] || {};
  const {
    comment: prevComment = '',
    selectedAmount: prevSelectedAmount = 0,
    prevRewardLevel
  } = rewardForm;

  const mounted = useRef(true);
  const commentRef = useRef(prevComment);
  const [rewarding, setRewarding] = useState(false);
  const [comment, setComment] = useState(prevComment);
  const selectedAmountRef = useRef(prevSelectedAmount);
  const [selectedAmount, setSelectedAmount] = useState(prevSelectedAmount);

  useEffect(() => {
    handleSetComment(prevComment);
  }, [prevComment]);

  useEffect(() => {
    onSetRewardForm({
      contentType,
      contentId,
      form: {
        selectedAmount: rewardLevel !== prevRewardLevel ? 0 : selectedAmount,
        prevRewardLevel: rewardLevel
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardLevel]);

  const rewardCommentExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        contentType: 'rewardComment',
        text: comment
      }),
    [comment]
  );

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      onSetRewardForm({
        contentType,
        contentId,
        form: {
          comment: commentRef.current,
          selectedAmount: selectedAmountRef.current
        }
      });
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return userId && uploaderId !== userId ? (
    <div
      ref={innerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: noPadding ? '1rem 0 0 0' : '1rem',
        fontSize: '1.6rem',
        alignItems: 'center'
      }}
    >
      <section style={{ fontWeight: 'bold' }}>Select reward amount</section>
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center'
        }}
      >
        <SelectRewardAmount
          onSetSelectedAmount={handleSetSelectedAmount}
          selectedAmount={selectedAmount}
        />
        {selectedAmount > 0 && (
          <a
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '-0.5rem'
            }}
            onClick={() => handleSetSelectedAmount(0)}
          >
            clear
          </a>
        )}
      </section>
      {selectedAmount > 0 && (
        <Textarea
          className={css`
            margin-top: 1rem;
          `}
          minRows={3}
          value={comment}
          onChange={(event) => {
            handleSetComment(addEmoji(event.target.value));
          }}
          placeholder={`Let the recipient know why you are rewarding XP for this ${
            contentType === 'url' ? 'link' : contentType
          } (optional)`}
          style={rewardCommentExceedsCharLimit?.style}
        />
      )}
      {selectedAmount > 0 && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            width: '100%',
            marginTop: '1rem'
          }}
        >
          <Button
            color={selectedAmount > 4 ? 'pink' : 'logoBlue'}
            filled
            disabled={
              !!rewardCommentExceedsCharLimit ||
              rewarding ||
              selectedAmount === 0
            }
            onClick={handleRewardSubmit}
          >
            Confirm
          </Button>
        </section>
      )}
    </div>
  ) : null;

  async function handleRewardSubmit() {
    try {
      setRewarding(true);
      const { data } = await request.post(
        `${URL}/user/reward`,
        {
          rewardExplanation: finalizeEmoji(
            stringIsEmpty(comment) ? '' : comment
          ),
          amount: selectedAmount,
          contentType,
          contentId,
          uploaderId
        },
        auth()
      );
      if (mounted.current) {
        setRewarding(false);
        handleSetComment('');
        handleSetSelectedAmount(0);
        onSetRewardForm({
          contentType,
          contentId,
          form: undefined
        });
        onRewardSubmit(data);
      }
    } catch (error) {
      console.error({ error });
      setRewarding(false);
    }
  }

  function handleSetComment(text) {
    setComment(text);
    commentRef.current = text;
  }

  function handleSetSelectedAmount(amount) {
    setSelectedAmount(amount);
    selectedAmountRef.current = amount;
  }
}
