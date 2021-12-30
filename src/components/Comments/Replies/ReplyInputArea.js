import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import InputForm from 'components/Forms/InputForm';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import { useInputContext } from 'contexts';
import { useContentState } from 'helpers/hooks';
import { v1 as uuidv1 } from 'uuid';
import localize from 'constants/localize';

const enterReplyLabel = localize('enterReply');

ReplyInputArea.propTypes = {
  rootCommentId: PropTypes.number,
  innerRef: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onSubmitWithAttachment: PropTypes.func.isRequired,
  parent: PropTypes.object.isRequired,
  rows: PropTypes.number,
  style: PropTypes.object,
  targetCommentId: PropTypes.number
};

export default function ReplyInputArea({
  innerRef,
  onSubmit,
  onSubmitWithAttachment,
  parent,
  rootCommentId,
  style,
  targetCommentId,
  rows = 1
}) {
  const state = useInputContext((v) => v.state);
  const onSetCommentAttachment = useInputContext(
    (v) => v.actions.onSetCommentAttachment
  );
  const { fileUploadComplete, fileUploadProgress } = useContentState({
    contentId: targetCommentId,
    contentType: 'comment'
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const attachment = useMemo(
    () => state['comment' + targetCommentId]?.attachment,
    [state, targetCommentId]
  );

  return (
    <ErrorBoundary>
      <div style={style}>
        {uploadingFile ? (
          <FileUploadStatusIndicator
            style={{
              fontSize: '1.7rem',
              fontWeight: 'bold',
              marginTop: 0,
              width: '100%'
            }}
            fileName={attachment?.file?.name}
            uploadComplete={fileUploadComplete}
            uploadProgress={fileUploadProgress}
          />
        ) : (
          <InputForm
            innerRef={innerRef}
            onSubmit={handleSubmit}
            parent={parent}
            placeholder={`${enterReplyLabel}...`}
            rows={rows}
            targetCommentId={targetCommentId}
          />
        )}
      </div>
    </ErrorBoundary>
  );

  async function handleSubmit(text) {
    if (attachment) {
      setUploadingFile(true);
      await onSubmitWithAttachment({
        attachment,
        commentContent: text,
        contentId: parent.contentId,
        contentType: parent.contentType,
        filePath: uuidv1(),
        file: attachment.file,
        rootCommentId,
        subjectId: parent.subjectId,
        targetCommentId,
        isReply: true
      });
      onSetCommentAttachment({
        attachment: undefined,
        contentType: 'comment',
        contentId: targetCommentId
      });
    } else {
      onSubmit({
        content: text,
        rootCommentId,
        subjectId: parent.subjectId,
        targetCommentId
      });
    }
    setUploadingFile(false);
    return Promise.resolve();
  }
}
