import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Color } from 'constants/css';
import { removeLineBreaks } from 'helpers/stringHelpers';
import { useMyState } from '../helpers/hooks';

ContentLink.propTypes = {
  content: PropTypes.shape({
    byUser: PropTypes.number,
    content: PropTypes.string,
    id: PropTypes.number,
    missionType: PropTypes.string,
    rootMissionType: PropTypes.string,
    title: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  style: PropTypes.object,
  contentType: PropTypes.string
};

export default function ContentLink({
  style,
  content: {
    byUser,
    id,
    content,
    missionType,
    rootMissionType,
    title,
    username
  },
  contentType
}) {
  const { profileTheme } = useMyState();
  const destination = useMemo(() => {
    let result = '';
    if (contentType === 'url') {
      result = 'links';
    } else {
      result = contentType + 's';
    }
    return result;
  }, [contentType]);
  const label = title || content || username;
  return label ? (
    <Link
      style={{
        fontWeight: 'bold',
        color: byUser ? Color[profileTheme](0.9) : Color.blue(),
        ...style
      }}
      to={`/${destination}/${
        contentType === 'user'
          ? username
          : contentType === 'mission'
          ? rootMissionType || missionType
          : id
      }`}
    >
      {removeLineBreaks(label)}
    </Link>
  ) : (
    <span style={{ fontWeight: 'bold', color: Color.darkerGray() }}>
      (Deleted)
    </span>
  );
}
