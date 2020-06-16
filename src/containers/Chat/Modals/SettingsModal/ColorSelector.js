import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import FullTextReveal from 'components/Texts/FullTextReveal';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from 'emotion';

ColorSelector.propTypes = {
  unlocked: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired,
  onSetColor: PropTypes.func.isRequired,
  selectedColor: PropTypes.string,
  style: PropTypes.object
};

export default function ColorSelector({
  unlocked,
  colors,
  onSetColor,
  selectedColor,
  style
}) {
  const [hovered, setHovered] = useState();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...style
      }}
    >
      {colors.map((color) => {
        const locked = color !== 'green' && !unlocked.includes(color);
        return (
          <div key={color}>
            <div
              className={css`
                width: 3rem;
                height: 3rem;
                @media (max-width: ${mobileMaxWidth}) {
                  width: 2.1rem;
                  height: 2.1rem;
                }
              `}
              style={{
                borderRadius: '50%',
                background: Color[color](),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(selectedColor !== color
                  ? {
                      border: `0.5rem solid #fff`,
                      boxShadow: `0 0 5px #fff`
                    }
                  : {})
              }}
              onClick={() => onSetColor(color)}
              onMouseEnter={() => setHovered(color)}
              onMouseLeave={() => setHovered(undefined)}
            >
              {locked && (
                <Icon
                  className={css`
                    font-size: 1rem;
                    @media (max-width: ${mobileMaxWidth}) {
                      font-size: 0.6rem;
                    }
                  `}
                  style={{ color: '#fff' }}
                  icon="lock"
                />
              )}
            </div>
            {locked && hovered === color && (
              <FullTextReveal
                show
                direction="left"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  minWidth: '7rem'
                }}
                text={
                  <>
                    <Icon icon={['far', 'badge-dollar']} /> 10
                  </>
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
