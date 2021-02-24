import React, { useEffect, useRef, useState } from 'react';
import { stringIsEmpty, addEmoji, finalizeEmoji } from 'helpers/stringHelpers';
import PropTypes from 'prop-types';
import Textarea from 'components/Texts/Textarea';
import Button from 'components/Button';
import Input from 'components/Texts/Input';
import ErrorBoundary from 'components/ErrorBoundary';
import RewardLevelForm from 'components/Forms/RewardLevelForm';
import SecretMessageInput from 'components/Forms/SecretMessageInput';
import { useInputContext } from 'contexts';

SubjectInputForm.propTypes = {
  autoFocus: PropTypes.bool,
  canEditRewardLevel: PropTypes.bool,
  contentId: PropTypes.number,
  contentType: PropTypes.string,
  descriptionMaxChar: PropTypes.number,
  descriptionPlaceholder: PropTypes.string,
  isSubject: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  rows: PropTypes.number,
  titleMaxChar: PropTypes.number,
  titlePlaceholder: PropTypes.string
};

export default function SubjectInputForm({
  autoFocus,
  canEditRewardLevel,
  contentId,
  contentType,
  isSubject,
  onClose,
  rows,
  titlePlaceholder,
  titleMaxChar = 300,
  descriptionMaxChar = 5000,
  descriptionPlaceholder,
  onSubmit
}) {
  const {
    state,
    actions: { onSetSubjectInputForm }
  } = useInputContext();
  const subjectInputForm = state['subject' + contentType + contentId] || {};
  const {
    title: prevTitle = '',
    description: prevDescription = '',
    secretAnswer: prevSecretAnswer = '',
    secretAttachment: prevSecretAttachment = null,
    rewardLevel = 0
  } = subjectInputForm;
  const [title, setTitle] = useState(prevTitle);
  const titleRef = useRef(prevTitle);
  const [description, setDescription] = useState(prevDescription);
  const descriptionRef = useRef(prevDescription);
  const [secretAnswer, setSecretAnswer] = useState(prevSecretAnswer);
  const secretAnswerRef = useRef(prevSecretAnswer);
  const [secretAttachment, setSecretAttachment] = useState(
    prevSecretAttachment
  );
  const secretAttachmentRef = useRef(prevSecretAttachment);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return function cleanUp() {
      onSetSubjectInputForm({
        contentId,
        contentType,
        form: {
          title: titleRef.current,
          description: descriptionRef.current,
          secretAnswer: secretAnswerRef.current,
          secretAttachment: secretAttachmentRef.current
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div>
        <Input
          autoFocus={autoFocus}
          placeholder={titlePlaceholder}
          value={title}
          style={{
            borderColor: title.length > titleMaxChar && 'red',
            color: title.length > titleMaxChar && 'red'
          }}
          onChange={handleSetTitle}
          onKeyUp={(event) => handleSetTitle(addEmoji(event.target.value))}
        />
        {title.length > titleMaxChar && (
          <small style={{ color: 'red', fontSize: '1.6rem' }}>
            {`Exceeded title's`} character limit of {titleMaxChar} characters.
            You can write more in the description field below.
          </small>
        )}
        <div style={{ position: 'relative' }}>
          <Textarea
            style={{
              marginTop: '1rem',
              color: description.length > descriptionMaxChar && 'red',
              borderColor: description.length > descriptionMaxChar && 'red'
            }}
            minRows={rows}
            placeholder={descriptionPlaceholder}
            value={description}
            onChange={(event) => handleSetDescription(event.target.value)}
            onKeyUp={(event) =>
              handleSetDescription(addEmoji(event.target.value))
            }
          />
          {description.length > descriptionMaxChar && (
            <small style={{ color: 'red', fontSize: '1.3rem' }}>
              {descriptionMaxChar} character limit exceeded
            </small>
          )}
          {isSubject && (
            <SecretMessageInput
              secretAnswer={secretAnswer}
              secretAttachment={secretAttachment}
              onSetSecretAnswer={handleSetSecretAnswer}
              onSetSecretAttachment={handleSetSecretAttachment}
            />
          )}
          {canEditRewardLevel && (
            <RewardLevelForm
              themed
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                padding: '1rem',
                fontSize: '3rem'
              }}
              rewardLevel={rewardLevel}
              onSetRewardLevel={(rewardLevel) =>
                onSetSubjectInputForm({
                  contentId,
                  contentType,
                  form: { rewardLevel }
                })
              }
            />
          )}
        </div>
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button
            transparent
            style={{ fontSize: '1.7rem', marginRight: '1rem' }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            style={{ fontSize: '1.7rem' }}
            onClick={handleSubmit}
            disabled={
              submitting ||
              !title ||
              stringIsEmpty(title) ||
              title.length > titleMaxChar ||
              description.length > descriptionMaxChar ||
              secretAnswer.length > descriptionMaxChar
            }
          >
            Submit
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );

  function handleCancel() {
    onSetSubjectInputForm({
      contentId,
      contentType,
      form: undefined
    });
    onClose();
  }

  function handleSetTitle(text) {
    setTitle(text);
    titleRef.current = text;
  }

  function handleSetDescription(text) {
    setDescription(text);
    descriptionRef.current = text;
  }

  function handleSetSecretAnswer(text) {
    setSecretAnswer(text);
    secretAnswerRef.current = text;
  }

  function handleSetSecretAttachment(attachment) {
    setSecretAttachment(attachment);
    secretAttachmentRef.current = attachment;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title: finalizeEmoji(title),
        description: finalizeEmoji(description),
        rewardLevel,
        secretAnswer: finalizeEmoji(secretAnswer)
      });
      onSetSubjectInputForm({
        contentId,
        contentType,
        form: undefined
      });
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  }
}
