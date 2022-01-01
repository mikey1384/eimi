import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Color, borderRadius } from 'constants/css';
import Button from 'components/Button';

const BodyRef = document.scrollingElement || document.documentElement;

TryAgain.propTypes = {
  isRepeating: PropTypes.bool,
  onInitMission: PropTypes.func.isRequired,
  onTryAgain: PropTypes.func.isRequired
};

export default function TryAgain({ isRepeating, onInitMission, onTryAgain }) {
  useLayoutEffect(() => {
    document.getElementById('App').scrollTop = 0;
    BodyRef.scrollTop = 0;
    onInitMission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        fontSize: '2rem',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          borderRadius,
          marginTop: '2.5rem',
          boxShadow: `0 0 2px ${Color.black()}`,
          padding: '1rem 3rem',
          fontWeight: 'bold',
          fontSize: '2rem',
          background: Color.black(),
          color: '#fff'
        }}
      >
        Mission Failed...
      </div>
      {!isRepeating && (
        <div
          style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}
        >{`Don't give up! You can do this`}</div>
      )}
      <div style={{ marginTop: '4.5rem' }}>
        <Button
          style={{ fontSize: '2.3rem' }}
          color="green"
          onClick={() => onTryAgain()}
          filled
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
