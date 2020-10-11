import React, { useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import AlertModal from 'components/Modals/AlertModal';
import Icon from 'components/Icon';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import { mb } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { getFileInfoFromFileName } from 'helpers/stringHelpers';
import { useAppContext } from 'contexts';
import { v1 as uuidv1 } from 'uuid';

TakeScreenshot.propTypes = {
  attachment: PropTypes.object,
  fileUploadComplete: PropTypes.bool,
  fileUploadProgress: PropTypes.number,
  missionId: PropTypes.number,
  onSetMissionState: PropTypes.func
};

export default function TakeScreenshot({
  attachment,
  fileUploadComplete,
  fileUploadProgress,
  missionId,
  onSetMissionState
}) {
  const {
    requestHelpers: { uploadFile, uploadMissionAttempt }
  } = useAppContext();
  const { authLevel } = useMyState();
  const [alertModalShown, setAlertModalShown] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const FileInputRef = useRef(null);
  const filePathRef = useRef(null);
  const maxSize = useMemo(
    () =>
      authLevel > 3
        ? 5000 * mb
        : authLevel > 1
        ? 3000 * mb
        : authLevel === 1
        ? 1000 * mb
        : 300 * mb,
    [authLevel]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '3rem',
        fontSize: '1.7rem'
      }}
    >
      {uploadingFile ? (
        <FileUploadStatusIndicator
          style={{
            fontSize: '1.7rem',
            fontWeight: 'bold',
            marginTop: 0,
            paddingBottom: '1rem'
          }}
          fileName={attachment?.file?.name}
          onFileUpload={handleFileUpload}
          uploadComplete={fileUploadComplete}
          uploadProgress={fileUploadProgress}
        />
      ) : (
        <>
          <div style={{ marginBottom: '2rem', fontWeight: 'bold' }}>
            Follow the instructions below
          </div>
          <div>
            <b>1.</b> Take a screenshot and tap the button below to select the
            screenshot from your computer
          </div>
          {attachment?.preview && (
            <div style={{ marginTop: '1rem' }}>
              <img style={{ width: '100%' }} src={attachment?.preview} />
              <div style={{ marginTop: '1rem' }}>
                <b>2.</b>{' '}
                {`Make sure you've selected the correct file and then tap "Submit"`}
              </div>
            </div>
          )}
        </>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '3rem'
        }}
      >
        {!attachment?.preview && (
          <Button
            skeuomorphic
            style={{ fontSize: '2rem' }}
            onClick={() => FileInputRef.current.click()}
          >
            <Icon icon="image" />
            <span style={{ marginLeft: '1rem' }}>Select Screenshot</span>
          </Button>
        )}
        {attachment?.preview && (
          <Button
            color="darkBlue"
            skeuomorphic
            style={{ fontSize: '2rem' }}
            onClick={() => setUploadingFile(true)}
          >
            <Icon icon="upload" />
            <span style={{ marginLeft: '1rem' }}>Submit</span>
          </Button>
        )}
        <input
          ref={FileInputRef}
          style={{ display: 'none' }}
          type="file"
          accept="image/*"
          onChange={handleFileSelection}
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
      </div>
    </div>
  );

  function handleFileSelection(event) {
    const fileObj = event.target.files[0];
    if (fileObj.size / mb > maxSize) {
      return setAlertModalShown(true);
    }
    const { fileType } = getFileInfoFromFileName(fileObj.name);
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (upload) => {
        const payload = upload.target.result;
        window.loadImage(
          payload,
          function (img) {
            const imageUri = img.toDataURL('image/jpeg');
            const dataUri = imageUri.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(dataUri, 'base64');
            const file = new File([buffer], fileObj.name);
            onSetMissionState({
              missionId,
              newState: {
                attachment: {
                  ...attachment,
                  file,
                  preview: imageUri
                }
              }
            });
          },
          { orientation: true, canvas: true }
        );
      };
      reader.readAsDataURL(fileObj);
    }
    event.target.value = null;
  }

  async function handleFileUpload() {
    filePathRef.current = uuidv1();
    const uploadedFilePath = await uploadFile({
      context: 'mission',
      filePath: filePathRef.current,
      file: attachment.file,
      onUploadProgress: handleUploadProgress
    });
    onSetMissionState({
      missionId,
      newState: {
        fileUploadComplete: true
      }
    });
    filePathRef.current = null;
    const success = await uploadMissionAttempt({
      missionId,
      attempt: {
        fileName: attachment.file.name,
        fileSize: attachment.file.size,
        filePath: uploadedFilePath
      }
    });

    if (success) {
      onSetMissionState({
        missionId,
        newState: {
          myAttempt: { status: 'pending' }
        }
      });
    }

    function handleUploadProgress({ loaded, total }) {
      onSetMissionState({
        missionId,
        newState: {
          fileUploadProgress: loaded / total
        }
      });
    }
  }
}