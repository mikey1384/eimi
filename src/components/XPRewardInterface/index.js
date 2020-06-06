import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import MenuButtons from './MenuButtons';
import { Color } from 'constants/css';
import { css } from 'emotion';
import {
  addEmoji,
  exceedsCharLimit,
  finalizeEmoji,
  stringIsEmpty
} from 'helpers/stringHelpers';
import FilterBar from 'components/FilterBar';
import Button from 'components/Button';
import request from 'axios';
import { returnMaxStars } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useInputContext } from 'contexts';
import URL from 'constants/URL';

XPRewardInterface.propTypes = {
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.number.isRequired,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  rewardLevel: PropTypes.number,
  stars: PropTypes.array,
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
  stars = [],
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
    selectedAmount = 0,
    starTabActive = false,
    prevRewardLevel
  } = rewardForm;
  const [rewarding, setRewarding] = useState(false);
  const mounted = useRef(true);
  const commentRef = useRef(prevComment);
  const [comment, setComment] = useState(prevComment);

  useEffect(() => {
    handleSetComment(prevComment);
  }, [prevComment]);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      onSetRewardForm({
        contentType,
        contentId,
        form: {
          comment: commentRef.current
        }
      });
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const maxStars = useMemo(() => returnMaxStars({ rewardLevel }), [
    rewardLevel
  ]);

  const rewardCommentExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        contentType: 'rewardComment',
        text: comment
      }),
    [comment]
  );

  return userId && uploaderId !== userId ? (
    <div
      ref={innerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: noPadding ? '1rem 0 0 0' : '1rem',
        fontSize: '1.6rem',
        alignItems: 'center',
        color: Color.blue()
      }}
    >
      <FilterBar style={{ background: 'none' }}>
        <nav
          className={!starTabActive ? 'active' : ''}
          onClick={() => {
            onSetRewardForm({
              contentType,
              contentId,
              form: {
                selectedAmount: !starTabActive ? selectedAmount : 0,
                starTabActive: false
              }
            });
          }}
        >
          Reward Twinkles
        </nav>
        <nav
          className={starTabActive ? 'active' : ''}
          onClick={() => {
            onSetRewardForm({
              contentType,
              contentId,
              form: {
                selectedAmount: starTabActive ? selectedAmount : 0,
                starTabActive: true
              }
            });
          }}
        >
          Reward Stars
        </nav>
      </FilterBar>
      <section
        style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        <MenuButtons
          maxStars={maxStars}
          selectedAmount={selectedAmount}
          stars={stars}
          starTabActive={starTabActive}
          onSetRewardForm={(form) =>
            onSetRewardForm({ contentType, contentId, form })
          }
          userId={userId}
        />
      </section>
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
            !!rewardCommentExceedsCharLimit || rewarding || selectedAmount === 0
          }
          onClick={handleRewardSubmit}
        >
          Confirm
        </Button>
      </section>
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
}
