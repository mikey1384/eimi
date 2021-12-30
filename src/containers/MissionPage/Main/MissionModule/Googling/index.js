import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Question from './Question';
import Button from 'components/Button';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { scrollElementToCenter } from 'helpers';
import { useAppContext, useMissionContext } from 'contexts';

Googling.propTypes = {
  mission: PropTypes.object.isRequired,
  onSetMissionState: PropTypes.func.isRequired,
  style: PropTypes.object
};
export default function Googling({ mission, onSetMissionState, style }) {
  const uploadMissionAttempt = useAppContext(
    (v) => v.requestHelpers.uploadMissionAttempt
  );
  const onUpdateMissionAttempt = useMissionContext(
    (v) => v.actions.onUpdateMissionAttempt
  );
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [answers, setAnswers] = useState(mission.answers || {});
  const answersRef = useRef(mission.answers || {});
  const [hasErrorObj, setHasErrorObj] = useState(mission.hasErrorObj || {});
  const hasErrorObjRef = useRef(mission.hasErrorObj || {});
  const QuestionRefs = useRef({});
  const BodyRef = useRef(document.scrollingElement || document.documentElement);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      onSetMissionState({
        missionId: mission.id,
        newState: {
          answers: answersRef.current,
          hasErrorObj: hasErrorObjRef.current
        }
      });
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={style}>
      {mission.questions.map((question) => (
        <Question
          key={question.id}
          innerRef={(ref) => (QuestionRefs.current[question.id] = ref)}
          hasError={hasErrorObj[question.id]}
          question={question}
          answer={answers[question.id] || ''}
          onInputChange={(text) =>
            handleSetAnswers({ questionId: question.id, answer: text })
          }
          style={{
            marginBottom: '2rem'
          }}
        />
      ))}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '-1rem'
        }}
      >
        <Button
          style={{ fontSize: '1.7rem' }}
          disabled={submitDisabled}
          color="blue"
          filled
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );

  function handleSetAnswers({ questionId, answer }) {
    handleSetHasErrorObj({ questionId, hasError: false });
    setAnswers((answers) => ({
      ...answers,
      [questionId]: answer
    }));
    answersRef.current = {
      ...answersRef.current,
      [questionId]: answer
    };
  }

  function handleSetHasErrorObj({ questionId, hasError }) {
    setHasErrorObj((hasErrorObj) => ({
      ...hasErrorObj,
      [questionId]: hasError
    }));
    hasErrorObjRef.current = {
      ...hasErrorObjRef.current,
      [questionId]: hasError
    };
  }

  async function handleSubmit() {
    setSubmitDisabled(true);
    for (let { id: questionId } of mission.questions) {
      if (!answers[questionId] || stringIsEmpty(answers[questionId])) {
        handleSetHasErrorObj({
          questionId,
          hasError: true
        });
        scrollElementToCenter(QuestionRefs.current[questionId]);
        setSubmitDisabled(false);
        return QuestionRefs.current[questionId].focus();
      }
    }

    const { success } = await uploadMissionAttempt({
      missionId: mission.id,
      attempt: {
        answers
      }
    });
    if (success) {
      if (mounted.current) {
        setAnswers({});
        answersRef.current = {};
      }
      if (mounted.current) {
        onSetMissionState({
          missionId: mission.id,
          newState: {
            answers: {},
            hasErrorObj: {}
          }
        });
      }
      if (mounted.current) {
        onUpdateMissionAttempt({
          missionId: mission.id,
          newState: { status: 'pending', tryingAgain: false }
        });
      }
      document.getElementById('App').scrollTop = 0;
      BodyRef.current.scrollTop = 0;
    }
    setSubmitDisabled(false);
  }
}
