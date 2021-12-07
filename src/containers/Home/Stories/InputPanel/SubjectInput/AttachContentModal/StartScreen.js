import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import AlertModal from 'components/Modals/AlertModal';
import ErrorBoundary from 'components/ErrorBoundary';
import { isMobile } from 'helpers';
import { Color } from 'constants/css';
import { useMyState } from 'helpers/hooks';
import {
  addCommasToNumber,
  getFileInfoFromFileName
} from 'helpers/stringHelpers';
import { useInputContext } from 'contexts';
import {
  FILE_UPLOAD_XP_REQUIREMENT,
  mb,
  returnMaxUploadSize
} from 'constants/defaultValues';

StartScreen.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired
};

const deviceIsMobile = isMobile(navigator);

export default function StartScreen({ navigateTo, onHide }) {
  const {
    actions: { onSetSubjectAttachment }
  } = useInputContext();
  const { authLevel, fileUploadLvl, twinkleXP } = useMyState();
  const [alertModalShown, setAlertModalShown] = useState(false);
  const FileInputRef = useRef(null);
  const maxSize = useMemo(
    () => returnMaxUploadSize(fileUploadLvl),
    [fileUploadLvl]
  );
  const disabled = useMemo(() => {
    if (authLevel > 1) return false;
    if (twinkleXP >= FILE_UPLOAD_XP_REQUIREMENT) return false;
    return true;
  }, [authLevel, twinkleXP]);

  return (
    <ErrorBoundary style={{ display: 'flex', width: '100%' }}>
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '2rem',
            color: Color.black()
          }}
        >
          from Your {deviceIsMobile ? 'Device' : 'Computer'}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '1.5rem'
          }}
        >
          <Button
            skeuomorphic
            style={{ fontSize: '3.5rem', padding: '1.5rem' }}
            color="blue"
            onClick={() => FileInputRef.current.click()}
            disabled={disabled}
          >
            <Icon icon="upload" />
          </Button>
          {disabled && (
            <div
              style={{
                marginTop: '1rem',
                fontWeight: 'bold'
              }}
            >{`Requires ${addCommasToNumber(
              FILE_UPLOAD_XP_REQUIREMENT
            )} XP`}</div>
          )}
        </div>
      </div>
      <div
        style={{
          width: '50%',
          flexDirection: 'column',
          alignItems: 'center',
          display: 'flex',
          marginLeft: '1rem'
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '2rem',
            color: Color.black()
          }}
        >
          from Twinkle Website
        </div>
        <div
          style={{
            marginTop: '2.5rem',
            display: 'flex'
          }}
        >
          <Button
            skeuomorphic
            style={{ fontSize: '2rem' }}
            color="logoBlue"
            onClick={() => navigateTo('selectVideo')}
          >
            <Icon icon="film" />
            <span style={{ marginLeft: '1rem' }}>Video</span>
          </Button>
          <Button
            skeuomorphic
            style={{ fontSize: '2rem', marginLeft: '1rem' }}
            color="pink"
            onClick={() => navigateTo('selectLink')}
          >
            <Icon icon="link" />
            <span style={{ marginLeft: '1rem' }}>Link</span>
          </Button>
        </div>
      </div>
      <input
        ref={FileInputRef}
        style={{ display: 'none' }}
        type="file"
        onChange={handleUpload}
      />
      {alertModalShown && (
        <AlertModal
          title="File is too large"
          content={`The file size is larger than your limit of ${
            maxSize / mb
          } MB`}
          onHide={() => setAlertModalShown(false)}
        />
      )}
    </ErrorBoundary>
  );

  function handleUpload(event) {
    const fileObj = event.target.files[0];
    if (fileObj.size / mb > maxSize) {
      return setAlertModalShown(true);
    }
    const { fileType } = getFileInfoFromFileName(fileObj.name);
    if (fileType === 'image') {
      const reader = new FileReader();
      const extension = fileObj.name.split('.').pop();
      reader.onload = (upload) => {
        const payload = upload.target.result;
        if (extension === 'gif') {
          onSetSubjectAttachment({
            file: fileObj,
            contentType: 'file',
            fileType,
            imageUrl: payload
          });
          onHide();
        } else {
          window.loadImage(
            payload,
            function (img) {
              const imageUrl = img.toDataURL(
                `image/${extension === 'png' ? 'png' : 'jpeg'}`
              );
              const dataUri = imageUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(dataUri, 'base64');
              const file = new File([buffer], fileObj.name);

              onSetSubjectAttachment({
                file,
                contentType: 'file',
                fileType,
                imageUrl
              });
              onHide();
            },
            { orientation: true, canvas: true }
          );
        }
      };
      reader.readAsDataURL(fileObj);
    } else {
      onSetSubjectAttachment({
        file: fileObj,
        contentType: 'file',
        fileType
      });
      onHide();
    }
    event.target.value = null;
  }
}
