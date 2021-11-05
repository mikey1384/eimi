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
import { useAppContext, useHomeContext, useInputContext } from 'contexts';

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
    alreadyPosted,
    descriptionFieldShown,
    form,
    titleFieldShown,
    urlHelper,
    urlError,
    ytDetails
  } = content;
  const titleRef = useRef(form.title);
  const [title, setTitle] = useState(form.title);
  const descriptionRef = useRef(form.description);
  const [description, setDescription] = useState(form.description);
  const urlRef = useRef(form.url);
  const [url, setUrl] = useState(form.url);
  const [submitting, setSubmitting] = useState(false);
  const UrlFieldRef = useRef(null);
  const checkContentExistsTimerRef = useRef(null);
  const showHelperMessageTimerRef = useRef(null);

  const loadingYTDetails = useMemo(() => {
    return form.isVideo && !ytDetails;
  }, [form.isVideo, ytDetails]);

  const descriptionExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'description',
        contentType: form.isVideo ? 'video' : 'url',
        text: description
      }),
    [description, form.isVideo]
  );

  const titleExceedsCharLimit = useMemo(
    () =>
      exceedsCharLimit({
        inputType: 'title',
        contentType: form.isVideo ? 'video' : 'url',
        text: title
      }),
    [form.isVideo, title]
  );

  const errorInUrlField = useMemo(() => {
    if (urlError) return { borderColor: 'red', color: 'red' };
    return exceedsCharLimit({
      inputType: 'url',
      contentType: form.isVideo ? 'video' : 'url',
      text: url
    })?.style;
  }, [form.isVideo, url, urlError]);

  const buttonDisabled = useMemo(() => {
    if (stringIsEmpty(url) || stringIsEmpty(title)) return true;
    if (errorInUrlField) return true;
    if (titleExceedsCharLimit) return true;
    if (descriptionExceedsCharLimit) return true;
    return false;
  }, [
    descriptionExceedsCharLimit,
    errorInUrlField,
    title,
    titleExceedsCharLimit,
    url
  ]);

  const rewardLevelDescription = useMemo(() => {
    switch (form.rewardLevel) {
      case 3:
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
        return (
          <>
            This video is{' '}
            <span style={{ color: Color.green() }}>educational</span> and good
            for English listening
          </>
        );
      case 5:
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
      onSetContentDescription(descriptionRef.current);
      onSetContentTitle(titleRef.current);
      onSetContentUrl(urlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary className={PanelStyle}>
      <p>Share interesting videos or webpages</p>
      {urlError && (
        <Banner color="pink" style={{ marginBottom: '1rem' }}>
          {urlError}
        </Banner>
      )}
      <Input
        inputRef={UrlFieldRef}
        style={errorInUrlField}
        value={url}
        onChange={onUrlFieldChange}
        placeholder="Copy and paste a URL address here"
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
        label={'YouTube Video:'}
        onClick={() => {
          onSetContentIsVideo(!form.isVideo);
          onSetContentUrlError(urlError);
        }}
        style={{ marginTop: '1rem' }}
        checked={form.isVideo}
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
      {loadingYTDetails ? (
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
                  placeholder="Enter Title Here"
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
                  placeholder="Enter Description (Optional, you don't need to write this)"
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
          {!buttonDisabled && !urlHelper && form.isVideo && canEditRewardLevel && (
            <div style={{ marginTop: '1rem' }}>
              {rewardLevelDescription && (
                <div style={{ fontSize: '1.7rem', fontWeight: 'bold' }}>
                  {rewardLevelDescription}
                </div>
              )}
              <div style={{ fontSize: '1.5rem' }}>
                For every star you add, the amount of XP viewers earn per minute
                rises.
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
    if (form.isVideo && !isValidYoutubeUrl(url)) {
      urlError = 'That is not a valid YouTube url';
    }
    if (urlError) {
      onSetContentUrlError(urlError);
      UrlFieldRef.current.focus();
      return scrollElementToCenter(UrlFieldRef.current);
    }
    setSubmitting(true);
    try {
      const data = await uploadContent({
        ...form,
        url,
        title: finalizeEmoji(title),
        description: finalizeEmoji(description),
        ytDetails: form.isVideo ? ytDetails : null
      });
      if (data) {
        onResetContentInput();
        handleSetTitle('');
        handleSetDescription('');
        handleSetUrl('');
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

  function onUrlFieldChange(text) {
    onSetYouTubeVideoDetails(null);
    const urlIsValid = isValidUrl(text);
    onSetContentAlreadyPosted(false);
    handleSetUrl(text);
    onSetContentIsVideo(isValidYoutubeUrl(text));
    onSetContentTitleFieldShown(urlIsValid);
    onSetContentDescriptionFieldShown(urlIsValid);
    onSetContentUrlError('');
    onSetContentUrlHelper('');
    if (urlIsValid) {
      clearTimeout(checkContentExistsTimerRef.current);
      checkContentExistsTimerRef.current = setTimeout(
        () => handleCheckUrl(text),
        300
      );
    }
    clearTimeout(showHelperMessageTimerRef.current);
    showHelperMessageTimerRef.current = setTimeout(() => {
      onSetContentUrlHelper(
        urlIsValid || stringIsEmpty(text)
          ? ''
          : `A URL is a website's internet address. Twinkle Website's URL is <a href="https://www.twin-kle.com" target="_blank">www.twin-kle.com</a>. You can find a webpage's URL at the <b>top area of your browser</b>. Copy a URL you want to share and paste it to the box above.`
      );
      const regex = /\b(http[s]?(www\.)?|ftp:\/\/(www\.)?|www\.){1}/gi;
      handleSetTitle(
        !urlIsValid &&
          !stringIsEmpty(text) &&
          text.length > 3 &&
          !regex.test(text)
          ? text
          : title
      );
      onSetContentTitleFieldShown(!stringIsEmpty(text));
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
      onSetYouTubeVideoDetails(details);
    }
    return onSetContentAlreadyPosted(exists ? content : false);
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
