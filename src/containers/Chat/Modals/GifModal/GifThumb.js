import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

GifThumb.propTypes = {
  gif: PropTypes.object.isRequired
};

export default function GifThumb({ gif }) {
  const src = useMemo(() => {
    console.log(gif);
    return gif?.media[0]?.gif?.url;
  }, [gif]);
  return <img src={src} />;
}
