import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import SelectRewardAmount from './SelectRewardAmount';
import Icon from 'components/Icon';
import { css } from '@emotion/css';
import { Color } from 'constants/css';
import {
  addCommasToNumber,
  addEmoji,
  exceedsCharLimit,
  finalizeEmoji,
  stringIsEmpty
} from 'helpers/stringHelpers';
import Button from 'components/Button';
import {
  returnMaxRewards,
  priceTable,
  SELECTED_LANGUAGE
} from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useInputContext } from 'contexts';
import localize from 'constants/localize';

const clearLabel = localize('clear');
const rewardLabel = localize('reward');

XPRewardInterface.propTypes = {
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.number.isRequired,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  rewardLevel: PropTypes.number,
  uploaderId: PropTypes.number.isRequired,
  noPadding: PropTypes.bool,
  onReward: PropTypes.func,
  rewards: PropTypes.array.isRequired,
  uploaderAuthLevel: PropTypes.number
};

export default function XPRewardInterface({
  contentId,
  contentType,
  innerRef,
  rewardLevel,
  noPadding,
  onReward,
  rewards,
  uploaderId,
  uploaderAuthLevel
}) {
  const onSetUserState = useAppContext((v) => v.user.actions.onSetUserState);
  const rewardUser = useAppContext((v) => v.requestHelpers.rewardUser);
  const { authLevel, twinkleCoins, userId, banned } = useMyState();
  const state = useInputContext((v) => v.state);
  const onSetRewardForm = useInputContext((v) => v.actions.onSetRewardForm);
  const onAttachReward = useContentContext((v) => v.actions.onAttachReward);
  const onSetXpRewardInterfaceShown = useContentContext(
    (v) => v.actions.onSetXpRewardInterfaceShown
  );

  const rewardForm = state['reward' + contentType + contentId] || {};
  const {
    comment: prevComment = '',
    selectedAmount: prevSelectedAmount = 0,
    rewardLevel: prevRewardLevel
  } = rewardForm;

  const maxRewardAmountForOnePerson = useMemo(
    () => Math.min(Math.ceil(returnMaxRewards({ rewardLevel }) / 2), 10),
    [rewardLevel]
  );

  const myRewardables = useMemo(() => {
    const prevRewards = rewards.reduce((prev, reward) => {
      if (reward.rewarderId === userId) {
        return prev + (reward?.rewardAmount || 0);
      }
      return prev;
    }, 0);
    return Math.max(maxRewardAmountForOnePerson - prevRewards, 0);
  }, [maxRewardAmountForOnePerson, rewards, userId]);

  const remainingRewards = useMemo(() => {
    let currentRewards =
      rewards.length > 0
        ? rewards.reduce(
            (prev, reward) => prev + (reward?.rewardAmount || 0),
            0
          )
        : 0;
    return Math.max(returnMaxRewards({ rewardLevel }) - currentRewards, 0);
  }, [rewardLevel, rewards]);

  const rewardables = useMemo(() => {
    return Math.min(remainingRewards, myRewardables);
  }, [myRewardables, remainingRewards]);

  const mounted = useRef(true);
  const commentRef = useRef(prevComment);
  const rewardingRef = useRef(false);
  const [rewarding, setRewarding] = useState(false);
  const [comment, setComment] = useState(prevComment);
  const selectedAmountRef = useRef(prevSelectedAmount);
  const [selectedAmount, setSelectedAmount] = useState(prevSelectedAmount);
  const requiresPayment =
    !authLevel || authLevel < 2 || uploaderAuthLevel >= authLevel;

  useEffect(() => {
    setSelectedAmount((selectedAmount) =>
      Math.min(selectedAmount, rewardables)
    );
    if (rewardables === 0 && !rewardingRef.current) {
      onSetXpRewardInterfaceShown({
        contentId,
        contentType,
        shown: false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardables]);

  useEffect(() => {
    handleSetComment(prevComment);
  }, [prevComment]);

  useEffect(() => {
    onSetRewardForm({
      contentType,
      contentId,
      form: {
        selectedAmount: rewardLevel !== prevRewardLevel ? 0 : selectedAmount,
        rewardLevel
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

  const rewardStatusText = useMemo(() => {
    if (selectedAmount > 0) {
      if (SELECTED_LANGUAGE === 'kr') {
        return `????????? ${selectedAmount}??? (${addCommasToNumber(
          selectedAmount * 200
        )} XP)`;
      }
      return `Reward ${selectedAmount} Twinkle${
        selectedAmount > 1 ? 's' : ''
      } (${addCommasToNumber(selectedAmount * 200)} XP)`;
    }
    if (SELECTED_LANGUAGE === 'kr') {
      return '?????? ????????? ???????????????';
    }
    return 'Select reward amount';
  }, [selectedAmount]);

  const rewardReasonLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return `??? ????????? ???????????? ????????? ??????????????? (????????????)`;
    }
    return `Let the recipient know why you are rewarding XP for this ${
      contentType === 'url' ? 'link' : contentType
    } (optional)`;
  }, [contentType]);

  const confirmText = useMemo(() => {
    return (
      <>
        {rewardLabel}
        {requiresPayment ? (
          <>
            <div style={{ marginLeft: '0.7rem' }}>
              (<Icon icon={['far', 'badge-dollar']} />
              <span style={{ marginLeft: '0.3rem' }}>
                {selectedAmount * priceTable.reward}
              </span>
              )
            </div>
          </>
        ) : (
          ''
        )}
      </>
    );
  }, [requiresPayment, selectedAmount]);

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
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Icon
        style={{ position: 'absolute', right: '1rem', cursor: 'pointer' }}
        className={css`
          color: ${Color.darkGray()};
          font-size: 2rem;
          &:hover {
            color: ${Color.black()};
          }
        `}
        onClick={() => {
          onSetXpRewardInterfaceShown({
            contentId,
            contentType,
            shown: false
          });
        }}
        icon="times"
      />
      <section style={{ fontWeight: 'bold' }}>{rewardStatusText}</section>
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
          rewardables={rewardables}
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
            {clearLabel}
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
          placeholder={rewardReasonLabel}
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
              selectedAmount === 0 ||
              (requiresPayment &&
                twinkleCoins < selectedAmount * priceTable.reward)
            }
            onClick={handleRewardSubmit}
          >
            {confirmText}
          </Button>
        </section>
      )}
    </div>
  ) : null;

  async function handleRewardSubmit() {
    try {
      rewardingRef.current = true;
      setRewarding(true);
      const { alreadyRewarded, reward, netCoins } = await rewardUser({
        maxRewardAmountForOnePerson,
        explanation: banned?.posting
          ? ''
          : finalizeEmoji(stringIsEmpty(comment) ? '' : comment),
        amount: selectedAmount,
        contentType,
        contentId,
        uploaderId
      });
      if (alreadyRewarded) {
        return window.location.reload();
      }
      if (mounted.current) {
        onSetRewardForm({
          contentType,
          contentId,
          form: undefined
        });
      }
      if (reward && mounted.current) {
        onAttachReward({
          reward,
          contentId,
          contentType
        });
      }
      if (typeof netCoins === 'number' && mounted.current) {
        onSetUserState({ userId, newState: { twinkleCoins: netCoins } });
      }
      if (selectedAmount === myRewardables && mounted.current) {
        onReward?.();
      }
      if (mounted.current) {
        handleSetComment('');
      }
      if (mounted.current) {
        handleSetSelectedAmount(0);
      }
      if (mounted.current) {
        setRewarding(false);
      }
      rewardingRef.current = false;
      if (mounted.current) {
        onSetXpRewardInterfaceShown({
          contentId,
          contentType,
          shown: false
        });
      }
    } catch (error) {
      console.error(error);
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
