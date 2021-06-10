import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from './Editor';
import Button from 'components/Button';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { useAppContext } from 'contexts';
import { parse } from '@babel/parser';

CodeSandbox.propTypes = {
  code: PropTypes.string,
  hasError: PropTypes.bool,
  onSetCode: PropTypes.func.isRequired,
  onSetErrorMsg: PropTypes.func,
  onRunCode: PropTypes.func,
  passed: PropTypes.bool,
  runButtonLabel: PropTypes.string,
  simulatorRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
};

export default function CodeSandbox({
  code: globalCode,
  hasError,
  onSetCode,
  onSetErrorMsg,
  onRunCode,
  passed,
  runButtonLabel = 'Run',
  simulatorRef
}) {
  const {
    requestHelpers: { formatCode }
  } = useAppContext();
  const timerRef = useRef(null);
  const [runButtonDisabled, setRunButtonDisabled] = useState(false);
  const [code, setCode] = useState(globalCode);
  const [ast, setAst] = useState(null);

  return (
    <ErrorBoundary
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
          marginTop: '1rem',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <Button
            disabled={hasError}
            filled
            color="logoBlue"
            onClick={handleFormatCode}
          >
            <Icon icon="indent" />
            <span style={{ marginLeft: '0.7rem' }}>Format</span>
          </Button>
        </div>
        <div>
          {onRunCode && !passed && (
            <Button
              disabled={runButtonDisabled || hasError}
              filled
              color="green"
              onClick={handleRunCode}
            >
              <Icon icon="play" />
              <span style={{ marginLeft: '0.7rem' }}>{runButtonLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );

  async function handleFormatCode() {
    try {
      const formattedCode = await formatCode(code);
      onSetCode(formattedCode);
      setCode(formattedCode);
    } catch (error) {
      console.log(error);
    }
  }

  function handleParse(code) {
    return parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
  }

  function handleRunCode() {
    onRunCode?.(ast);
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
