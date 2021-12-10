import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import InputForm from 'components/Forms/InputForm';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import LocalContext from './Context';
import { useInputContext } from 'contexts';
import { useContentState } from 'helpers/hooks';
import { v1 as uuidv1 } from 'uuid';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import RewardLevelExpectation from './RewardLevelExpectation';

CommentInputArea.propTypes = {
  autoFocus: PropTypes.bool,
  clickListenerState: PropTypes.bool,
  inputTypeLabel: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  InputFormRef: PropTypes.object,
  numInputRows: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onViewSecretAnswer: PropTypes.func,
  parent: PropTypes.object.isRequired,
  rootCommentId: PropTypes.number,
  subjectId: PropTypes.number,
  style: PropTypes.object,
  subjectRewardLevel: PropTypes.number,
  targetCommentId: PropTypes.number
};

export default function CommentInputArea({
  autoFocus,
  clickListenerState,
  innerRef,
  inputTypeLabel,
  InputFormRef,
  numInputRows = 4,
  onSubmit,
  onViewSecretAnswer,
  parent,
  rootCommentId,
  subjectId,
  style,
  subjectRewardLevel,
  targetCommentId
}) {
  const placeholderLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return '댓글을 입력하세요...';
    }
    return `Enter your ${inputTypeLabel} here...`;
  }, [inputTypeLabel]);
  const contentType = useMemo(
    () =>
      targetCommentId ? 'comment' : subjectId ? 'subject' : parent.contentType,
    [parent, targetCommentId, subjectId]
  );
  const contentId = useMemo(
    () => targetCommentId || subjectId || parent.contentId,
    [parent, targetCommentId, subjectId]
  );
  const { onSubmitWithAttachment } = useContext(LocalContext);
  const {
    state,
    actions: { onSetCommentAttachment }
  } = useInputContext();

  const { fileUploadComplete, fileUploadProgress } = useContentState({
    contentId,
    contentType
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const attachment = useMemo(
    () => state[contentType + contentId]?.attachment,
    [contentId, contentType, state]
  );

  return (
    <div style={{ ...style, position: 'relative' }} ref={InputFormRef}>
      {!!subjectRewardLevel && (
        <RewardLevelExpectation rewardLevel={subjectRewardLevel} />
      )}
      {uploadingFile ? (
        <FileUploadStatusIndicator
          style={{
            fontSize: '1.7rem',
            fontWeight: 'bold',
            marginTop: 0,
            paddingBottom: '1rem'
          }}
          fileName={attachment?.file?.name}
          uploadComplete={fileUploadComplete}
          uploadProgress={fileUploadProgress}
        />
      ) : (
        <InputForm
          innerRef={innerRef}
          clickListenerState={clickListenerState}
          autoFocus={autoFocus}
          onSubmit={handleSubmit}
          onViewSecretAnswer={onViewSecretAnswer}
          parent={{ contentId, contentType }}
          rows={numInputRows}
          placeholder={placeholderLabel}
          targetCommentId={targetCommentId}
        />
      )}
    </div>
  );

  async function handleSubmit(text) {
    if (attachment) {
      setUploadingFile(true);
      await onSubmitWithAttachment({
        attachment,
        commentContent: text,
        contentId,
        contentType,
        filePath: uuidv1(),
        file: attachment.file,
        rootCommentId,
        subjectId,
        targetCommentId
      });
      onSetCommentAttachment({
        attachment: undefined,
        contentType,
        contentId
      });
    } else {
      await onSubmit({
        content: text,
        rootCommentId,
        subjectId,
        targetCommentId
      });
    }
    setUploadingFile(false);
    return Promise.resolve();
  }
}
