import React from 'react';
import { Color } from 'constants/css';
import { getAstProps } from 'helpers';

export const title = `1. Make It Blue`;
export const instruction = (
  <>
    Change the color of the <b style={{ color: 'red' }}>red</b> button below to{' '}
    <b style={{ color: 'blue' }}>blue</b> and tap the{' '}
    <b style={{ color: Color.green() }}>check</b> button
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
          background: "red",
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
  const jsxElements = getAstProps({
    ast,
    propType: 'JSXOpeningElement'
  });
  let buttonColor = '';
  for (let element of jsxElements) {
    if (element.attributes?.length > 0 && element?.name?.name === 'button') {
      for (let attribute of element.attributes) {
        if (attribute?.name?.name === 'style') {
          const styleProps = attribute?.value?.expression?.properties;
          for (let prop of styleProps) {
            if (
              prop?.key?.name === 'background' ||
              prop?.key?.name === 'backgroundColor'
            ) {
              buttonColor = prop?.value?.value;
              break;
            }
          }
        }
      }
    }
  }
  if (
    buttonColor === 'blue' ||
    buttonColor.toLowerCase() === '#0000ff' ||
    buttonColor === 'rgb(0, 0, 255)'
  ) {
    return await onUpdateMissionStatus();
  }
  if (!buttonColor) {
    return onSetErrorMsg(
      <>
        Please change the color of the button to{' '}
        <span style={{ color: 'blue' }}>blue</span>
      </>
    );
  }
  onSetErrorMsg(
    <>
      The {`button's`} color needs to be{' '}
      <span style={{ color: 'blue' }}>blue,</span> not {buttonColor}
    </>
  );
}