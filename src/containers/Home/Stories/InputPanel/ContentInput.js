import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import Textarea from 'components/Texts/Textarea';
import Button from 'components/Button';
import Input from 'components/Texts/Input';
import Banner from 'components/Banner';
import RewardLevelForm from 'components/Forms/RewardLevelForm';
import Link from 'components/Link';
import Checkbox from 'components/Checkbox';
import ErrorBoundary from 'components/ErrorBoundary';
import Loading from 'components/Loading';
import { PanelStyle } from './Styles';
import { Color } from 'constants/css';
import { css } from '@emotion/css';
import { scrollElementToCenter } from 'helpers';
import {
  exceedsCharLimit,
  isValidUrl,
  isValidYoutubeUrl,
  stringIsEmpty,
  addEmoji,
  finalizeEmoji
} from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import { useAppContext, useHomeContext, useInputContext } from 'contexts';
import localize from 'constants/localize';

const enterDescriptionOptionalLabel = localize('enterDescriptionOptional');
const forEveryStarYouAddLabel = localize('forEveryStarYouAdd');
const enterTitleHereLabel = localize('enterTitleHere');
const postContentLabel = localize('postContent');
const copyAndPasteUrlLabel = localize('copyAndPasteUrl');
const youtubeVideoLabel = localize('youtubeVideo');

