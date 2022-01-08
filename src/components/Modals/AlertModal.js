import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';

AlertModal.propTypes = {
  onHide: PropTypes.func.isRequired,
  modalOverModal: PropTypes.bool,
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
};
export default function AlertModal({ onHide, modalOverModal, title, content }) {
  return (
    <Modal modalOverModal={modalOverModal} onHide={onHide}>
      <header>{title}</header>
      <main>{content}</main>
      <footer>
        <Button color="blue" onClick={onHide}>
          OK
        </Button>
      </footer>
    </Modal>
  );
}
