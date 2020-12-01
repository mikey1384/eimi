import React from 'react';
import CheckListGroup from 'components/CheckListGroup';
import { Color, borderRadius } from 'constants/css';

const choices = [
  { label: 'graduate by', checked: false },
  { label: 'graduate from', checked: false },
  { label: 'graduating', checked: false },
  { label: 'graduating from', checked: false }
];

export default function Grammar() {
  return (
    <div
      style={{
        width: '100%',
        border: `1px solid ${Color.borderGray()}`,
        padding: '2rem 2rem 3rem 2rem',
        borderRadius
      }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3>What year did you _____ university?</h3>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '3rem'
          }}
        >
          <CheckListGroup
            style={{ marginTop: '1.5rem', width: '80%', fontSize: '1.6rem' }}
            onSelect={(index) => console.log(index)}
            listItems={choices}
          />
        </div>
      </div>
    </div>
  );
}
