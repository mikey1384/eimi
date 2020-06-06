import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import request from 'axios';
import Loading from 'components/Loading';
import ReactPlayer from 'react-player';
import Icon from 'components/Icon';
import URL from 'constants/URL';
import TwinkleVideo from './TwinkleVideo';
import { css } from 'emotion';
import {
  getFileInfoFromFileName,
  isValidYoutubeUrl,
  extractVideoIdFromTwinkleVideoUrl
} from 'helpers/stringHelpers';
import { Color, mobileMaxWidth } from 'constants/css';
import { useContentContext } from 'contexts';
import { useContentState } from 'helpers/hooks';

const API_URL = `${URL}/content`;

Embedly.propTypes = {
  contentId: PropTypes.number,
  contentType: PropTypes.string,
  imageWidth: PropTypes.string,
  imageHeight: PropTypes.string,
  imageMobileHeight: PropTypes.string,
  imageOnly: PropTypes.bool,
  loadingHeight: PropTypes.string,
  mobileLoadingHeight: PropTypes.string,
  noLink: PropTypes.bool,
  onHideAttachment: PropTypes.func,
  small: PropTypes.bool,
  style: PropTypes.object,
  userCanEditThis: PropTypes.bool,
  videoWidth: PropTypes.string,
  videoHeight: PropTypes.string
};

