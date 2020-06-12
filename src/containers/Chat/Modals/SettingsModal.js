import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import Input from 'components/Texts/Input';
import SelectNewOwnerModal from './SelectNewOwnerModal';
import SwitchButton from 'components/Buttons/SwitchButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import FullTextReveal from 'components/Texts/FullTextReveal';
import Icon from 'components/Icon';
import { priceTable } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { useAppContext, useChatContext } from 'contexts';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from 'emotion';

SettingsModal.propTypes = {
  channelId: PropTypes.number,
  canChangeSubject: PropTypes.string,
  members: PropTypes.array,
  onDone: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  channelName: PropTypes.string,
  isClass: PropTypes.bool,
  isClosed: PropTypes.bool,
  userIsChannelOwner: PropTypes.bool,
  onSelectNewOwner: PropTypes.func
};

export default function SettingsModal({
  channelId,
  channelName,
  canChangeSubject,
  isClass,
  isClosed,
  members,
  onDone,
  onHide,
  onSelectNewOwner,
  userIsChannelOwner
}) {
  const {
    requestHelpers: { buyChatSubject }
  } = useAppContext();
  const {
    state: { customChannelNames }
  } = useChatContext();
  const { twinkleCoins } = useMyState();
  const [hovered, setHovered] = useState(false);
  const [selectNewOwnerModalShown, setSelectNewOwnerModalShown] = useState(
    false
  );
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [editedChannelName, setEditedChannelName] = useState(channelName);
  const [editedIsClosed, setEditedIsClosed] = useState(isClosed);
  const [editedCanChangeSubject, setEditedCanChangeSubject] = useState(
    canChangeSubject
  );
  const insufficientFunds = useMemo(
    () => twinkleCoins < priceTable.chatSubject,
    [twinkleCoins]
  );
  const disabled = useMemo(() => {
    const customChannelName = customChannelNames[channelId];
    let channelNameDidNotChange = editedChannelName === channelName;
    if (customChannelName !== channelName) {
      channelNameDidNotChange = false;
    }
    return (
      (stringIsEmpty(editedChannelName) || channelNameDidNotChange) &&
      isClosed === editedIsClosed &&
      editedCanChangeSubject === canChangeSubject
    );
  }, [
    canChangeSubject,
    channelId,
    channelName,
    customChannelNames,
    editedCanChangeSubject,
    editedChannelName,
    editedIsClosed,
    isClosed
  ]);

  return (
    <Modal onHide={onHide}>
      <header>{userIsChannelOwner ? 'Settings' : 'Edit Group Name'}</header>
      <main>
        <div
          className={css`
            width: 80%;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
            }
          `}
        >
          <div style={{ width: '100%' }}>
            {userIsChannelOwner && (
              <p style={{ fontWeight: 'bold', fontSize: '1.7rem' }}>
                Channel Name:
              </p>
            )}
            <Input
              style={{ marginTop: '0.5rem', width: '100%' }}
              autoFocus
              placeholder="Enter channel name..."
              value={editedChannelName}
              onChange={setEditedChannelName}
            />
          </div>
          {userIsChannelOwner && !isClass && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '1.5rem'
              }}
            >
              <p style={{ fontWeight: 'bold', fontSize: '1.7rem' }}>
                <span style={{ color: Color.logoBlue() }}>Anyone</span> can
                invite new members:
              </p>
              <SwitchButton
                style={{ marginLeft: '1rem' }}
                checked={!editedIsClosed}
                onChange={() => setEditedIsClosed((isClosed) => !isClosed)}
              />
            </div>
          )}
          {userIsChannelOwner && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.7rem',
                    opacity: canChangeSubject ? 1 : 0.3
                  }}
                >
                  <span style={{ color: Color.logoBlue() }}>Anyone</span> can
                  change subject:
                </p>
                <SwitchButton
                  disabled={!canChangeSubject}
                  style={{ marginLeft: '1rem' }}
                  checked={editedCanChangeSubject === 'all'}
                  onChange={() =>
                    setEditedCanChangeSubject((prevValue) =>
                      !prevValue || prevValue === 'all' ? 'owner' : 'all'
                    )
                  }
                />
              </div>
              {!canChangeSubject && (
                <div>
                  <Button
                    onClick={() =>
                      insufficientFunds ? null : setConfirmModalShown(true)
                    }
                    filled
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    color="logoBlue"
                    style={{
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: insufficientFunds ? 0.2 : 1,
                      cursor: insufficientFunds ? 'default' : 'pointer'
                    }}
                  >
                    <Icon size="lg" icon={['far', 'badge-dollar']} />
                    <span style={{ marginLeft: '0.5rem' }}>Buy</span>
                  </Button>
                  {insufficientFunds && hovered && (
                    <FullTextReveal
                      show
                      direction="left"
                      style={{ color: '#000', marginTop: '2px' }}
                      text={`You need ${
                        priceTable.chatSubject - twinkleCoins
                      } more Twinkle Coins`}
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            {userIsChannelOwner && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '2rem'
                }}
              >
                <Button
                  onClick={() => setSelectNewOwnerModalShown(true)}
                  default
                  filled
                >
                  Change Owner
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer>
        <Button transparent style={{ marginRight: '0.7rem' }} onClick={onHide}>
          Cancel
        </Button>
        <Button
          color="blue"
          disabled={disabled}
          onClick={() =>
            onDone({
              editedChannelName,
              editedIsClosed,
              editedCanChangeSubject
            })
          }
        >
          Done
        </Button>
      </footer>
      {selectNewOwnerModalShown && (
        <SelectNewOwnerModal
          modalOverModal
          onHide={() => setSelectNewOwnerModalShown(false)}
          members={members}
          onSubmit={({ newOwner }) => {
            onSelectNewOwner({ newOwner });
            onHide();
          }}
          isClass={isClass}
        />
      )}
      {confirmModalShown && (
        <ConfirmModal
          modalOverModal
          onHide={() => setConfirmModalShown(false)}
          title={`Purchase "Subject" Feature`}
          description={`Purchase "Subject" Feature for 10 Twinkle Coins?`}
          descriptionFontSize="2rem"
          onConfirm={handlePurchaseSubject}
        />
      )}
    </Modal>
  );

  async function handlePurchaseSubject() {
    const data = await buyChatSubject(channelId);
    console.log(data);
    onHide();
  }
}
