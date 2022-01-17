import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import DropdownButton from 'components/Buttons/DropdownButton';
import Icon from 'components/Icon';
import FullTextReveal from 'components/Texts/FullTextReveal';
import { useAppContext, useChatContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { socket } from 'constants/io';
import { addCommasToNumber } from 'helpers/stringHelpers';
import localize from 'constants/localize';

const logInLabel = localize('logIn');
const profileLabel = localize('Profile');
const managementLabel = localize('management');
const logOutLabel = localize('logOut');

AccountMenu.propTypes = {
  className: PropTypes.string,
  history: PropTypes.object.isRequired
};

function AccountMenu({ className, history }) {
  const [twinkleCoinsHovered, setTwinkleCoinsHovered] = useState(false);
  const { loggedIn, username, userId, managementLevel, twinkleCoins } =
    useMyState();
  const onLogout = useAppContext((v) => v.user.actions.onLogout);
  const onOpenSigninModal = useAppContext(
    (v) => v.user.actions.onOpenSigninModal
  );
  const onResetChat = useChatContext((v) => v.actions.onResetChat);

  const menuProps = useMemo(() => {
    const result = [
      {
        label: profileLabel,
        onClick: () => history.push(`/users/${username}`)
      }
    ];
    if (managementLevel > 0) {
      result.push({
        label: managementLabel,
        onClick: () => history.push('/management')
      });
    }
    result.push({
      label: logOutLabel,
      onClick: handleLogout
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementLevel, username]);

  const displayedTwinkleCoins = useMemo(() => {
    if (twinkleCoins > 999) {
      return '999+';
    }
    return twinkleCoins;
  }, [twinkleCoins]);

  const fullTwinkleCoins = useMemo(
    () => addCommasToNumber(twinkleCoins),
    [twinkleCoins]
  );

  return (
    <div className="desktop" style={{ display: 'flex', alignItems: 'center' }}>
      {loggedIn && false && (
        <div
          onMouseEnter={() => setTwinkleCoinsHovered(twinkleCoins > 999)}
          onMouseLeave={() => setTwinkleCoinsHovered(false)}
          onClick={() => setTwinkleCoinsHovered((hovered) => !hovered)}
          style={{ marginRight: '1rem', cursor: 'pointer' }}
        >
          <Icon icon={['far', 'badge-dollar']} /> {displayedTwinkleCoins}
          <FullTextReveal
            direction="left"
            className="desktop"
            show={twinkleCoinsHovered}
            text={fullTwinkleCoins}
            style={{
              fontSize: '1.3rem',
              width: 'auto',
              minWidth: null,
              maxWidth: null,
              padding: '1rem'
            }}
          />
        </div>
      )}
      {loggedIn ? (
        <DropdownButton
          className={className}
          transparent
          xAdjustment={-30}
          listStyle={{
            top: '4.5rem'
          }}
          text={
            <div
              style={{
                maxWidth: '12rem',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {username}
            </div>
          }
          shape="button"
          icon="caret-down"
          iconSize="lg"
          menuProps={menuProps}
        />
      ) : (
        <Button
          className={className}
          onClick={onOpenSigninModal}
          style={{ marginLeft: '1rem' }}
          color="green"
          filled
        >
          <div
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
          >
            {logInLabel}
          </div>
        </Button>
      )}
    </div>
  );

  function handleLogout() {
    socket.emit('leave_my_notification_channel', userId);
    socket.disconnect();
    socket.connect();
    onLogout();
    onResetChat();
  }
}

export default memo(AccountMenu);
