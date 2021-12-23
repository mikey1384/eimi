import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import Input from 'components/Texts/Input';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';

VerificationCodeInput.propTypes = {
  email: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};

export default function VerificationCodeInput({ onRetry, email }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { verifyEmailViaOTP } = useAppContext((v) => v.requestHelpers);
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  const { userId } = useMyState();

  return (
    <ErrorBoundary
      style={{
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <Input
        className={css`
          width: 50%;
          @media (max-width: ${mobileMaxWidth}) {
            width: 100%;
          }
        `}
        disabled={verifying}
        type="text"
        maxLength={6}
        placeholder="Enter the 6-digit number"
        onChange={handleCodeInput}
        value={verificationCode}
      />
      {errorMsg && (
        <p
          style={{
            color: Color.red(),
            fontWeight: 'bold',
            fontSize: '1.3rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          {errorMsg}
        </p>
      )}
      <p
        onClick={onRetry}
        style={{
          marginTop: '0.5rem',
          cursor: 'pointer',
          color: Color.blue()
        }}
        className={css`
          font-size: 1.3rem;
          &:hover {
            text-decoration: underline;
          }
        `}
      >{`Didn't receive an email? Tap here to retry`}</p>
    </ErrorBoundary>
  );

  async function handleCodeInput(text) {
    setErrorMsg('');
    setVerificationCode(text);
    if (text.length === 6) {
      setVerifying(true);
      const success = await verifyEmailViaOTP({ otp: text, email });
      if (success) {
        setVerifying(false);
        onUpdateProfileInfo({
          userId,
          verifiedEmail: email,
          emailMissionAttempted: true
        });
      } else {
        setErrorMsg(`That is not the number we sent you. Please try again`);
        setVerifying(false);
      }
    }
  }
}
