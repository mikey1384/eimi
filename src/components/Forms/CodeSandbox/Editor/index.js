import React, { createElement, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Preview from './Preview';
import SimpleEditor from 'react-simple-code-editor';
import okaidia from 'prism-react-renderer/themes/okaidia';
import Highlight, { Prism } from 'prism-react-renderer';
import traverse from '@babel/traverse';
import presetReact from '@babel/preset-react';
import { useAppContext } from 'contexts';
import { Color } from 'constants/css';
import { transformFromAstSync } from '@babel/core';

Editor.propTypes = {
  value: PropTypes.string,
  valueOnTextEditor: PropTypes.string,
  onChange: PropTypes.func,
  onSetAst: PropTypes.func.isRequired,
  ast: PropTypes.object,
  onParse: PropTypes.func.isRequired,
  onSetErrorMsg: PropTypes.func,
  style: PropTypes.object
};

export default function Editor({
  ast,
  value = '',
  valueOnTextEditor,
  onChange,
  onSetAst,
  onParse,
  onSetErrorMsg,
  style
}) {
  const lintCode = useAppContext((v) => v.requestHelpers.lintCode);
  const [error, setError] = useState('');
  const [errorLineNumber, setErrorLineNumber] = useState(null);

  useEffect(() => {
    setError('');
    setErrorLineNumber(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueOnTextEditor]);

  useEffect(() => {
    setError('');
    setErrorLineNumber(0);
    handleTranspile(value);

    async function handleTranspile(code) {
      try {
        const results = await lintCode(code);
        if (results[0]) {
          return handleSetError({
            error: results[0].message.split('\n')[0],
            lineNumber: results[0].line
          });
        }
        const ast = onParse(code);
        onSetAst(ast);
      } catch (error) {
        const errorString = error.toString();
        handleSetError({
          error: errorString,
          lineNumber: getErrorLineNumber(errorString)
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const CompiledElement = useMemo(
    () => {
      if (ast) {
        const component = handleGenerateElement(
          handleEvalCode(handleTransformBeforeCompilation(ast)),
          (error) => {
            const errorString = error.toString();
            handleSetError({
              error: errorString,
              lineNumber: getErrorLineNumber(errorString)
            });
          }
        );
        return createElement(component, null);
      }
      return null;

      function handleGenerateElement(code, errorCallback) {
        return errorBoundary(code, errorCallback);
        function errorBoundary(Element, errorCallback) {
          class ErrorBoundary extends React.Component {
            state = { hasError: false };
            componentDidCatch(error) {
              return errorCallback(error);
            }
            render() {
              return typeof Element === 'function'
                ? createElement(Element, null)
                : Element;
            }
          }
          return ErrorBoundary;
        }
      }

      function handleEvalCode(ast) {
        try {
          const transformedCode = transformFromAstSync(ast, undefined, {
            presets: [presetReact],
            inputSourceMap: false,
            sourceMaps: false,
            comments: false
          });
          const resultCode = transformedCode ? transformedCode.code : '';
          // eslint-disable-next-line no-new-func
          const res = new Function('React', `return ${resultCode}`);
          return res(React);
        } catch (error) {
          setError(error.toString());
          return null;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ast]
  );

  return (
    <div style={{ width: '100%', ...style }}>
      <Preview style={{ marginBottom: '5rem' }}>{CompiledElement}</Preview>
      <style
        dangerouslySetInnerHTML={{
          __html: `.npm__react-simple-code-editor__textarea { outline: none !important; }`
        }}
      />
      <SimpleEditor
        value={valueOnTextEditor}
        onValueChange={onChange}
        style={{
          fontSize: '1.3rem',
          color: '#fff',
          backgroundColor: 'rgb(39, 40, 34)',
          fontFamily: `Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace`,
          margin: 0
        }}
        highlight={(code) =>
          handleHighlightCode({
            code,
            theme: okaidia
          })
        }
        padding={8}
      />
      {error && (
        <p
          style={{
            color: Color.rose(),
            marginTop: '0.5rem',
            fontSize: '1.5rem'
          }}
        >
          {error}
        </p>
      )}
      <Preview style={{ marginTop: '5rem' }}>{CompiledElement}</Preview>
      <style
        dangerouslySetInnerHTML={{
          __html: `.npm__react-simple-code-editor__textarea { outline: none !important; }`
        }}
      />
    </div>
  );

  function getErrorLineNumber(errorString) {
    const firstCut = errorString?.split('(')?.[1];
    const secondCut = firstCut?.split(':')?.[0];
    const errorLineNumber = Number(secondCut);
    return isNaN(errorLineNumber) || !errorLineNumber ? 0 : errorLineNumber;
  }

  function handleHighlightCode({ code, theme }) {
    return (
      <Highlight Prism={Prism} code={code} theme={theme} language="jsx">
        {({ tokens, getLineProps, getTokenProps }) => (
          <>
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i });
              const lineStyle = lineProps.style || {};
              return (
                <div
                  key={i}
                  {...{
                    ...getLineProps({ line, key: i }),
                    style: {
                      ...lineStyle,
                      backgroundColor:
                        errorLineNumber === i + 1
                          ? Color.red(0.3)
                          : lineStyle?.backgroundColor
                    }
                  }}
                >
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token, key });
                    return <span key={key} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </>
        )}
      </Highlight>
    );
  }

  function handleSetError({ error, lineNumber }) {
    setError(error);
    setErrorLineNumber(lineNumber);
    if (error) {
      onSetErrorMsg?.(`There's a bug in your code. Please fix it first`);
    }
  }

  function handleTransformBeforeCompilation(ast) {
    try {
      traverse(ast, {
        VariableDeclaration(path) {
          if (path.parent.type === 'Program') {
            path.replaceWith(path.node.declarations[0].init);
          }
        },
        ImportDeclaration(path) {
          path.remove();
        },
        ExportDefaultDeclaration(path) {
          if (
            path.node.declaration.type === 'ArrowFunctionExpression' ||
            path.node.declaration.type === 'FunctionDeclaration'
          ) {
            path.replaceWith(path.node.declaration);
          } else {
            path.remove();
          }
        }
      });
    } catch (error) {
      setError(error);
    }
    return ast;
  }
}
