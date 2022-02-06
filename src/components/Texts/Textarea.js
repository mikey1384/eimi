import React from 'react';
import PropTypes from 'prop-types';
import { Color } from 'constants/css';
import { css } from '@emotion/css';
import TextareaAutosize from 'react-textarea-autosize';

Textarea.propTypes = {
  className: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  maxRows: PropTypes.number,
  type: PropTypes.string
};

export default function Textarea({
  className,
  innerRef,
  type = 'text',
  maxRows = 20,
  ...props
}) {
  return (
    <TextareaAutosize
      {...props}
      maxRows={maxRows}
      type={type}
      ref={innerRef}
      className={`${className} ${css`
        width: 100%;
        line-height: 1.6;
        position: relative;
        font-size: 1.5rem;
        padding: 1rem;
        border: 1px solid ${Color.darkerBorderGray()};
        &:focus {
          outline: none;
          border: 1px solid ${Color.logoBlue()};
          box-shadow: 0px 0px 3px ${Color.logoBlue(0.8)};
          ::placeholder {
            color: ${Color.lighterGray()};
          }
        }
        ::placeholder {
          color: ${Color.gray()};
        }
      `}`}
    />
  );
}