function Embedly({
  contentId,
  contentType = 'url',
  imageWidth,
  imageHeight = '100%',
  imageMobileHeight = '100%',
  imageOnly,
  loadingHeight = '100%',
  mobileLoadingHeight = '100%',
  noLink,
  onHideAttachment = () => {},
  small,
  style,
  userCanEditThis,
  videoWidth,
  videoHeight
}) {
  const translator = {
    actualDescription:
      contentType === 'url' ? 'actualDescription' : 'linkDescription',
    actualTitle: contentType === 'url' ? 'actualTitle' : 'linkTitle',
    siteUrl: contentType === 'url' ? 'siteUrl' : 'linkUrl',
    url: contentType === 'url' ? 'content' : 'embeddedUrl'
  };
  const {
    actions: {
      onSetActualDescription,
      onSetActualTitle,
      onSetPrevUrl,
      onSetSiteUrl,
      onSetThumbUrl,
      onSetVideoCurrentTime,
      onSetVideoStarted
    }
  } = useContentContext();
  const {
    currentTime = 0,
    description,
    prevUrl,
    thumbUrl,
    title,
    thumbLoaded,
    [translator.actualDescription]: actualDescription,
    [translator.actualTitle]: actualTitle,
    [translator.siteUrl]: siteUrl,
    [translator.url]: url
  } = useContentState({ contentType, contentId });

  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [twinkleVideoId, setTwinkleVideoId] = useState(false);
  const [timeAt, setTimeAt] = useState(0);
  const [startingPosition, setStartingPosition] = useState(0);
  const { notFound } = useContentState({
    contentId: Number(twinkleVideoId),
    contentType: 'video'
  });
  const isYouTube = useMemo(() => {
    return contentType === 'chat' && isValidYoutubeUrl(url);
  }, [contentType, url]);
  const YTPlayerRef = useRef(null);
  const mounted = useRef(true);
  const fallbackImage = '/img/link.png';
  const contentCss = useMemo(
    () => css`
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      color: ${Color.darkerGray()};
      position: relative;
      overflow: hidden;
      ${!small ? 'flex-direction: column;' : ''};
    `,
    [small]
  );

  useEffect(() => {
    mounted.current = true;
    if (isYouTube) {
      setStartingPosition(currentTime);
    }
    const extractedVideoId = extractVideoIdFromTwinkleVideoUrl(url);
    if (extractedVideoId && contentType === 'chat') {
      return setTwinkleVideoId(extractedVideoId);
    }
    if (
      !thumbUrl &&
      url &&
      (typeof siteUrl !== 'string' || (prevUrl && url !== prevUrl))
    ) {
      fetchUrlData();
    }
    onSetPrevUrl({ contentId, contentType, prevUrl: url, thumbUrl });
    async function fetchUrlData() {
      try {
        setLoading(true);
        const {
          data: { image, title, description, site }
        } = await request.put(`${API_URL}/embed`, {
          url,
          contentId,
          contentType
        });
        if (mounted.current) {
          onSetThumbUrl({
            contentId,
            contentType,
            thumbUrl: image.url.replace('http://', 'https://')
          });
          onSetActualDescription({ contentId, contentType, description });
          onSetActualTitle({ contentId, contentType, title });
          onSetSiteUrl({ contentId, contentType, siteUrl: site });
          setLoading(false);
        }
      } catch (error) {
        console.error(error.response || error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevUrl, url, thumbLoaded, thumbUrl]);

  const videoUrl = useMemo(
    () => `${url}${startingPosition > 0 ? `?t=${startingPosition}` : ''}`,
    [startingPosition, url]
  );

  useEffect(() => {
    setImageUrl(
      url && getFileInfoFromFileName(url)?.fileType === 'image'
        ? url
        : thumbUrl || fallbackImage
    );
  }, [thumbUrl, url]);

  useEffect(() => {
    return function setCurrentTimeBeforeUnmount() {
      if (timeAt > 0) {
        onSetVideoCurrentTime({
          contentType,
          contentId,
          currentTime: timeAt
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeAt]);

  useEffect(() => {
    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const InnerContent = useMemo(() => {
    return (
      <>
        {!imageUrl || loading ? (
          <Loading
            className={css`
              height: ${loadingHeight};
              @media (max-width: ${mobileMaxWidth}) {
                height: ${mobileLoadingHeight};
              }
            `}
          />
        ) : (
          <section
            className={css`
              position: relative;
              width: ${small ? '25%' : '100%'};
              height: ${imageHeight};
              &:after {
                content: '';
                display: block;
                padding-bottom: ${small ? '100%' : '60%'};
              }
              @media (max-width: ${mobileMaxWidth}) {
                height: ${imageMobileHeight};
              }
            `}
          >
            <img
              className={css`
                position: absolute;
                width: 100%;
                height: 100%;
                object-fit: ${contentType === 'chat' ? 'contain' : 'cover'};
              `}
              src={imageUrl}
              onError={handleImageLoadError}
              alt={title}
            />
          </section>
        )}
        {!imageOnly && (
          <section
            className={css`
              width: 100%;
              line-height: 1.5;
              padding: 1rem;
              ${contentType === 'chat' ? 'margin-bottom: 1rem;' : ''}
              ${small ? 'margin-left: 1rem;' : ''}
              ${small ? '' : 'margin-top: 1rem;'}
            `}
          >
            <h3
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {actualTitle || title}
            </h3>
            <p
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {actualDescription || description}
            </p>
            <p style={{ fontWeight: 'bold' }}>{siteUrl}</p>
          </section>
        )}
      </>
    );
    function handleImageLoadError() {
      setImageUrl(
        !thumbUrl || imageUrl === thumbUrl ? fallbackImage : thumbUrl
      );
    }
  }, [
    actualDescription,
    actualTitle,
    contentType,
    description,
    imageHeight,
    imageMobileHeight,
    imageOnly,
    imageUrl,
    loading,
    loadingHeight,
    mobileLoadingHeight,
    siteUrl,
    small,
    thumbUrl,
    title
  ]);

  return (
    <div style={{ position: 'relative', height: '100%', ...style }}>
      {contentType === 'chat' && userCanEditThis && !notFound && (
        <Icon
          style={{
            position: 'absolute',
            cursor: 'pointer',
            zIndex: 10
          }}
          onClick={() => onHideAttachment()}
          className={css`
            right: ${isYouTube || twinkleVideoId ? '1rem' : 'CALC(50% - 1rem)'};
            color: ${Color.darkGray()};
            font-size: 2rem;
            &:hover {
              color: ${Color.black()};
            }
            @media (max-width: ${mobileMaxWidth}) {
              right: 1rem;
            }
          `}
          icon="times"
        />
      )}
      <div
        style={{ height: '100%' }}
        className={css`
          width: ${imageWidth || (contentType === 'chat' ? '50%' : '100%')};
          position: relative;
          justify-content: ${contentType === 'chat' && imageOnly && 'flex-end'};
          display: flex;
          @media (max-width: ${mobileMaxWidth}) {
            width: 100%;
          }
        `}
      >
        <div
          className={css`
            width: 100%;
            height: 100%;
            > a {
              text-decoration: none;
            }
            h3 {
              font-size: ${contentType === 'chat' ? '1.4rem' : '1.9rem'};
            }
            p {
              font-size: ${contentType === 'chat' ? '1.2rem' : '1.5rem'};
              margin-top: 1rem;
            }
            @media (max-width: ${mobileMaxWidth}) {
              width: ${contentType === 'chat' ? '85%' : '100%'};
              h3 {
                font-size: ${contentType === 'chat' ? '1.3rem' : '1.7rem'};
              }
              p {
                font-size: ${contentType === 'chat' ? '1.1rem' : '1.3rem'};
              }
            }
          `}
        >
          {noLink ? (
            <div className={contentCss}>{InnerContent}</div>
          ) : twinkleVideoId ? (
            <TwinkleVideo
              imageOnly={imageOnly}
              onPlay={handlePlay}
              style={{
                width: videoWidth || '50vw',
                height: videoHeight || 'CALC(30vw + 3rem)'
              }}
              videoId={Number(twinkleVideoId)}
            />
          ) : isYouTube ? (
            <ReactPlayer
              ref={YTPlayerRef}
              width={videoWidth || '50vw'}
              height={videoHeight || '30vw'}
              url={videoUrl}
              controls
              onPlay={handlePlay}
              onProgress={handleVideoProgress}
            />
          ) : (
            <a
              className={contentCss}
              target="_blank"
              rel="noopener noreferrer"
              href={url}
            >
              {InnerContent}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  function handlePlay() {
    onSetVideoStarted({
      contentType,
      contentId,
      started: true
    });
  }

  function handleVideoProgress() {
    setTimeAt(YTPlayerRef.current.getCurrentTime());
  }
}

export default memo(Embedly);
