import React, { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Color } from 'constants/css';
import { addCommasToNumber, stringIsEmpty } from 'helpers/stringHelpers';
import { returnMaxStars } from 'constants/defaultValues';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import Comment from './Comment';
import ErrorBoundary from 'components/ErrorBoundary';
import Starmarks from './Starmarks';
import { useMyState } from 'helpers/hooks';

RewardStatus.propTypes = {
  className: PropTypes.string,
  rewardLevel: PropTypes.number,
  noMarginForEditButton: PropTypes.bool,
  onCommentEdit: PropTypes.func,
  stars: PropTypes.array,
  style: PropTypes.object
};

function RewardStatus({
  className,
  rewardLevel,
  noMarginForEditButton,
  onCommentEdit,
  stars = [],
  style
}) {
  const { userId } = useMyState();
  const [numLoaded, setNumLoaded] = useState(2);
  stars = useMemo(() => {
    const finalStar = stars.length > 0 ? stars[stars.length - 1] : {};
    const starsWithComment = stars.filter(
      star => !stringIsEmpty(star.rewardComment) && star.id !== finalStar.id
    );
    const starsWithoutComment = stars.filter(
      star => stringIsEmpty(star.rewardComment) && star.id !== finalStar.id
    );
    return starsWithoutComment
      .concat(starsWithComment)
      .concat(finalStar.id ? [finalStar] : []);
  }, [stars]);
  const maxStars = useMemo(() => returnMaxStars({ rewardLevel }), [
    rewardLevel
  ]);
  const rewardedStars = useMemo(() => {
    let result = stars.reduce((prev, star) => prev + star.rewardAmount, 0);
    result = Math.min(result, maxStars);
    return result;
  }, [maxStars, stars]);

  return stars && stars.length > 0 ? (
    <ErrorBoundary>
      <div
        style={style}
        className={`${className} ${css`
          font-size: 1.6rem;
          padding: 0.4rem 1rem 0.2rem 1rem;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${rewardedStars === maxStars
            ? Color.gold()
            : rewardedStars >= 25
            ? Color.brownOrange()
            : Color.logoBlue()};
        `}`}
      >
        <Starmarks stars={rewardedStars} />
        <div style={{ fontSize: '1.5rem' }}>
          {rewardedStars} Twinkle
          {rewardedStars > 1 ? 's' : ''} (
          {addCommasToNumber(rewardedStars * 200)} XP) rewarded out of max{' '}
          {maxStars}
        </div>
      </div>
      {numLoaded < stars.length && (
        <LoadMoreButton
          color={
            rewardedStars === maxStars || rewardedStars > 10
              ? 'orange'
              : 'lightBlue'
          }
          label="Show More Reward Records"
          filled
          style={{
            fontSize: '1.3rem',
            marginTop: '1rem'
          }}
          onClick={() => setNumLoaded(numLoaded + 3)}
        />
      )}
      {stars
        .filter((star, index) => index > stars.length - numLoaded - 1)
        .map(star => (
          <Comment
            maxRewardableStars={Math.ceil(maxStars / 2)}
            noMarginForEditButton={noMarginForEditButton}
            key={star.id}
            star={star}
            myId={userId}
            onEditDone={onCommentEdit}
          />
        ))}
    </ErrorBoundary>
  ) : null;
}

export default memo(RewardStatus);
