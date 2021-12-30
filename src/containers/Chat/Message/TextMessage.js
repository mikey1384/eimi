import React, {
  memo,
  useContext,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import EditTextArea from 'components/Texts/EditTextArea';
import ErrorBoundary from 'components/ErrorBoundary';
import Embedly from 'components/Embedly';
import LongText from 'components/Texts/LongText';
import { Color } from 'constants/css';
import { isValidSpoiler } from 'helpers/stringHelpers';
import { socket } from 'constants/io';
import { isMobile } from 'helpers';
import Spoiler from './Spoiler';
import LocalContext from '../Context';

const deviceIsMobile = isMobile(navigator);

TextMessage.propTypes = {
  attachmentHidden: PropTypes.bool,
  channelId: PropTypes.number,
  content: PropTypes.string.isRequired,
  extractedUrl: PropTypes.string,
  isNotification: PropTypes.bool,
  isReloadedSubject: PropTypes.bool,
  isSubject: PropTypes.bool,
  forceRefreshForMobile: PropTypes.func,
  messageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  MessageStyle: PropTypes.object,
  numMsgs: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isEditing: PropTypes.bool,
  onEditCancel: PropTypes.func.isRequired,
  onEditDone: PropTypes.func.isRequired,
  onShowSubjectMsgsModal: PropTypes.func.isRequired,
  socketConnected: PropTypes.bool,
  subjectId: PropTypes.number,
  theme: PropTypes.string,
  userCanEditThis: PropTypes.bool
};

function TextMessage({
  attachmentHidden,
  channelId,
  content,
  extractedUrl,
  isNotification,
  isReloadedSubject,
  isSubject,
  forceRefreshForMobile,
  messageId,
  MessageStyle,
  numMsgs,
  isEditing,
  onEditCancel,
  onEditDone,
  subjectId,
  onShowSubjectMsgsModal,
  socketConnected,
  userCanEditThis,
  theme
}) {
  const {
    requests: { hideChatAttachment },
    actions: { onHideAttachment }
  } = useContext(LocalContext);

  const Prefix = useMemo(() => {
    let prefix = null;
    if (isSubject) {
      prefix = (
        <span style={{ fontWeight: 'bold', color: Color[theme || 'green']() }}>
          Subject:{' '}
        </span>
      );
    }
    if (isReloadedSubject) {
      prefix = (
        <span style={{ fontWeight: 'bold', color: Color[theme || 'green']() }}>
          {'Returning Topic: '}
        </span>
      );
    }
    return prefix;
  }, [isReloadedSubject, isSubject, theme]);

  const handleHideAttachment = useCallback(async () => {
    await hideChatAttachment(messageId);
    onHideAttachment({ messageId, channelId });
    socket.emit('hide_message_attachment', { channelId, messageId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, messageId]);

  useEffect(() => {
    if (deviceIsMobile && isEditing) {
      forceRefreshForMobile?.();
    }
  }, [isEditing, forceRefreshForMobile]);

  return (
    <ErrorBoundary>
      <div>
        {isEditing ? (
          <EditTextArea
            allowEmptyText
            contentId={messageId}
            contentType="chat"
            autoFocus
            disabled={!socketConnected}
            rows={2}
            text={content}
            onCancel={onEditCancel}
            onEditDone={onEditDone}
          />
        ) : (
          <>
            <div className={MessageStyle.messageWrapper}>
              {Prefix}
              {isValidSpoiler(content) ? (
                <Spoiler content={content} />
              ) : (
                <LongText
                  style={{
                    marginTop: isSubject ? '0.5rem' : 0,
                    marginBottom: isSubject ? '0.5rem' : 0,
                    color: isNotification ? Color.gray() : undefined
                  }}
                >
                  {content}
                </LongText>
              )}
            </div>
            {!!isReloadedSubject && !!numMsgs && numMsgs > 0 && (
              <div className={MessageStyle.relatedConversationsButton}>
                <Button
                  filled
                  color="logoBlue"
                  skeuomorphic
                  onClick={() => onShowSubjectMsgsModal({ subjectId, content })}
                >
                  Show responses
                </Button>
              </div>
            )}
          </>
        )}
        {extractedUrl && messageId && !attachmentHidden && (
          <Embedly
            style={{ marginTop: '1rem' }}
            contentId={messageId}
            contentType="chat"
            loadingHeight="30vw"
            mobileLoadingHeight="70vw"
            onHideAttachment={handleHideAttachment}
            userCanEditThis={userCanEditThis}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default memo(TextMessage);
