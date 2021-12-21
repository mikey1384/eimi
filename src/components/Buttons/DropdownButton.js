import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import Button from 'components/Button';
import DropdownList from 'components/DropdownList';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import { css } from '@emotion/css';

DropdownButton.propTypes = {
  buttonStyle: PropTypes.object,
  icon: PropTypes.string,
  iconSize: PropTypes.string,
  isReversed: PropTypes.bool,
  direction: PropTypes.string,
  innerRef: PropTypes.object,
  onButtonClick: PropTypes.func,
  onOutsideClick: PropTypes.func,
  listStyle: PropTypes.object,
  menuProps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      onClick: PropTypes.func
    })
  ),
  noBorderRadius: PropTypes.bool,
  opacity: PropTypes.number,
  stretch: PropTypes.bool,
  style: PropTypes.object,
  text: PropTypes.any
};

export default function DropdownButton({
  buttonStyle = {},
  direction,
  opacity = 1,
  style,
  icon = 'pencil-alt',
  iconSize = '1x',
  isReversed,
  listStyle = {},
  menuProps,
  noBorderRadius,
  onButtonClick,
  text = '',
  stretch,
  innerRef,
  ...props
}) {
  const [menuDisplayed, setMenuDisplayed] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const coolDownRef = useRef(null);
  const ButtonRef = useRef(null);

  return (
    <ErrorBoundary
      innerRef={innerRef}
      style={{ position: 'relative', ...style }}
    >
      <div ref={ButtonRef}>
        <Button
          {...props}
          className={css`
            opacity: ${menuDisplayed ? 1 : opacity};
            &:hover {
              opacity: 1;
            }
          `}
          style={{
            borderRadius: noBorderRadius && 0,
            border: noBorderRadius && 0,
            margin: noBorderRadius && 0,
            ...(stretch ? { width: '100%' } : {}),
            ...buttonStyle
          }}
          onClick={onClick}
        >
          <Icon icon={icon} size={iconSize} />
          {text && <span>&nbsp;&nbsp;</span>}
          {text}
        </Button>
        {menuDisplayed && (
          <DropdownList
            style={{
              textTransform: 'none',
              minWidth: '12rem',
              ...listStyle
            }}
            isReversed={isReversed}
            direction={direction}
            x={coordinates.x}
            y={coordinates.y}
            onHideMenu={handleHideMenuWithCoolDown}
          >
            {renderMenu()}
          </DropdownList>
        )}
      </div>
    </ErrorBoundary>
  );

  function onClick() {
    if (coolDownRef.current) return;
    const coordinate = ButtonRef.current.getBoundingClientRect();
    setCoordinates({
      x: coordinate.left - 10,
      y: isReversed ? coordinate.top + 25 : coordinate.top - 15
    });
    if (typeof onButtonClick === 'function') {
      onButtonClick(!menuDisplayed);
    }
    setMenuDisplayed(!menuDisplayed);
  }

  function handleHideMenuWithCoolDown() {
    setMenuDisplayed(false);
    coolDownRef.current = true;
    setTimeout(() => {
      coolDownRef.current = false;
    }, 10);
  }

  function renderMenu() {
    return menuProps.map((prop, index) => {
      if (prop.separator) {
        return <hr key={index} />;
      }
      return (
        <li
          style={prop.style}
          className={`${css`
            opacity: ${prop.disabled && 0.3};
            cursor: ${prop.disabled ? 'default' : 'pointer'};
            &:hover {
              background: ${prop.disabled ? '#fff !important' : ''};
            }
          `} ${prop.className}
          `}
          onClick={
            prop.disabled ? () => {} : () => handleMenuClick(prop.onClick)
          }
          key={index}
        >
          {prop.label}
        </li>
      );
    });
  }

  function handleMenuClick(action) {
    action();
    setMenuDisplayed(false);
  }
}
