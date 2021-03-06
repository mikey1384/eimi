import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import request from 'axios';
import Message from './Message';
import Loading from 'components/Loading';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import { Color } from 'constants/css';
import { queryStringForArray } from 'helpers/stringHelpers';
import URL from 'constants/URL';

const API_URL = `${URL}/chat`;

SubjectMsgsModal.propTypes = {
  onHide: PropTypes.func,
  subjectId: PropTypes.number,
  subjectTitle: PropTypes.string
};

export default function SubjectMsgsModal({ onHide, subjectId, subjectTitle }) {
  const [loading, setLoading] = useState(false);
  const [loadMoreButtonShown, setLoadMoreButtonShown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [usermenuShown, setUsermenuShown] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    handleLoadMessages();
    async function handleLoadMessages() {
      try {
        const {
          data: { messages, loadMoreButtonShown }
        } = await request.get(
          `${API_URL}/chatSubject/messages?subjectId=${subjectId}`
        );
        if (mounted.current) {
          setMessages(messages);
          setLoadMoreButtonShown(loadMoreButtonShown);
        }
      } catch (error) {
        console.error(error.response || error);
      }
    }
    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      modalOverModal
      closeWhenClickedOutside={!usermenuShown}
      onHide={onHide}
    >
      <header>
        <span style={{ color: Color.green() }}>{subjectTitle}</span>
      </header>
      <main>
        {loadMoreButtonShown && (
          <LoadMoreButton
            color="lightBlue"
            filled
            onClick={onLoadMoreButtonClick}
            loading={loading}
          />
        )}
        {messages.length === 0 && <Loading />}
        {messages.map((message) => (
          <Message
            key={message.id}
            onUsermenuShownChange={setUsermenuShown}
            {...message}
          />
        ))}
      </main>
      <footer>
        <Button transparent onClick={onHide}>
          Close
        </Button>
      </footer>
    </Modal>
  );

  async function onLoadMoreButtonClick() {
    setLoading(true);
    const queryString = queryStringForArray({
      array: messages,
      originVar: 'id',
      destinationVar: 'messageIds'
    });
    try {
      const {
        data: { messages: loadedMsgs, loadMoreButtonShown }
      } = await request.get(
        `${API_URL}/chatSubject/messages/more?subjectId=${subjectId}&${queryString}`
      );
      setLoading(false);
      setMessages(loadedMsgs.concat(messages));
      setLoadMoreButtonShown(loadMoreButtonShown);
    } catch (error) {
      console.error(error.response || error);
    }
  }
}
