import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Loading from 'components/Loading';
import FullTextReveal from 'components/Texts/FullTextReveal';
import UsernameText from 'components/Texts/UsernameText';
import EditSubjectForm from './EditSubjectForm';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { isMobile, textIsOverflown } from 'helpers';
import { timeSince } from 'helpers/timeStampHelpers';
import { socket } from 'constants/io';
import { charLimit, defaultChatSubject } from 'constants/defaultValues';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from 'emotion';
import { useInterval, useMyState } from 'helpers/hooks';
import { useAppContext, useChatContext } from 'contexts';

ChannelHeader.propTypes = {
  onInputFocus: PropTypes.func.isRequired
};

export default function ChannelHeader({ onInputFocus }) {
  const {
    requestHelpers: {
      loadChatSubject,
      reloadChatSubject,
      searchChatSubject,
      uploadChatSubject
    }
  } = useAppContext();
  const { authLevel, profilePicId, userId, username } = useMyState();
  const {
    state: {
      subject: {
        content = defaultChatSubject,
        id: subjectId,
        uploader = {},
        reloader = {},
        timeStamp,
        reloadTimeStamp
      },
      subjectSearchResults
    },
    actions: {
      onClearSubjectSearchResults,
      onLoadChatSubject,
      onReloadChatSubject,
      onSearchChatSubject,
      onSetIsRespondingToSubject,
      onUploadChatSubject
    }
  } = useChatContext();
  const [onEdit, setOnEdit] = useState(false);
  const [onHover, setOnHover] = useState(false);
  const [timeSincePost, setTimeSincePost] = useState(timeSince(timeStamp));
  const [timeSinceReload, setTimeSinceReload] = useState(
    timeSince(reloadTimeStamp)
  );
  const HeaderLabelRef = useRef(null);

  useEffect(() => {
    if (!subjectId) {
      initialLoad();
    }
    async function initialLoad() {
      const data = await loadChatSubject();
      onLoadChatSubject(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeSincePost(timeSince(timeStamp));
    setTimeSinceReload(timeSince(reloadTimeStamp));
  }, [timeStamp, reloadTimeStamp]);

  useInterval(() => {
    setTimeSincePost(timeSince(timeStamp));
    setTimeSinceReload(timeSince(reloadTimeStamp));
  }, 1000);

  return (
    <ErrorBoundary
      className={css`
        position: relative;
        width: 100%;
        padding: 1rem;
        height: 7rem;
        display: flex;
        align-items: center;
        > section {
          position: relative;
          width: CALC(100% - ${authLevel > 0 ? '22rem' : '12rem'});
          @media (max-width: ${mobileMaxWidth}) {
            width: CALC(100% - ${authLevel > 0 ? '13rem' : '3rem'});
          }
        }
      `}
    >
      {subjectId ? (
        <>
          {!onEdit && (
            <>
              <section>
                <div style={{ width: '100%' }}>
                  <span
                    className={css`
                      width: 100%;
                      cursor: default;
                      color: ${Color.green()};
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      line-height: normal;
                      font-size: 2.2rem;
                      font-weight: bold;
                      display: block;
                      @media (max-width: ${mobileMaxWidth}) {
                        font-size: 1.6rem;
                      }
                    `}
                    onClick={() =>
                      setOnHover(
                        textIsOverflown(HeaderLabelRef.current)
                          ? !onHover
                          : false
                      )
                    }
                    onMouseOver={handleMouseOver}
                    onMouseLeave={() => setOnHover(false)}
                    ref={HeaderLabelRef}
                  >
                    {content}
                  </span>
                  <FullTextReveal text={content} show={onHover} />
                </div>
                {renderDetails()}
              </section>
              <div
                className={css`
                  position: absolute;
                  font-size: 1.3rem;
                  top: 1.3rem;
                  right: 1rem;
                  display: flex;
                  @media (max-width: ${mobileMaxWidth}) {
                    font-size: 1.2rem;
                  }
                `}
              >
                <Button
                  color="green"
                  filled
                  onClick={() => {
                    onSetIsRespondingToSubject(true);
                    onInputFocus();
                  }}
                >
                  <Icon flip="both" icon="reply" />
                  <span className="desktop" style={{ marginLeft: '0.5rem' }}>
                    Respond
                  </span>
                </Button>
                {authLevel > 0 && (
                  <Button
                    style={{ marginLeft: '1rem' }}
                    color="logoBlue"
                    filled
                    onClick={() => setOnEdit(true)}
                  >
                    Change
                  </Button>
                )}
              </div>
            </>
          )}
          {onEdit && (
            <EditSubjectForm
              autoFocus
              maxLength={charLimit.chat.subject}
              currentSubjectId={subjectId}
              title={content}
              onEditSubmit={onSubjectSubmit}
              onChange={handleSearchChatSubject}
              onClickOutSide={() => {
                setOnEdit(false);
                onClearSubjectSearchResults();
              }}
              reloadChatSubject={handleReloadChatSubject}
              searchResults={subjectSearchResults}
            />
          )}
        </>
      ) : (
        <Loading
          style={{
            color: Color.green()
          }}
          text="Loading Subject..."
        />
      )}
    </ErrorBoundary>
  );

  function handleMouseOver() {
    if (textIsOverflown(HeaderLabelRef.current) && !isMobile(navigator)) {
      setOnHover(true);
    }
  }

  async function handleReloadChatSubject(subjectId) {
    const { message, subject } = await reloadChatSubject(subjectId);
    onReloadChatSubject({ channelId: 2, message, subject });
    socket.emit('new_subject', { subject, message });
    setOnEdit(false);
    onClearSubjectSearchResults();
    if (!isMobile(navigator)) {
      onInputFocus();
    }
  }

  async function handleSearchChatSubject(text) {
    const data = await searchChatSubject(text);
    onSearchChatSubject(data);
  }

  async function onSubjectSubmit(text) {
    const content = `${text[0].toUpperCase()}${text.slice(1)}`;
    const data = await uploadChatSubject({ content: text, channelId: 2 });
    onUploadChatSubject({ ...data, channelId: 2 });
    const timeStamp = Math.floor(Date.now() / 1000);
    const subject = {
      id: data.subjectId,
      userId,
      username,
      reloadedBy: null,
      reloaderName: null,
      uploader: { id: userId, username },
      content,
      timeStamp
    };
    const message = {
      profilePicId,
      userId,
      username,
      content,
      isSubject: true,
      channelId: 2,
      timeStamp,
      isNewMessage: true
    };
    socket.emit('new_subject', { subject, message });
    setOnEdit(false);
    if (!isMobile(navigator)) {
      onInputFocus();
    }
  }

  function renderDetails() {
    const isReloaded = reloader && reloader.id;
    let posterString =
      'You can change this subject by clicking the "Change" button';
    if (uploader.id) {
      posterString = (
        <span>
          Started by <UsernameText user={uploader} />{' '}
          <span className="desktop">{timeSincePost}</span>
        </span>
      );
    }
    if (isReloaded) {
      posterString = (
        <span>
          Brought back by <UsernameText user={reloader} />{' '}
          <span className="desktop">{timeSinceReload}</span>{' '}
          <span className="desktop">
            (started by {<UsernameText user={uploader} />})
          </span>
        </span>
      );
    }
    return (
      <>
        {uploader ? (
          <small>{posterString}</small>
        ) : (
          <small>
            {
              'You can change the subject by clicking the "Change" button to the right'
            }
          </small>
        )}
      </>
    );
  }
}
