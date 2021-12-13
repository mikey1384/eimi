import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';

AddButtons.propTypes = {
  disabled: PropTypes.bool,
  onUploadButtonClick: PropTypes.func.isRequired,
  onSelectVideoButtonClick: PropTypes.func.isRequired,
  profileTheme: PropTypes.string
};

export default function AddButtons({
  disabled,
  onUploadButtonClick,
  onSelectVideoButtonClick,
  profileTheme
}) {
  return (
    <div
      style={{
        display: 'flex',
        margin: '0.2rem 0 0.2rem 0',
        alignItems: 'flex-start'
      }}
    >
      <Button
        skeuomorphic
        disabled={disabled}
        onClick={onUploadButtonClick}
        color={profileTheme}
      >
        <Icon size="lg" icon="upload" />
      </Button>
      <Button
        skeuomorphic
        disabled={disabled}
        color={profileTheme}
        onClick={onSelectVideoButtonClick}
        style={{ marginLeft: '1rem' }}
      >
        <Icon size="lg" icon="film" />
      </Button>
    </div>
  );
}