function ContentInput() {
  const BodyRef = useRef(document.scrollingElement || document.documentElement);
  const {
    requestHelpers: { checkContentUrl, uploadContent }
  } = useAppContext();
  const { canEditRewardLevel, banned } = useMyState();
  const {
    actions: { onLoadNewFeeds }
  } = useHomeContext();
  const {
    state: { content },
    actions: {
      onResetContentInput,
      onSetContentAlreadyPosted,
      onSetContentIsVideo,
      onSetContentDescription,
      onSetContentDescriptionFieldShown,
      onSetContentRewardLevel,
      onSetContentTitle,
      onSetContentTitleFieldShown,
      onSetContentUrl,
      onSetContentUrlError,
      onSetContentUrlHelper,
      onSetYouTubeVideoDetails
    }
  } = useInputContext();
  const {
    alreadyPosted: prevAlreadyPosted,
    descriptionFieldShown: prevDescriptionFieldShown,
    form,
    titleFieldShown: prevTitleFieldShown,
    urlHelper: prevUrlHelper,
    urlError: prevUrlError,
    ytDetails
  } = content;
  const alreadyPostedRef = useRef(prevAlreadyPosted);
  const [alreadyPosted, setAlreadyPosted] = useState(prevAlreadyPosted);
  const titleRef = useRef(form.title);
  const contentIsVideoRef = useRef(form.isVideo);
  const [contentIsVideo, setContentIsVideo] = useState(form.isVideo);
  const [title, setTitle] = useState(form.title);
  const descriptionRef = useRef(form.description);
  const [description, setDescription] = useState(form.description);
  const urlRef = useRef(form.url);
  const [url, setUrl] = useState(form.url);
  const descriptionFieldShownRef = useRef(prevDescriptionFieldShown);
  const [descriptionFieldShown, setDescriptionFieldShown] = useState(
    prevDescriptionFieldShown
  );
  const titleFieldShownRef = useRef(prevTitleFieldShown);
  const [titleFieldShown, setTitleFieldShown] = useState(prevTitleFieldShown);
  const urlErrorRef = useRef(prevUrlError);
  const [urlError, setUrlError] = useState(prevUrlError);
  const youTubeVideoDetailsRef = useRef(ytDetails);
  const [youTubeVideoDetails, setYouTubeVideoDetails] = useState(ytDetails);
  const [submitting, setSubmitting] = useState(false);
  const urlHelperRef = useRef(prevUrlHelper);
  const [urlHelper, setUrlHelper] = useState(prevUrlHelper);
  const UrlFieldRef = useRef(null);
  const checkContentExistsTimerRef = useRef(null);
  const showHelperMessageTimerRef = useRef(null);

  const loadingYTDetails = useMemo(() => {
    return contentIsVideo && !youTubeVideoDetails && !urlError;
  }, [contentIsVideo, urlError, youTubeVideoDetails]);

  useEffect(() => {
    if (contentIsVideo && !isValidYoutubeUrl(url)) {
      setUrlError('That is not a valid YouTube url');
    }
  }, [contentIsVideo, url]);

  const descriptionExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'description',
        contentType: contentIsVideo ? 'video' : 'url',
        text: description
      }),
    [description, contentIsVideo]
  );

  const titleExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'title',
        contentType: contentIsVideo ? 'video' : 'url',
        text: title
      }),
    [contentIsVideo, title]
  );

  const urlExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'url',
        contentType: contentIsVideo ? 'video' : 'url',
        text: url
      }),
    [contentIsVideo, url]
  );

  const buttonDisabled = useMemo(() => {
    if (stringIsEmpty(url) || stringIsEmpty(title)) return true;
    if (urlError || urlExceedsCharLimit) return true;
    if (titleExceedsCharLimit) return true;
    if (descriptionExceedsCharLimit) return true;
    return false;
  }, [
    descriptionExceedsCharLimit,
    title,
    titleExceedsCharLimit,
    url,
    urlError,
    urlExceedsCharLimit
  ]);

  const rewardLevelDescription = useMemo(() => {
    switch (form.rewardLevel) {
      case 3:
        if (SELECTED_LANGUAGE === 'kr') {
          return (
            <>
              이 동영상은{' '}
              <span style={{ color: Color.pink() }}>흥미 위주의 콘텐츠</span>
              이지만 영어 듣기에 도움이 됩니다
            </>
          );
        }
        return (
          <>
            This video is{' '}
            <span style={{ color: Color.pink() }}>
              purely for entertainment
            </span>
            , but {`it's`} good for English listening
          </>
        );
      case 4:
        if (SELECTED_LANGUAGE === 'kr') {
          return (
            <>
              이 동영상은{' '}
              <span style={{ color: Color.green() }}>교육적이며</span> 영어
              듣기에 도움이 됩니다
            </>
          );
        }
        return (
          <>
            This video is{' '}
            <span style={{ color: Color.green() }}>educational</span> and good
            for English listening
          </>
        );
      case 5:
        if (SELECTED_LANGUAGE === 'kr') {
          return (
            <>
              이 동영상은{' '}
              <span style={{ color: Color.green() }}>교육적이고</span>, 영어
              듣기에 도움이 되며, 유저들이 꼭 봐야할 콘텐츠입니다
            </>
          );
        }
        return (
          <>
            This video is{' '}
            <span style={{ color: Color.green() }}>educational</span>, good for
            English listening, and I want every single user to watch it
          </>
        );
      default:
        return '';
    }
  }, [form.rewardLevel]);

  useEffect(() => {
    return function saveFormBeforeUnmount() {
      onSetContentAlreadyPosted(alreadyPostedRef.current);
      onSetContentIsVideo(contentIsVideoRef.current);
      onSetContentDescription(descriptionRef.current);
      onSetContentTitle(titleRef.current);
      onSetContentUrl(urlRef.current);
      onSetContentTitleFieldShown(titleFieldShownRef.current);
      onSetContentDescriptionFieldShown(descriptionFieldShownRef.current);
      onSetContentUrlError(urlErrorRef.current);
      onSetContentUrlHelper(urlHelperRef.current);
      onSetYouTubeVideoDetails(youTubeVideoDetailsRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary className={PanelStyle}>
      <p>{postContentLabel}</p>
      {urlError && (
        <Banner color="pink" style={{ marginBottom: '1rem' }}>
          {urlError}
        </Banner>
      )}
      <Input
        inputRef={UrlFieldRef}
        hasError={!!urlError}
        style={urlExceedsCharLimit?.style || {}}
        value={url}
        onChange={handleUrlFieldChange}
        placeholder={copyAndPasteUrlLabel}
      />
      {alreadyPosted && (
        <div style={{ fontSize: '1.6rem', marginTop: '0.5rem' }}>
          This content has{' '}
          <Link
            style={{ fontWeight: 'bold', color: Color.rose() }}
            to={`/${alreadyPosted.contentType === 'url' ? 'link' : 'video'}s/${
              alreadyPosted.id
            }`}
          >
            already been posted before
          </Link>
        </div>
      )}
      <Checkbox
        label={`${youtubeVideoLabel}:`}
        onClick={() => {
          setUrlError('');
          handleSetContentIsVideo(!contentIsVideo);
        }}
        style={{ marginTop: '1rem' }}
        checked={contentIsVideo}
      />
      {!stringIsEmpty(urlHelper) && (
        <span
          style={{
            fontSize: '1.7rem',
            marginTop: '1rem',
            display: 'block'
          }}
          className={css`
            > a {
              font-weight: bold;
            }
          `}
          dangerouslySetInnerHTML={{
            __html: urlHelper
          }}
        />
      )}
      {loadingYTDetails && !stringIsEmpty(url) ? (
        <Loading />
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="unselectable" style={{ position: 'relative' }}>
            {titleFieldShown && (
              <>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '2rem'
                  }}
                >
                  Title:
                </span>
                <Input
                  value={title}
                  onChange={handleSetTitle}
                  placeholder={`${enterTitleHereLabel}...`}
                  onKeyUp={(event) => {
                    if (event.key === ' ') {
                      handleSetTitle(addEmoji(event.target.value));
                    }
                  }}
                  style={{
                    ...(titleExceedsCharLimit?.style || {})
                  }}
                />
                {titleExceedsCharLimit && (
                  <small style={{ color: 'red' }}>
                    {titleExceedsCharLimit.message}
                  </small>
                )}
              </>
            )}
            {descriptionFieldShown && (
              <>
                <Textarea
                  value={description}
                  minRows={4}
                  placeholder={enterDescriptionOptionalLabel}
                  onChange={(event) => handleSetDescription(event.target.value)}
                  onKeyUp={(event) => {
                    if (event.key === ' ') {
                      handleSetDescription(addEmoji(event.target.value));
                    }
                  }}
                  style={{
                    marginTop: '1rem',
                    ...(descriptionExceedsCharLimit?.style || {})
                  }}
                />
                {descriptionExceedsCharLimit && (
                  <small style={{ color: 'red' }}>
                    {descriptionExceedsCharLimit?.message}
                  </small>
                )}
              </>
            )}
          </div>
          {!buttonDisabled &&
            !urlHelper &&
            contentIsVideo &&
            canEditRewardLevel && (
              <div style={{ marginTop: '1rem' }}>
                {rewardLevelDescription && (
                  <div style={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
                    {rewardLevelDescription}
                  </div>
                )}
                <div style={{ fontSize: '1.5rem' }}>
                  {forEveryStarYouAddLabel}
                </div>
                <RewardLevelForm
                  themed
                  isFromContentInput
                  alreadyPosted={!!alreadyPosted.id}
                  style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: '1rem',
                    fontSize: '3rem'
                  }}
                  rewardLevel={form.rewardLevel}
                  onSetRewardLevel={onSetContentRewardLevel}
                />
              </div>
            )}
          {descriptionFieldShown && (
            <div className="button-container">
              <Button
                type="submit"
                filled
                color="green"
                style={{ marginTop: '1rem' }}
                disabled={submitting || buttonDisabled}
                onClick={onSubmit}
              >
                Share!
              </Button>
            </div>
          )}
        </div>
      )}
    </ErrorBoundary>
  );

  async function onSubmit(event) {
    if (banned?.posting) {
      return;
    }
    let urlError;
    event.preventDefault();
    if (!isValidUrl(url)) urlError = 'That is not a valid url';
    if (contentIsVideo && !isValidYoutubeUrl(url)) {
      urlError = 'That is not a valid YouTube url';
    }
    if (urlError) {
      handleSetContentUrlError(urlError);
      UrlFieldRef.current.focus();
      return scrollElementToCenter(UrlFieldRef.current);
    }
    setSubmitting(true);
    try {
      const data = await uploadContent({
        isVideo: contentIsVideo,
        url,
        rewardLevel: form.rewardLevel,
        title: finalizeEmoji(title),
        description: finalizeEmoji(description),
        ytDetails: contentIsVideo ? youTubeVideoDetails : null
      });
      if (data) {
        onResetContentInput();
        handleSetTitle('');
        handleSetDescription('');
        handleSetUrl('');
        handleSetContentAlreadyPosted(false);
        handleSetContentIsVideo(false);
        handleSetYouTubeVideoDetails(null);
        handleSetContentTitleFieldShown(false);
        handleSetContentUrlError('');
        handleSetContentUrlHelper('');
        handleSetContentDescriptionFieldShown(false);
        onLoadNewFeeds([data]);
        document.getElementById('App').scrollTop = 0;
        BodyRef.current.scrollTop = 0;
      }
      setSubmitting(false);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  }

  function handleUrlFieldChange(text) {
    handleSetYouTubeVideoDetails(null);
    const urlIsValid = isValidUrl(text);
    handleSetContentAlreadyPosted(false);
    handleSetUrl(text);
    const isYouTubeVideo = isValidYoutubeUrl(text);
    handleSetContentIsVideo(isYouTubeVideo);
    handleSetContentTitleFieldShown(urlIsValid);
    handleSetContentDescriptionFieldShown(urlIsValid);
    handleSetContentUrlError('');
    handleSetContentUrlHelper('');
    if (urlIsValid) {
      clearTimeout(checkContentExistsTimerRef.current);
      checkContentExistsTimerRef.current = setTimeout(
        () => handleCheckUrl(text),
        300
      );
    }
    clearTimeout(showHelperMessageTimerRef.current);
    showHelperMessageTimerRef.current = setTimeout(() => {
      handleSetContentUrlHelper(
        urlIsValid || stringIsEmpty(text)
          ? ''
          : `A URL is a website's internet address. Twinkle Website's URL is <a href="https://www.twin-kle.com" target="_blank">www.twin-kle.com</a>. You can find a webpage's URL at the <b>top area of your browser</b>. Copy a URL you want to share and paste it to the box above.`
      );
      handleSetTitle(
        !urlIsValid && !stringIsEmpty(text) && text.length > 3 ? text : title
      );
      handleSetContentTitleFieldShown(!stringIsEmpty(text));
    }, 300);
  }

  async function handleCheckUrl(url) {
    const isVideo = isValidYoutubeUrl(url);
    const {
      exists,
      content,
      ytDetails: details
    } = await checkContentUrl({
      url,
      contentType: isVideo ? 'video' : 'url'
    });
    if (details) {
      if (!stringIsEmpty(details.ytTitle)) {
        handleSetTitle(details.ytTitle);
      }
      handleSetYouTubeVideoDetails(details);
    }
    return handleSetContentAlreadyPosted(exists ? content : false);
  }

  function handleSetContentAlreadyPosted(content) {
    setAlreadyPosted(content);
    alreadyPostedRef.current = content;
  }

  function handleSetContentIsVideo(isVideo) {
    setContentIsVideo(isVideo);
    contentIsVideoRef.current = isVideo;
  }

  function handleSetContentTitleFieldShown(shown) {
    setTitleFieldShown(shown);
    titleFieldShownRef.current = shown;
  }

  function handleSetContentDescriptionFieldShown(shown) {
    setDescriptionFieldShown(shown);
    descriptionFieldShownRef.current = shown;
  }

  function handleSetContentUrlError(error) {
    setUrlError(error);
    urlErrorRef.current = error;
  }

  function handleSetContentUrlHelper(helper) {
    setUrlHelper(helper);
    urlHelperRef.current = helper;
  }

  function handleSetYouTubeVideoDetails(details) {
    setYouTubeVideoDetails(details);
    youTubeVideoDetailsRef.current = details;
  }

  function handleSetTitle(text) {
    setTitle(text);
    titleRef.current = text;
  }

  function handleSetDescription(text) {
    setDescription(text);
    descriptionRef.current = text;
  }

  function handleSetUrl(text) {
    setUrl(text);
    urlRef.current = text;
  }
}

export default memo(ContentInput);
