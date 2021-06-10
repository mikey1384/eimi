import React from 'react';
import { Color } from 'constants/css';
import { BUTTON_LABEL } from './constants';
import { getAstProps } from 'helpers';
import { stringIsEmpty } from 'helpers/stringHelpers';

export const title = `2. Tap Me`;
export const instruction = (
  <>
    Change the label of the button from {`"Change me"`} to {`"${BUTTON_LABEL}"`}{' '}
    and tap the <b style={{ color: Color.green() }}>check</b> button
  </>
);
export const initialCode = `function HomePage() {
  return (
    <div
      style={{
        width: '100%',
        height: "100%",
        display: 'flex',
        justifyContent: 'center'
      }}
    >
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
        Change me
      </button>
    </div>
  );
}`;

export async function onRunCode({ ast, onUpdateMissionStatus, onSetErrorMsg }) {
  const jsxElements = getAstProps({ ast, propType: 'JSXElement' });
  let buttonText = '';
  for (let element of jsxElements) {
    if (element.openingElement?.name?.name === 'button' && element?.children) {
      for (let child of element?.children) {
        buttonText = child?.value || '';
      }
    }
  }
  if (buttonText.trim().toLowerCase() === BUTTON_LABEL.toLowerCase()) {
    return await onUpdateMissionStatus();
  }
  if (stringIsEmpty(buttonText)) {
    return onSetErrorMsg(`Hmmm... The button doesn't seem to have any label`);
  }
  onSetErrorMsg(
    `The button's label needs to be "${BUTTON_LABEL}," not "${buttonText.trim()}"`
  );
}