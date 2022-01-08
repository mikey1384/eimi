import React, { useEffect, useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import AlertModal from 'components/Modals/AlertModal';
import Icon from 'components/Icon';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import { mb, returnMaxUploadSize } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { getFileInfoFromFileName } from 'helpers/stringHelpers';
import { useAppContext, useMissionContext } from 'contexts';
import { v1 as uuidv1 } from 'uuid';
import { css } from '@emotion/css';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';

const BodyRef = document.scrollingElement || document.documentElement;

TakeScreenshot.propTypes = {
  attachment: PropTypes.object,
  fileUploadComplete: PropTypes.bool,
  fileUploadProgress: PropTypes.number,
  missionId: PropTypes.number,
  onSetMissionState: PropTypes.func,
  style: PropTypes.object
};

export default function TakeScreenshot({
  attachment,
  fileUploadComplete,
  fileUploadProgress,
  missionId,
  onSetMissionState,
  style
}) {
  const uploadFile = useAppContext((v) => v.requestHelpers.uploadFile);
  const uploadMissionAttempt = useAppContext(
    (v) => v.requestHelpers.uploadMissionAttempt
  );
  const onUpdateMissionAttempt = useMissionContext(
    (v) => v.actions.onUpdateMissionAttempt
  );
  const [screenshotTaken, setScreenshotTaken] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [buttonShown, setButtonShown] = useState(false);
  const { fileUploadLvl, username } = useMyState();
  const [alertModalShown, setAlertModalShown] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const FileInputRef = useRef(null);
  const maxSize = useMemo(
    () => returnMaxUploadSize(fileUploadLvl),
    [fileUploadLvl]
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setTimeout(() => {
      if (mounted.current) {
        setButtonShown(true);
      }
    }, 3200);
    return function onUnmount() {
      mounted.current = false;
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: '1.7rem',
        ...style
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
          uploadComplete={fileUploadComplete}
          uploadProgress={fileUploadProgress}
        />
      ) : (
        <>
          <div style={{ marginBottom: '2rem', fontWeight: 'bold' }}>
            Follow the instructions below
          </div>
          <div>
            <b>1.</b> Take a screenshot of{' '}
            <b style={{ color: Color.green() }}>
              this <Icon icon="arrow-down" />
            </b>
            <div
              className={css`
                font-size: 1.3rem;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.1rem;
                }
              `}
              style={{
                marginTop: '3rem',
                marginBottom: '2rem',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div
                className={css`
                  animation: fadeIn 3s;
                  @keyframes fadeIn {
                    0% {
                      opacity: 0;
                    }
                    100% {
                      opacity: 1;
                    }
                  }
                  border: 1px solid ${Color.borderGray()};
                  border-radius: ${borderRadius};
                  text-align: center;
                  padding: 1rem;
                  background: ${Color.ivory()};
                  font-size: 1.7rem;
                  @media (max-width: ${mobileMaxWidth}) {
                    font-size: 1.3rem;
                  }
                `}
                style={{
                  display: 'flex',
                  width: '75%',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <p
                  className={css`
                    font-weight: bold;
                    font-size: 3rem;
                    @media (max-width: ${mobileMaxWidth}) {
                      font-size: 2.5rem;
                    }
                  `}
                >
                  Screenshot this
                </p>
                <p style={{ marginTop: '1.5rem' }}>
                  <b>{username}</b> captured this screenshot on {returnNow()}
                </p>
              </div>
            </div>
          </div>
          {attachment?.preview && (
            <div style={{ marginTop: '1rem' }}>
              <img style={{ width: '100%' }} src={attachment?.preview} />
              <div style={{ marginTop: '1.5rem' }}>
                <b>3.</b>{' '}
                {`Make sure you've selected the correct file and then tap "Submit"`}
              </div>
            </div>
          )}
        </>
      )}
      {screenshotTaken ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2rem'
          }}
        >
          {!attachment?.preview && (
            <p>
              <b>2.</b> Press this{' '}
              <b style={{ color: Color.logoBlue() }}>button</b> and select the
              screenshot image file you have just taken
            </p>
          )}
          {!attachment?.preview && (
            <Button
              skeuomorphic
              color="logoBlue"
              style={{ fontSize: '2rem', marginTop: '1.5rem' }}
              onClick={() => FileInputRef.current.click()}
            >
              <Icon icon="image" />
              <span style={{ marginLeft: '1rem' }}>Select Screenshot</span>
            </Button>
          )}
          {attachment?.preview && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Button
                disabled={submitDisabled}
                color="darkBlue"
                skeuomorphic
                style={{ fontSize: '2rem' }}
                onClick={handleFileUpload}
              >
                <Icon icon="upload" />
                <span style={{ marginLeft: '1rem' }}>Submit</span>
              </Button>
              <Button
                color="darkerGray"
                skeuomorphic
                style={{ fontSize: '2rem', marginTop: '1rem' }}
                onClick={() =>
                  onSetMissionState({
                    missionId,
                    newState: {
                      attachment: null
                    }
                  })
                }
              >
                <span style={{ marginLeft: '1rem' }}>
                  I selected a wrong file
                </span>
              </Button>
            </div>
          )}
          <input
            ref={FileInputRef}
            style={{ display: 'none' }}
            type="file"
            accept="image/*"
            onChange={handleFileSelection}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {buttonShown && (
            <div
              className={css`
                margin-top: 1rem;
                width: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: fadeIn 3s;
                @keyframes fadeIn {
                  0% {
                    opacity: 0;
                  }
                  100% {
                    opacity: 1;
                  }
                }
              `}
            >
              <Button
                skeuomorphic
                color="logoBlue"
                onClick={() => setScreenshotTaken(true)}
              >
                I took the screenshot of that{' '}
                <Icon style={{ marginLeft: '0.7rem' }} icon="arrow-up" />
              </Button>
            </div>
          )}
          <div style={{ marginTop: '5rem' }}>
            <span>
              {`If you don't know what the word "screenshot" means, `}
              press the <b style={{ color: Color.brownOrange() }}>
                button
              </b>{' '}
              below
            </span>
            <Icon
              style={{ marginLeft: '1rem', color: Color.brownOrange() }}
              icon="arrow-down"
            />
          </div>
        </div>
      )}
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
  );

  function returnNow() {
    const now = new Date(Date.now());
    return now.toString();
  }

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
    setUploadingFile(true);
    const uploadedFilePath = await uploadFile({
      context: 'mission',
      filePath: uuidv1(),
      file: attachment.file,
      onUploadProgress: handleUploadProgress
    });
    if (mounted.current) {
      onSetMissionState({
        missionId,
        newState: {
          fileUploadComplete: true
        }
      });
    }
    const { success } = await uploadMissionAttempt({
      missionId,
      attempt: {
        fileName: attachment.file.name,
        fileSize: attachment.file.size,
        filePath: uploadedFilePath
      }
    });

    if (success) {
      if (mounted.current) {
        onSetMissionState({
          missionId,
          newState: {
            attachment: null,
            fileUploadComplete: false,
            fileUploadProgress: null
          }
        });
      }
      if (mounted.current) {
        onUpdateMissionAttempt({
          missionId,
          newState: {
            status: 'pending',
            tryingAgain: false
          }
        });
      }
      document.getElementById('App').scrollTop = 0;
      BodyRef.scrollTop = 0;
    }
    setSubmitDisabled(false);

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
