import React from 'react';

export const title = `Formatting`;
export const instruction = (
  <>
    Our code looks really messy right now. Tap the{' '}
    <b style={{ color: '#4B9BE1' }}>format</b> button to clean it up.{' '}
    {`Don't make any changes to the code itself`}
  </>
);
export const initialCode = `function HomePage() {
  return (<div style={{width: "100%",height: "100%",display: "flex",flexDirection: "column", alignItems: "center"}}><p style={{color: "#FF00FF",fontFamily: "sans-serif",fontWeight: "bold",fontSize: "2rem"}}>Welcome to My Website!</p><button style={{marginTop: "3rem",padding: "1rem",color: "white",background: "blue",border: "none",fontSize: "2rem",cursor: "pointer"}} onClick={() => alert("Hello World")}>Tap me</button></div>);
}`;

const formattedCode = `function HomePage() {
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
      <p
        style={{
          color: "#FF00FF",
          fontFamily: "sans-serif",
          fontWeight: "bold",
          fontSize: "2rem"
        }}
      >
        Welcome to My Website!
      </p>
      <button
        style={{
          marginTop: "3rem",
          padding: "1rem",
          color: "white",
          background: "blue",
          border: "none",
          fontSize: "2rem",
          cursor: "pointer"
        }}
        onClick={() => alert("Hello World")}
      >
        Tap me
      </button>
    </div>
  );
}`;

export async function onRunCode({
  code,
  onSetErrorMsg,
  onUpdateMissionStatus
}) {
  if (code === formattedCode) {
    return await onUpdateMissionStatus();
  }
  onSetErrorMsg(
    <>{`Don't make any changes to the content of the code. Just tap the "Format" button. Tap the "Reset" button to start over`}</>
  );
}
