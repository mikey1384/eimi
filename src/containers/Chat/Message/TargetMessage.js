import React, { useContext, useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'components/Image';
import FileIcon from 'components/FileIcon';
import ImageModal from 'components/Modals/ImageModal';
import UsernameText from 'components/Texts/UsernameText';
import Spoiler from './Spoiler';
import Embedly from 'components/Embedly';
import ExtractedThumb from 'components/ExtractedThumb';
import LongText from 'components/Texts/LongText';
import { v1 as uuidv1 } from 'uuid';
import { unix } from 'moment';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import {
  extractVideoIdFromTwinkleVideoUrl,
  fetchURLFromText,
  getFileInfoFromFileName,
  isValidSpoiler
} from 'helpers/stringHelpers';
import { css } from '@emotion/css';
import { cloudFrontURL } from 'constants/defaultValues';
import LocalContext from '../Context';

TargetMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default function TargetMessage({ message }) {
  const {
    requests: { uploadThumb },
    actions: { onSetEmbeddedUrl }
  } = useContext(LocalContext);
  const [imageModalShown, setImageModalShown] = useState(false);

  useEffect(() => {
    if (fetchURLFromText(message.content)) {
      onSetEmbeddedUrl({
        contentId: message.id,
        contentType: 'chat',
        url: fetchURLFromText(message.content)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content, message.id]);

  const fileType = useMemo(() => {
    return message.fileName
      ? getFileInfoFromFileName(message.fileName)?.fileType
      : null;
  }, [message.fileName]);

  const src = useMemo(() => {
    if (!message.filePath) return '';
    return `${cloudFrontURL}/attachments/chat/${
      message.filePath
    }/${encodeURIComponent(message.fileName)}`;
  }, [message.fileName, message.filePath]);

  const embedlyShown = useMemo(() => {
    const extractedVideoId = extractVideoIdFromTwinkleVideoUrl(
      fetchURLFromText(message.content)
    );
    return (
      fileType !== 'video' &&
      fileType !== 'audio' &&
      (message.thumbUrl ||
        extractedVideoId ||
        fetchURLFromText(message.content)) &&
      !message.attachmentHidden
    );
  }, [fileType, message.attachmentHidden, message.content, message.thumbUrl]);

  const displayedTime = useMemo(
    () => unix(message?.timeStamp).format('lll'),
    [message?.timeStamp]
  );

  return (
    <div
      style={{
        marginTop: '0.5rem',
        marginBottom: '1rem',
        padding: '1rem',
        background: Color.wellGray(),
        display: 'flex',
        justifyContent: 'space-between',
        borderRadius
      }}
      className={css`
        width: 85%;
        @media (max-width: ${mobileMaxWidth}) {
          width: 100%;
        }
      `}
    >
      <div style={{ width: '100%' }}>
        <section style={{ fontWeight: 'bold' }}>
          <UsernameText
            color={Color.black()}
            user={{ id: message.userId, username: message.username }}
          />{' '}
          <small
            style={{
              fontWeight: 'normal',
              fontSize: '1rem',
              color: Color.darkGray()
            }}
          >
            {displayedTime}
          </small>
        </section>
        {isValidSpoiler(message.content) ? (
          <Spoiler content={message.content} />
        ) : (
          <LongText
            style={{ marginTop: '0.5rem' }}
            className={css`
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1.3rem;
              }
            `}
          >
            {message.content || message.fileName}
          </LongText>
        )}
      </div>
      {embedlyShown && (
        <div
          style={{
            width: '25%',
            display: 'flex',
            background: '#fff',
            justifyContent: 'center'
          }}
        >
          <Embedly
            imageOnly
            defaultThumbUrl={message.thumbUrl}
            contentId={message.id}
            contentType="chat"
            imageWidth="100%"
            videoWidth="100%"
            videoHeight="10rem"
            loadingHeight="10rem"
            mobileLoadingHeight="10rem"
            style={{
              width: '30rem',
              height: '10rem'
            }}
          />
        </div>
      )}
      {fileType && message.fileName && (
        <div
          className={css`
            color: ${Color.black()};
            cursor: pointer;
            height: 12rem;
            max-width: ${fileType === 'image' ? '12rem' : '15rem'};
            &:hover {
              color: #000;
            }
            @media (max-width: ${mobileMaxWidth}) {
              max-width: ${fileType === 'image' ? '7rem' : '9rem'};
              height: ${fileType === 'image' ? '7rem' : '11rem'};
            }
          `}
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={handleFileClick}
        >
          {fileType === 'image' ? (
            <Image imageUrl={src} />
          ) : fileType === 'video' ? (
            <ExtractedThumb
              src={src}
              style={{ width: '100%', height: '7rem' }}
              thumbUrl={message.thumbUrl}
              onThumbnailLoad={handleThumbnailLoad}
            />
          ) : (
            <FileIcon size="5x" fileType={fileType} />
          )}
          {fileType !== 'image' && (
            <div
              style={{
                marginTop: '0.5rem',
                textAlign: 'center'
              }}
              className={css`
                font-size: 1.3rem;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1rem;
                }
              `}
            >
              <p
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
                className={css`
                  min-width: 6.5rem;
                  @media (max-width: ${mobileMaxWidth}) {
                    min-width: 0;
                  }
                `}
              >
                {message.fileName}
              </p>
              <span>
                <b>Download</b>
              </span>
            </div>
          )}
        </div>
      )}
      {imageModalShown && (
        <ImageModal
          onHide={() => setImageModalShown(false)}
          fileName={message.fileName}
          src={src}
        />
      )}
    </div>
  );

  function handleFileClick() {
    if (fileType === 'image') {
      return setImageModalShown(true);
    }
    window.open(src);
  }

  function handleThumbnailLoad(thumb) {
    const dataUri = thumb.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(dataUri, 'base64');
    const file = new File([buffer], 'thumb.png');
    uploadThumb({
      contentType: 'chat',
      contentId: message.id,
      file,
      path: uuidv1()
    });
  }
}
