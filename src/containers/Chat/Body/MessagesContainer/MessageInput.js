import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import Button from 'components/Button';
import Icon from 'components/Icon';
import TargetMessagePreview from './TargetMessagePreview';
import TargetSubjectPreview from './TargetSubjectPreview';
import UploadModal from '../../Modals/UploadModal';
import AddButtons from './AddButtons';
import AlertModal from 'components/Modals/AlertModal';
import Loading from 'components/Loading';
import { isMobile } from 'helpers';
import {
  stringIsEmpty,
  addEmoji,
  finalizeEmoji,
  exceedsCharLimit
} from 'helpers/stringHelpers';
import { mb, returnMaxUploadSize } from 'constants/defaultValues';
import LocalContext from '../../Context';
import localize from 'constants/localize';

const enterMessageLabel = localize('enterMessage');

MessageInput.propTypes = {
  currentChannelId: PropTypes.number,
  innerRef: PropTypes.object,
  isRespondingToSubject: PropTypes.bool,
  isTwoPeopleChannel: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  loading: PropTypes.bool,
  onChessButtonClick: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  onMessageSubmit: PropTypes.func.isRequired,
  onSelectVideoButtonClick: PropTypes.func.isRequired,
  replyTarget: PropTypes.object,
  recepientId: PropTypes.number,
  socketConnected: PropTypes.bool,
  subjectId: PropTypes.number
};

const deviceIsMobile = isMobile(navigator);

function MessageInput({
  currentChannelId = 0,
  innerRef,
  isRespondingToSubject,
  isTwoPeopleChannel,
  loading,
  onChessButtonClick,
  onHeightChange,
  onMessageSubmit,
  onSelectVideoButtonClick,
  replyTarget,
  recepientId,
  socketConnected,
  subjectId
}) {
  const mounted = useRef(true);
  const {
    actions: { onEnterComment, onSetIsRespondingToSubject, onSetReplyTarget },
    inputState,
    myState: { banned, profileTheme, fileUploadLvl }
  } = useContext(LocalContext);
  const FileInputRef = useRef(null);
  const prevChannelId = useRef(currentChannelId);
  const textForThisChannel = useMemo(
    () => inputState['chat' + currentChannelId]?.text || '',
    [currentChannelId, inputState]
  );
  const maxSize = useMemo(
    () => returnMaxUploadSize(fileUploadLvl),
    [fileUploadLvl]
  );
  const textRef = useRef(textForThisChannel);
  const inputCoolingDown = useRef(false);
  const timerRef = useRef(null);
  const [alertModalShown, setAlertModalShown] = useState(false);
  const [fileObj, setFileObj] = useState(null);
  const [uploadModalShown, setUploadModalShown] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);
  const [text, setText] = useState(textForThisChannel);
  const textIsEmpty = useMemo(() => stringIsEmpty(text), [text]);

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
    if (!deviceIsMobile) {
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

  const handleSendMsg = useCallback(async () => {
    if (!socketConnected || inputCoolingDown.current) {
      if (inputCoolingDown.current) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (mounted.current) {
            setCoolingDown(false);
          }
          inputCoolingDown.current = false;
        }, 700);
      }
      return;
    }
    if (mounted.current) {
      setCoolingDown(true);
    }
    inputCoolingDown.current = true;
    timerRef.current = setTimeout(() => {
      if (mounted.current) {
        setCoolingDown(false);
      }
      inputCoolingDown.current = false;
    }, 500);
    if (banned?.chat) {
      return;
    }
    innerRef.current.focus();
    if (stringIsEmpty(text)) return;
    try {
      await onMessageSubmit(finalizeEmoji(text));
      if (mounted.current) {
        handleSetText('');
      }
      if (mounted.current) {
        onEnterComment({
          contentType: 'chat',
          contentId: currentChannelId,
          text: ''
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [
    banned?.chat,
    currentChannelId,
    innerRef,
    onEnterComment,
    onMessageSubmit,
    socketConnected,
    text
  ]);

  const handleSetText = (newText) => {
    setText(newText);
    textRef.current = newText;
  };

  const handleKeyDown = useCallback(
    (event) => {
      const shiftKeyPressed = event.shiftKey;
      const enterKeyPressed = event.keyCode === 13;
      if (
        enterKeyPressed &&
        !deviceIsMobile &&
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
    },
    [handleSendMsg, innerRef, loading, messageExceedsCharLimit, onHeightChange]
  );

  const handleImagePaste = useCallback(
    (file) => {
      if (file.size / mb > maxSize) {
        return setAlertModalShown(true);
      }
      setFileObj(file);
      setUploadModalShown(true);
    },
    [maxSize]
  );

  const handleUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file.size / mb > maxSize) {
        return setAlertModalShown(true);
      }
      setFileObj(file);
      setUploadModalShown(true);
      event.target.value = null;
    },
    [maxSize]
  );

  const handleChange = useCallback(
    (event) => {
      setTimeout(() => {
        onHeightChange(innerRef.current?.clientHeight);
      }, 0);
      handleSetText(event.target.value);
    },
    [innerRef, onHeightChange]
  );

  const handlePaste = useCallback(
    (event) => {
      const { items } = event.clipboardData;
      for (let i = 0; i < items.length; i++) {
        if (!items[i].type.includes('image')) continue;
        handleImagePaste(items[i].getAsFile());
      }
    },
    [handleImagePaste]
  );

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
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
          channelId={currentChannelId}
          onClose={() =>
            onSetIsRespondingToSubject({
              channelId: currentChannelId,
              isResponding: false
            })
          }
        />
      ) : replyTarget ? (
        <TargetMessagePreview
          replyTarget={replyTarget}
          onClose={() =>
            onSetReplyTarget({ channelId: currentChannelId, target: null })
          }
        />
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
              disabled={loading || banned?.chess}
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
          placeholder={`${enterMessageLabel}...`}
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
        {!textIsEmpty && (
          <div
            style={{
              margin: `0.2rem 1rem 0.2rem 0`
            }}
          >
            <Button
              filled
              disabled={loading || !socketConnected || coolingDown}
              color={profileTheme}
              onClick={handleSendMsg}
            >
              <Icon size="lg" icon="paper-plane" />
            </Button>
          </div>
        )}
        <AddButtons
          disabled={loading || !!banned?.chat || !socketConnected}
          onUploadButtonClick={() => FileInputRef.current.click()}
          onSelectVideoButtonClick={onSelectVideoButtonClick}
          profileTheme={profileTheme}
        />
        {!socketConnected && (
          <Loading
            style={{
              height: 0,
              width: 0,
              position: 'absolute',
              right: '7rem',
              bottom: '3.2rem'
            }}
          />
        )}
        <input
          ref={FileInputRef}
          style={{ display: 'none' }}
          type="file"
          onChange={handleUpload}
        />
      </div>
      {alertModalShown && (
        <AlertModal
          title="File is too large"
          content={`The file size is larger than your limit of ${
            maxSize / mb
          } MB`}
          onHide={() => setAlertModalShown(false)}
        />
      )}
      {uploadModalShown && (
        <UploadModal
          initialCaption={text}
          recepientId={recepientId}
          subjectId={subjectId}
          channelId={currentChannelId}
          fileObj={fileObj}
          onUpload={() => {
            handleSetText('');
            setUploadModalShown(false);
          }}
          replyTarget={replyTarget}
          onHide={() => setUploadModalShown(false)}
        />
      )}
    </div>
  );
}

export default memo(MessageInput);
