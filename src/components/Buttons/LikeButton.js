import PropTypes from 'prop-types';
import React, { memo, useMemo, useState } from 'react';
import Button from 'components/Button';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import localize from 'constants/localize';

const likeLabel = localize('like');
const likedLabel = localize('liked');

LikeButton.propTypes = {
  className: PropTypes.string,
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.number.isRequired,
  filled: PropTypes.bool,
  likes: PropTypes.array,
  onClick: PropTypes.func,
  style: PropTypes.object
};

function LikeButton({
  className,
  contentId,
  contentType,
  filled,
  likes,
  style,
  onClick = () => {}
}) {
  const {
    requestHelpers: { likeContent }
  } = useAppContext();
  const {
    actions: { onLikeContent }
  } = useContentContext();
  const { userId } = useMyState();
  const [disabled, setDisabled] = useState(false);
  const liked = useMemo(() => {
    let userLikedThis = false;
    for (let i = 0; i < likes.length; i++) {
      if (likes[i].id === userId) userLikedThis = true;
    }
    return userLikedThis;
  }, [likes, userId]);

  return (
    <ErrorBoundary>
      <Button
        disabled={disabled}
        className={className}
        color={(filled && liked) || !filled ? 'logoBlue' : 'lightBlue'}
        filled={filled || liked}
        style={style}
        onClick={async () => {
          try {
            setDisabled(true);
            const newLikes = await likeContent({
              id: contentId,
              contentType
            });
            if (userId) {
              onLikeContent({ likes: newLikes, contentType, contentId });
              onClick({ likes: newLikes, isUnlike: liked });
            }
            setDisabled(false);
          } catch (error) {
            setDisabled(false);
            return console.error(error);
          }
        }}
      >
        <Icon icon="thumbs-up" />
        <span style={{ marginLeft: '0.7rem' }}>
          {liked ? `${likedLabel}!` : likeLabel}
        </span>
      </Button>
    </ErrorBoundary>
  );
}

export default memo(LikeButton);
