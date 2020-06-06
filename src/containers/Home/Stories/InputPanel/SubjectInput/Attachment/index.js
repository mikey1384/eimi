import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import WebsiteContent from './WebsiteContent';
import FileContent from './FileContent';

Attachment.propTypes = {
  attachment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default function Attachment({
  attachment,
  attachment: { contentType, fileType },
  onClose
}) {
  return (
    <ErrorBoundary
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Icon
        icon="times"
        style={{
          zIndex: 1,
          display: 'flex',
          background: '#000',
          color: '#fff',
          borderRadius: '50%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0.2rem',
          width: '2rem',
          height: '2rem',
          position: 'absolute',
          cursor: 'pointer',
          right: '-0.5rem',
          top: '-1rem'
        }}
        onClick={onClose}
      />
      {contentType === 'file' ? (
        <FileContent
          file={attachment.file}
          fileType={fileType}
          imageUrl={attachment.imageUrl}
        />
      ) : (
        <WebsiteContent attachment={attachment} />
      )}
    </ErrorBoundary>
  );
}
