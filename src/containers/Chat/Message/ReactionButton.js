import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Emojis from './emojis.png';
import ErrorBoundary from 'components/ErrorBoundary';
import { reactionsObj } from 'constants/defaultValues';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { isMobile } from 'helpers';
import { useOutsideClick } from 'helpers/hooks';
import Icon from 'components/Icon';

const deviceIsMobile = isMobile(navigator);

const reactions = [
  'angry',
  'crying',
  'surprised',
  'laughing',
  'heart',
  'thumb'
];

ReactionButton.propTypes = {
  style: PropTypes.object,
  onReactionClick: PropTypes.func,
  onSetReactionsMenuShown: PropTypes.func,
  reactionsMenuShown: PropTypes.bool
};

export default function ReactionButton({
  style,
  onReactionClick,
  onSetReactionsMenuShown,
  reactionsMenuShown
}) {
  const BarRef = useRef(null);
  const coolDownRef = useRef(null);
  useOutsideClick(BarRef, () => {
    if (!deviceIsMobile) return;
    coolDownRef.current = true;
    onSetReactionsMenuShown(false);
    setTimeout(() => {
      coolDownRef.current = false;
    }, 100);
  });

  return (
    <ErrorBoundary>
      <div
        style={{ display: 'flex', ...style }}
        onMouseEnter={() =>
          deviceIsMobile ? {} : onSetReactionsMenuShown(true)
        }
        onMouseLeave={() =>
          deviceIsMobile ? {} : onSetReactionsMenuShown(false)
        }
      >
        {reactionsMenuShown && (
          <div
            ref={BarRef}
            style={{
              width: '20rem',
              background: 'rgb(255, 255, 255)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginRight: '0.5rem',
              boxShadow: `0 0 1px ${Color.black()}`,
              outline: 0
            }}
          >
            {reactions.map((reaction) => (
              <div
                key={reaction}
                className={css`
                  cursor: pointer;
                  width: 2rem;
                  height: 2rem;
                  background: url(${Emojis}) ${reactionsObj[reaction].position} /
                    5100%;
                  transition: all 0.1s ease-in-out;
                  &:hover {
                    transform: scale(1.5);
                  }
                  @media (max-width: ${mobileMaxWidth}) {
                    &:hover {
                      transform: none;
                    }
                  }
                `}
                onClick={() => handleReactionClick(reaction)}
              />
            ))}
          </div>
        )}
        <Button
          className="menu-button"
          style={{ padding: '0.5rem 0.7rem', lineHeight: 1 }}
          color="darkerGray"
          opacity={0.5}
          skeuomorphic
          filled={reactionsMenuShown}
          onClick={() => (deviceIsMobile ? handleReactionBarShown() : {})}
        >
          <Icon icon="thumbs-up" />
        </Button>
      </div>
    </ErrorBoundary>
  );

  function handleReactionBarShown() {
    if (coolDownRef.current) return;
    coolDownRef.current = true;
    onSetReactionsMenuShown((shown) => !shown);
    setTimeout(() => {
      coolDownRef.current = false;
    }, 100);
  }

  function handleReactionClick(reaction) {
    onReactionClick(reaction);
    onSetReactionsMenuShown(false);
  }
}
