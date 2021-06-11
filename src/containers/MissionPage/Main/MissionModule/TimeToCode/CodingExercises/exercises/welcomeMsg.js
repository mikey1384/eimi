import React from 'react';
import { WELCOME_MSG } from './constants';
import { getAstProps } from 'helpers';
import { stringIsEmpty } from 'helpers/stringHelpers';

export const title = `4. Welcoming Your Visitors`;
export const instruction = (
  <>
    Add a message that says <b>{WELCOME_MSG}</b> between <b>{`<p>`}</b> and{' '}
    <b>{`</p>`}</b>
  </>
);
export const initialCode = `function HomePage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <p></p>
      <button
        style={{
          color: "white",
          background: "blue",
          border: "none",
          fontSize: "2rem",
          padding: "1rem",
          cursor: "pointer"
        }}
        onClick={() => alert('I am a button')}
      >
        Tap me
      </button>
    </div>
  );
}`;

export async function onRunCode({ ast, onSetErrorMsg, onUpdateMissionStatus }) {
  const jsxElements = getAstProps({
    ast,
    propType: 'JSXOpeningElement'
  });
  let alertText = '';
  for (let element of jsxElements) {
    if (element.attributes?.length > 0 && element?.name?.name === 'button') {
      for (let attribute of element.attributes) {
        if (
          attribute.name?.name === 'onClick' &&
          attribute?.value?.expression?.body?.callee?.name === 'alert'
        ) {
          alertText = attribute?.value?.expression?.body?.arguments?.[0]?.value;
        }
      }
    }
  }
  if (alertText.trim().toLowerCase() === 'Hello world'.toLowerCase()) {
    return await onUpdateMissionStatus();
  }
  if (stringIsEmpty(alertText)) {
    return onSetErrorMsg(
      `Hmmm... The alert popup does not seem to have any message in it`
    );
  }
  onSetErrorMsg(
    `The alert message should say, "Hello world," not "${alertText.trim()}"`
  );
}
