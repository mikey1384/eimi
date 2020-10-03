import React from 'react';
import PropTypes from 'prop-types';
import { Color } from 'constants/css';
import { css } from 'emotion';
import { useAppContext } from 'contexts';
import Icon from 'components/Icon';

InsertSlide.propTypes = {
  forkedFrom: PropTypes.number,
  interactiveId: PropTypes.number,
  slideId: PropTypes.number,
  style: PropTypes.object
};

export default function InsertSlide({
  interactiveId,
  forkedFrom,
  slideId,
  style
}) {
  const {
    requestHelpers: { insertInteractiveSlide }
  } = useAppContext();
  return (
    <div
      className={`unselectable ${css`
        &:hover {
          font-weight: bold;
        }
      `}`}
      style={{
        padding: '0.5rem',
        background: '#fff',
        textAlign: 'center',
        border: `1px solid ${Color.borderGray()}`,
        cursor: 'pointer',
        ...style
      }}
      onClick={handleInsertSlide}
    >
      <Icon icon="plus" />
      <span style={{ marginLeft: '0.7rem', fontSize: '1.2rem' }}>
        Insert a slide
      </span>
    </div>
  );

  async function handleInsertSlide() {
    await insertInteractiveSlide({ interactiveId, forkedFrom, slideId });
  }
}
