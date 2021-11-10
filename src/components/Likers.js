import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import UsernameText from 'components/Texts/UsernameText';
import ErrorBoundary from 'components/ErrorBoundary';
import { Color } from 'constants/css';

const selectedLanguage = process.env.REACT_APP_SELECTED_LANGUAGE;

Likers.propTypes = {
  className: PropTypes.string,
  defaultText: PropTypes.string,
  likes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired
    })
  ).isRequired,
  onLinkClick: PropTypes.func.isRequired,
  style: PropTypes.object,
  target: PropTypes.string,
  wordBreakEnabled: PropTypes.bool,
  userId: PropTypes.number
};

export default function Likers({
  likes,
  target,
  userId,
  onLinkClick,
  style = {},
  className,
  defaultText,
  wordBreakEnabled
}) {
  const Likers = useMemo(() => {
    let userLiked = false;
    let totalLikes = 0;
    if (likes) {
      for (let i = 0; i < likes.length; i++) {
        if (likes[i]?.id === userId) userLiked = true;
        totalLikes++;
      }
    }
    if (userLiked) {
      totalLikes--;
      if (totalLikes > 0) {
        if (totalLikes === 1) {
          let otherLikes = likes.filter((like) => like?.id !== userId);
          if (selectedLanguage === 'kr') {
            return (
              <div>
                당신과{' '}
                <UsernameText
                  wordBreakEnabled={wordBreakEnabled}
                  color={Color.blue()}
                  user={{
                    id: otherLikes[0]?.id,
                    username: otherLikes[0]?.username
                  }}
                />
                님이 이 게시물을 좋아합니다.
              </div>
            );
          }
          return (
            <div>
              You and{' '}
              <UsernameText
                wordBreakEnabled={wordBreakEnabled}
                color={Color.blue()}
                user={{
                  id: otherLikes[0]?.id,
                  username: otherLikes[0]?.username
                }}
              />{' '}
              like {`this${target ? ' ' + target : ''}.`}
            </div>
          );
        } else {
          if (selectedLanguage === 'kr') {
            return (
              <div>
                당신과{' '}
                <a
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => onLinkClick()}
                >
                  {totalLikes}
                </a>
                명의 회원분들이 이 게시물을 좋아합니다
              </div>
            );
          }
          return (
            <div>
              You and{' '}
              <a
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => onLinkClick()}
              >
                {totalLikes} others
              </a>{' '}
              like {`this${target ? ' ' + target : ''}.`}
            </div>
          );
        }
      }
      if (selectedLanguage === 'kr') {
        return <div>당신이 이 게시물을 좋아합니다.</div>;
      }
      return <div>You like {`this${target ? ' ' + target : ''}.`}</div>;
    } else if (totalLikes > 0) {
      if (totalLikes === 1) {
        return (
          <div>
            <UsernameText
              wordBreakEnabled={wordBreakEnabled}
              color={Color.blue()}
              user={likes[0]}
            />{' '}
            likes {`this${target ? ' ' + target : ''}.`}
          </div>
        );
      } else {
        return (
          <div>
            <a
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => onLinkClick()}
            >
              {totalLikes} people
            </a>{' '}
            like {`this${target ? ' ' + target : ''}.`}
          </div>
        );
      }
    } else {
      return defaultText ? <div>{defaultText}</div> : null;
    }
  }, [defaultText, likes, onLinkClick, target, userId, wordBreakEnabled]);

  return (
    <ErrorBoundary>
      <div style={style} className={className}>
        {Likers}
      </div>
    </ErrorBoundary>
  );
}
