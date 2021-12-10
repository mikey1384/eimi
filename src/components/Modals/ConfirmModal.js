import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import localize from 'constants/localize';

const areYouSureLabel = localize('areYouSure');
const cancelLabel = localize('cancel');
const confirmLabel = localize('confirm');

ConfirmModal.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  disabled: PropTypes.bool,
  descriptionFontSize: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  modalOverModal: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default function ConfirmModal({
  disabled = false,
  description = areYouSureLabel,
  descriptionFontSize = '2.5rem',
  modalOverModal,
  onHide,
  title,
  onConfirm
}) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <Modal modalOverModal={modalOverModal} onHide={onHide}>
      <header>{title}</header>
      <main style={{ fontSize: descriptionFontSize, paddingTop: 0 }}>
        {description}
      </main>
      <footer>
        <Button transparent style={{ marginRight: '0.7rem' }} onClick={onHide}>
          {cancelLabel}
        </Button>
        <Button
          disabled={submitting || disabled}
          color="blue"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );

  function handleConfirm() {
    setSubmitting(true);
    onConfirm();
  }
}
