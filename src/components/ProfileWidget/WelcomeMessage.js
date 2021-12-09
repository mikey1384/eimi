import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import localize from 'constants/localize';

const logInLabel = localize('logIn2');
const tapHereLabel = localize('tapHere');
const toAccessAllFeaturesLabel = localize('toAccessAllFeatures');

WelcomeMessage.propTypes = {
  userId: PropTypes.number,
  openSigninModal: PropTypes.func
};

export default function WelcomeMessage({ userId, openSigninModal }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {!userId && (
        <>
          <div className="login-message">{logInLabel}</div>
          <div className="login-message">{toAccessAllFeaturesLabel}</div>
        </>
      )}
      {!userId && (
        <Button
          filled
          color="green"
          style={{ marginTop: '1rem' }}
          onClick={openSigninModal}
        >
          {tapHereLabel}!
        </Button>
      )}
    </div>
  );
}
