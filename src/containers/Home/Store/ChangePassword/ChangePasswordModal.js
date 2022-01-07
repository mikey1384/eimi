import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import Input from 'components/Texts/Input';
import { useAppContext } from 'contexts';
import { stringIsEmpty } from 'helpers/stringHelpers';

ChangePasswordModal.propTypes = {
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default function ChangePasswordModal({ onHide, onConfirm }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const confirmPassword = useAppContext(
    (v) => v.requestHelpers.confirmPassword
  );

  return (
    <Modal closeWhenClickedOutside={false} small onHide={onHide}>
      <header>Change Your Password</header>
      <main>
        <Input
          value={password}
          onChange={(text) => {
            setErrorMsg('');
            setPassword(text);
          }}
          placeholder="Enter your password"
          type="password"
          hasError={!!errorMsg}
          onKeyPress={(event) => {
            if (
              !stringIsEmpty(password) &&
              event.key === 'Enter' &&
              !errorMsg
            ) {
              handleConfirmPassword();
            }
          }}
        />
        {errorMsg ? (
          <span style={{ color: 'red', marginTop: '0.5rem' }}>{errorMsg}</span>
        ) : null}
      </main>
      <footer>
        <Button onClick={onHide} transparent>
          Cancel
        </Button>
        <Button
          style={{ marginLeft: '1rem' }}
          color="blue"
          onClick={handleConfirmPassword}
        >
          Done
        </Button>
      </footer>
    </Modal>
  );

  async function handleConfirmPassword() {
    const success = await confirmPassword(password);
    if (success) {
      onConfirm();
      onHide();
    } else {
      setErrorMsg('wrong password');
    }
  }
}
