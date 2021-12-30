import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { processedStringWithURL } from 'helpers/stringHelpers';

Bio.propTypes = {
  firstRow: PropTypes.string,
  secondRow: PropTypes.string,
  thirdRow: PropTypes.string,
  small: PropTypes.bool,
  style: PropTypes.object
};

export default function Bio({ firstRow, secondRow, thirdRow, small, style }) {
  const processedFirstRow = useMemo(
    () => processedStringWithURL(firstRow),
    [firstRow]
  );
  const processedSecondRow = useMemo(
    () => processedStringWithURL(secondRow),
    [secondRow]
  );
  const processedThirdRow = useMemo(
    () => processedStringWithURL(thirdRow),
    [thirdRow]
  );

  return (
    <ul
      style={{
        display: 'flex',
        marginTop: '2rem',
        flexDirection: 'column',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        paddingLeft: '2rem',
        lineHeight: 1.6,
        fontSize: small ? '1.5rem' : '1.7rem',
        ...style
      }}
    >
      {firstRow && (
        <li
          dangerouslySetInnerHTML={{
            __html: processedFirstRow
          }}
        />
      )}
      {secondRow && (
        <li
          dangerouslySetInnerHTML={{
            __html: processedSecondRow
          }}
        />
      )}
      {thirdRow && (
        <li
          dangerouslySetInnerHTML={{
            __html: processedThirdRow
          }}
        />
      )}
    </ul>
  );
}
