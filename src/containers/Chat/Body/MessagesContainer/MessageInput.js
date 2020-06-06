import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { isMobile } from 'helpers';
import {
  stringIsEmpty,
  addEmoji,
  finalizeEmoji,
  exceedsCharLimit
} from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { useChatContext, useInputContext } from 'contexts';
import TargetMessagePreview from './TargetMessagePreview';
import TargetSubjectPreview from './TargetSubjectPreview';
import AddButtons from './AddButtons';

MessageInput.propTypes = {
  currentChannelId: PropTypes.number,
  innerRef: PropTypes.object,
  isTwoPeopleChannel: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  loading: PropTypes.bool,
  onChessButtonClick: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  onImagePaste: PropTypes.func.isRequired,
  onMessageSubmit: PropTypes.func.isRequired,
  onSelectVideoButtonClick: PropTypes.func.isRequired,
  onUploadButtonClick: PropTypes.func.isRequired
};

function MessageInput({
  currentChannelId = 0,
  innerRef,
  isTwoPeopleChannel,
  loading,
  onChessButtonClick,
  onImagePaste,
  onHeightChange,
  onMessageSubmit,
  onSelectVideoButtonClick,
  onUploadButtonClick
}) {
  const { profileTheme } = useMyState();
  const {
    state: { isRespondingToSubject, replyTarget },
    actions: { onSetIsRespondingToSubject, onSetReplyTarget }
  } = useChatContext();
  const {
    state,
    actions: { onEnterComment }
  } = useInputContext();
  const prevChannelId = useRef(currentChannelId);
  const textForThisChannel = state['chat' + currentChannelId] || '';
  const textRef = useRef(textForThisChannel);
  const [text, setText] = useState(textForThisChannel);

  useEffect(() => {
    if (prevChannelId !== currentChannelId) {
      onEnterComment({
        contentType: 'chat',
        contentId: prevChannelId.current,
        text: textRef.current
      });
      handleSetText('');
    }
    prevChannelId.current = currentChannelId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannelId]);

  useEffect(() => {
    handleSetText(textForThisChannel);
  }, [textForThisChannel]);

  useEffect(() => {
    const inputHeight = innerRef.current?.clientHeight;
    if (!loading) {
      onHeightChange(inputHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerRef, loading]);

  useEffect(() => {
    if (!isMobile(navigator)) {
      innerRef.current.focus();
    }
  }, [currentChannelId, innerRef]);

  const messageExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'message',
        contentType: 'chat',
        text
      }),
    [text]
  );

  useEffect(() => {
    return function saveTextBeforeUnmount() {
      onEnterComment({
        contentType: 'chat',
        contentId: prevChannelId.current,
        text: textRef.current
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {isRespondingToSubject ? (
        <TargetSubjectPreview
          onClose={() => onSetIsRespondingToSubject(false)}
        />
      ) : replyTarget ? (
        <TargetMessagePreview onClose={() => onSetReplyTarget(null)} />
      ) : null}
      <div style={{ display: 'flex' }}>
        {!!isTwoPeopleChannel && (
          <div
            style={{
              margin: '0.2rem 1rem 0.2rem 0',
              height: '100%'
            }}
          >
            <Button
              disabled={loading}
              skeuomorphic
              onClick={onChessButtonClick}
              color={profileTheme}
            >
              <Icon size="lg" icon={['fas', 'chess']} />
              <span className="desktop" style={{ marginLeft: '0.7rem' }}>
                Chess
              </span>
            </Button>
          </div>
        )}
        <Textarea
          innerRef={innerRef}
          minRows={1}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
          value={text}
          onChange={handleChange}
          onKeyUp={(event) => {
            if (event.key === ' ') {
              handleSetText(addEmoji(event.target.value));
            }
          }}
          onPaste={handlePaste}
          style={{
            marginRight: '1rem',
            ...(messageExceedsCharLimit?.style || {})
          }}
        />
        {!stringIsEmpty(text) && (
          <div
            style={{
              height: '100%',
              margin: `0.2rem 1rem 0.2rem 0`
            }}
          >
            <Button
              filled
              disabled={loading}
              color={profileTheme}
              onClick={handleSendMsg}
            >
              <Icon size="lg" icon="paper-plane" />
            </Button>
          </div>
        )}
        <AddButtons
          disabled={loading}
          onUploadButtonClick={onUploadButtonClick}
          onSelectVideoButtonClick={onSelectVideoButtonClick}
        />
      </div>
    </div>
  );

  function handleChange(event) {
    setTimeout(() => {
      onHeightChange(innerRef.current?.clientHeight);
    }, 0);
    handleSetText(event.target.value);
  }

  function handleKeyDown(event) {
    const shiftKeyPressed = event.shiftKey;
    const enterKeyPressed = event.keyCode === 13;
    if (
      enterKeyPressed &&
      !isMobile(navigator) &&
      !shiftKeyPressed &&
      !messageExceedsCharLimit &&
      !loading
    ) {
      event.preventDefault();
      handleSendMsg();
    }
    if (enterKeyPressed && shiftKeyPressed) {
      onHeightChange(innerRef.current?.clientHeight + 20);
    }
  }

  function handlePaste(event) {
    const { items } = event.clipboardData;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].type.includes('image')) continue;
      onImagePaste(items[i].getAsFile());
    }
  }

  async function handleSendMsg() {
    innerRef.current.focus();
    if (stringIsEmpty(text)) return;
    try {
      await onMessageSubmit(finalizeEmoji(text));
      handleSetText('');
    } catch (error) {
      console.error(error);
    }
  }

  function handleSetText(newText) {
    setText(newText);
    textRef.current = newText;
  }
}

export default memo(MessageInput);
