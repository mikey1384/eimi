import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { useMyState } from 'helpers/hooks';

AddButtons.propTypes = {
  disabled: PropTypes.bool,
  onUploadButtonClick: PropTypes.func.isRequired,
  onSelectGifButtonClick: PropTypes.func.isRequired,
  onSelectVideoButtonClick: PropTypes.func.isRequired
};

export default function AddButtons({
  disabled,
  onUploadButtonClick,
  onSelectGifButtonClick,
  onSelectVideoButtonClick
}) {
  const { profileTheme } = useMyState();
  return (
    <div
      style={{
        display: 'flex',
        margin: '1.1rem 0 0 0',
        alignItems: 'flex-start'
      }}
    >
      <Button
        skeuomorphic
        disabled={disabled}
        onClick={onUploadButtonClick}
        color={profileTheme}
        style={{ padding: '0.5rem' }}
      >
        <Icon size="sm" icon="upload" />
      </Button>
      <Button
        skeuomorphic
        disabled={disabled}
        onClick={onSelectGifButtonClick}
        color={profileTheme}
        style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
      >
        <Icon size="sm" icon={['fal', 'sticky-note']} />
      </Button>
      <Button
        skeuomorphic
        disabled={disabled}
        color={profileTheme}
        onClick={onSelectVideoButtonClick}
        style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
      >
        <Icon size="sm" icon="film" />
      </Button>
    </div>
  );
}
