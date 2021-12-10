import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import Loading from 'components/Loading';
import FileInfo from './FileInfo';
import { v1 as uuidv1 } from 'uuid';
import {
  exceedsCharLimit,
  finalizeEmoji,
  getFileInfoFromFileName
} from 'helpers/stringHelpers';
import LocalContext from '../../Context';

UploadModal.propTypes = {
  initialCaption: PropTypes.string,
  channelId: PropTypes.number,
  fileObj: PropTypes.object,
  onHide: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  recepientId: PropTypes.number,
  replyTarget: PropTypes.object,
  subjectId: PropTypes.number
};

function UploadModal({
  initialCaption = '',
  channelId,
  fileObj,
  onHide,
  onUpload,
  replyTarget,
  recepientId,
  subjectId
}) {
  const {
    onFileUpload,
    state: { isRespondingToSubject },
    actions: { onSubmitMessage },
    myState: { profilePicUrl, userId, username }
  } = useContext(LocalContext);
  const [caption, setCaption] = useState(initialCaption);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { fileType } = useMemo(
    () => getFileInfoFromFileName(fileObj.name),
    [fileObj.name]
  );

  useEffect(() => {
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (upload) => {
        const extension = fileObj.name.split('.').pop();
        const payload = upload.target.result;
        if (extension === 'gif') {
          setImageUrl(payload);
          setSelectedFile(fileObj);
        } else {
          window.loadImage(
            payload,
            function (img) {
              const image = img.toDataURL(
                `image/${extension === 'png' ? 'png' : 'jpeg'}`
              );
              setImageUrl(image);
              const dataUri = image.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(dataUri, 'base64');
              // eslint-disable-next-line no-undef
              const file = new File([buffer], fileObj.name);
              setSelectedFile(file);
            },
            { orientation: true, canvas: true }
          );
        }
      };
      reader.readAsDataURL(fileObj);
    } else {
      setSelectedFile(fileObj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captionExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'message',
        contentType: 'chat',
        text: caption
      }),
    [caption]
  );

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      const filePath = uuidv1();
      const messageId = uuidv1();
      onFileUpload({
        channelId,
        content: finalizeEmoji(caption),
        filePath,
        fileToUpload: selectedFile,
        userId,
        recepientId,
        messageId,
        targetMessageId: replyTarget?.id,
        subjectId: isRespondingToSubject ? subjectId : null
      });
      onSubmitMessage({
        messageId,
        message: {
          content: finalizeEmoji(caption),
          channelId,
          fileToUpload: selectedFile,
          filePath,
          fileName: selectedFile.name,
          profilePicUrl,
          userId,
          username
        },
        isRespondingToSubject,
        replyTarget
      });
      onUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    caption,
    channelId,
    isRespondingToSubject,
    onUpload,
    profilePicUrl,
    recepientId,
    replyTarget,
    selectedFile,
    subjectId,
    userId,
    username
  ]);

  return (
    <Modal closeWhenClickedOutside={false} onHide={onHide}>
      <header>Upload a file</header>
      <main>
        {fileObj ? (
          <FileInfo
            caption={caption}
            captionExceedsCharLimit={captionExceedsCharLimit}
            fileObj={fileObj}
            fileType={fileType}
            imageUrl={imageUrl}
            onCaptionChange={setCaption}
          />
        ) : (
          <Loading />
        )}
      </main>
      <footer>
        <Button transparent style={{ marginRight: '0.7rem' }} onClick={onHide}>
          Cancel
        </Button>
        <Button
          disabled={captionExceedsCharLimit || !selectedFile}
          color="blue"
          onClick={handleSubmit}
        >
          Upload
        </Button>
      </footer>
    </Modal>
  );
}

export default memo(UploadModal);
