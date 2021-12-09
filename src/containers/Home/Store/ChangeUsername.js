import React, { useEffect, useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Input from 'components/Texts/Input';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Loading from 'components/Loading';
import { socket } from 'constants/io';
import { Color } from 'constants/css';
import { useAppContext, useContentContext } from 'contexts';
import { priceTable } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { isValidUsername, stringIsEmpty } from 'helpers/stringHelpers';
import localize from 'constants/localize';

const changeLabel = localize('change');
const isNotValidUsernameLabel = localize('isNotValidUsername');
const makeSure3CharLongLabel = localize('makeSure3CharLong');
const notEnoughTwinkleCoinsLabel = localize('notEnoughTwinkleCoins');
const enterNewUsernameLabel = localize('enterNewUsername');
const usernameAvailableLabel = localize('usernameAvailable');
const usernameAlreadyTakenLabel = localize('usernameAlreadyTaken');

ChangeUsername.propTypes = {
  style: PropTypes.object
};

export default function ChangeUsername({ style }) {
  const {
    requestHelpers: { changeUsername, checkIfUsernameExists }
  } = useAppContext();
  const {
    actions: { onUpdateUserCoins }
  } = useContentContext();
  const { twinkleCoins, userId, banned } = useMyState();
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const timerRef = useRef(null);
  const disabled = useMemo(() => {
    return !usernameAvailable || twinkleCoins < priceTable.username;
  }, [twinkleCoins, usernameAvailable]);

  useEffect(() => {
    setLoading(false);
    setUsernameAvailable(false);
    setErrorMessage('');
    clearTimeout(timerRef.current);
    if (!stringIsEmpty(newUsername)) {
      setLoading(true);
      timerRef.current = setTimeout(() => {
        handleUsernameInput(newUsername);
      }, 1000);
    }

    async function handleUsernameInput(username) {
      if (!isValidUsername(username)) {
        setErrorMessage(
          `${username}${isNotValidUsernameLabel}.${
            username.length < 3 ? ` ${makeSure3CharLongLabel}.` : ''
          }`
        );
        setLoading(false);
      } else {
        const exists = await checkIfUsernameExists(username);
        if (exists) {
          setErrorMessage(usernameAlreadyTakenLabel);
        } else {
          if (twinkleCoins < priceTable.username) {
            setErrorMessage(notEnoughTwinkleCoinsLabel);
          } else {
            setErrorMessage('');
            setUsernameAvailable(true);
          }
        }
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUsername]);

  return (
    <div style={style}>
      <div>
        <Input
          maxLength={20}
          placeholder={`${enterNewUsernameLabel}...`}
          onChange={setNewUsername}
          value={newUsername}
        />
      </div>
      <div
        style={{
          position: 'relative',
          height: '4rem',
          marginTop: '0.5rem'
        }}
      >
        {loading && (
          <Loading style={{ position: 'absolute', height: 0, top: '2rem' }} />
        )}
        <div
          style={{
            color: usernameAvailable ? Color.green() : 'red',
            fontSize: '1.3rem',
            fontWeight: usernameAvailable ? 'bold' : 'normal'
          }}
        >
          {usernameAvailable ? usernameAvailableLabel : errorMessage}
        </div>
        <Button
          style={{ position: 'absolute', top: '0.5rem', right: 0 }}
          filled
          color="green"
          disabled={disabled || changing}
          onClick={handleChangeUsername}
        >
          {changeLabel}
          <div style={{ marginLeft: '0.7rem' }}>
            (<Icon icon={['far', 'badge-dollar']} />
            <span style={{ marginLeft: '0.3rem' }}>{priceTable.username}</span>)
          </div>
        </Button>
      </div>
    </div>
  );

  async function handleChangeUsername() {
    if (banned?.posting) {
      return;
    }
    setChanging(true);
    const { coins, alreadyExists } = await changeUsername(newUsername);
    if (alreadyExists) {
      setUsernameAvailable(false);
      setErrorMessage(usernameAlreadyTakenLabel);
    } else {
      socket.emit('change_username', newUsername);
      onUpdateUserCoins({ coins, userId });
      setNewUsername('');
    }
    setChanging(false);
  }
}
