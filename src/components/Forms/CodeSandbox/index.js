import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from './Editor';
import Button from 'components/Button';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { scrollElementToCenter } from 'helpers';
import { useAppContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { parse } from '@babel/parser';

CodeSandbox.propTypes = {
  code: PropTypes.string,
  initialCode: PropTypes.string,
  hasError: PropTypes.bool,
  onSetCode: PropTypes.func.isRequired,
  onSetErrorMsg: PropTypes.func,
  onSetPrevUserId: PropTypes.func,
  onRunCode: PropTypes.func,
  passed: PropTypes.bool,
  prevUserId: PropTypes.number,
  runButtonLabel: PropTypes.string,
  simulatorRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
};

export default function CodeSandbox({
  code: globalCode,
  initialCode,
  hasError,
  onSetCode,
  onSetErrorMsg,
  onSetPrevUserId,
  onRunCode,
  passed,
  prevUserId,
  runButtonLabel = 'Run',
  simulatorRef
}) {
  const {
    requestHelpers: { formatCode }
  } = useAppContext();
  const { userId } = useMyState();
  const timerRef = useRef(null);
  const ComponentRef = useRef(null);
  const [runButtonDisabled, setRunButtonDisabled] = useState(false);
  const [code, setCode] = useState(globalCode);
  const [ast, setAst] = useState(null);

  useEffect(() => {
    if (userId !== prevUserId) {
      onSetErrorMsg?.('');
      setCode(initialCode);
      onSetCode(initialCode);
      setAst(handleParse(initialCode));
      onSetPrevUserId(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, prevUserId, userId]);

  return (
    <ErrorBoundary
      innerRef={ComponentRef}
      style={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Editor
        style={{ marginTop: '2rem' }}
        value={globalCode}
        valueOnTextEditor={code}
        onChange={handleSetCode}
        onSetAst={setAst}
        ast={ast}
        onParse={handleParse}
        onSetErrorMsg={onSetErrorMsg}
        simulatorRef={simulatorRef}
      />
      <div
        style={{
          marginTop: '5rem',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex' }}>
          <Button
            style={{ fontSize: '1.3rem' }}
            filled
            color="logoBlue"
            onClick={handleFormatCode}
          >
            <Icon icon="indent" />
            <span style={{ marginLeft: '0.7rem' }}>Format</span>
          </Button>
          <Button
            style={{ marginLeft: '1rem', fontSize: '1.3rem' }}
            filled
            color="orange"
            onClick={handleReset}
          >
            <Icon icon="undo" />
            <span style={{ marginLeft: '0.7rem' }}>Reset</span>
          </Button>
        </div>
        <div>
          {onRunCode && !passed && (
            <Button
              disabled={runButtonDisabled || hasError}
              filled
              color={hasError ? 'cranberry' : 'green'}
              onClick={handleRunCode}
            >
              {!hasError && <Icon icon="play" />}
              <span style={{ marginLeft: '0.7rem' }}>
                {hasError ? 'Failed...' : runButtonLabel}
              </span>
            </Button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );

  async function handleFormatCode() {
    try {
      onSetErrorMsg?.('');
      const formattedCode = await formatCode(code);
      onSetCode(formattedCode);
      setCode(formattedCode);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleReset() {
    onSetErrorMsg?.('');
    setCode(initialCode);
    onSetCode(initialCode);
    scrollElementToCenter(ComponentRef.current, -250);
  }

  function handleParse(code) {
    return parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
  }

  function handleRunCode() {
    onRunCode?.({ ast, code });
  }

  function handleSetCode(text) {
    onSetErrorMsg?.('');
    clearTimeout(timerRef.current);
    setCode(text);
    setRunButtonDisabled(true);
    timerRef.current = setTimeout(() => {
      onSetCode(text);
      setRunButtonDisabled(false);
    }, 200);
  }
}
