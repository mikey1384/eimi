import React, { useMemo } from 'react';
import Button from 'components/Button';
import { Color } from 'constants/css';
import { useAppContext } from 'contexts';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import localize from 'constants/localize';

const logInLabel = localize('logIn');

export default function PleaseLogIn() {
  const {
    user: {
      actions: { onOpenSigninModal }
    }
  } = useAppContext();

  const doYouWantToChatAndPlayChessLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return (
        <p>
          다른 유저들과{' '}
          <span style={{ color: Color.vantaBlack(), fontWeight: 'bold' }}>
            채팅
          </span>
          하고{' '}
          <span style={{ color: Color.vantaBlack(), fontWeight: 'bold' }}>
            단어게임과 체스
          </span>
          를 즐기고 싶으신가요?
        </p>
      );
    }
    return (
      <p>
        Do you want to{' '}
        <span style={{ color: Color.vantaBlack(), fontWeight: 'bold' }}>
          chat
        </span>{' '}
        and play{' '}
        <span style={{ color: Color.vantaBlack(), fontWeight: 'bold' }}>
          vocabulary games & chess
        </span>{' '}
        with{' '}
        <span style={{ color: Color.logoBlue(), fontWeight: 'bold' }}>
          Twin
        </span>
        <span style={{ color: Color.logoGreen(), fontWeight: 'bold' }}>
          kle
        </span>{' '}
        students and teachers?
      </p>
    );
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: '#fff',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          color: Color.black(),
          textAlign: 'center',
          fontSize: '3rem',
          marginTop: '-5rem'
        }}
      >
        {doYouWantToChatAndPlayChessLabel}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Button
          filled
          color="green"
          style={{ fontSize: '3rem' }}
          onClick={onOpenSigninModal}
        >
          {logInLabel}
        </Button>
      </div>
    </div>
  );
}
