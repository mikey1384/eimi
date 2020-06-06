import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Context from './Context';
import ErrorBoundary from 'components/ErrorBoundary';
import Heading from './Heading';
import Loading from 'components/Loading';
import ContentListItem from 'components/ContentListItem';
import Body from './Body';
import TargetContent from './TargetContent';
import Embedly from 'components/Embedly';
import Profile from './Profile';
import { css } from 'emotion';
import { Color, borderRadius, mobileMaxWidth } from 'constants/css';
import { container } from './Styles';
import { useContentState, useLazyLoad } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { useHistory } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

ContentPanel.propTypes = {
  autoExpand: PropTypes.bool,
  commentsLoadLimit: PropTypes.number,
  contentId: PropTypes.number.isRequired,
  contentType: PropTypes.string.isRequired,
  numPreviewComments: PropTypes.number,
  style: PropTypes.object
};

export default function ContentPanel({
  autoExpand,
  commentsLoadLimit,
  contentId,
  contentType,
  numPreviewComments = 0,
  style = {}
}) {
  const [ComponentRef, inView] = useInView({
    threshold: 0
  });
  const ContainerRef = useRef(null);
  const PanelRef = useRef(null);
  const history = useHistory();
  const {
    requestHelpers: { loadContent }
  } = useAppContext();
  const {
    actions: {
      onAddTags,
      onAddTagToContents,
      onAttachStar,
      onChangeSpoilerStatus,
      onDeleteComment,
      onDeleteContent,
      onEditComment,
      onEditContent,
      onEditRewardComment,
      onInitContent,
      onLikeContent,
      onLoadComments,
      onLoadMoreComments,
      onLoadMoreReplies,
      onLoadRepliesOfReply,
      onLoadTags,
      onSetByUserStatus,
      onSetCommentsShown,
      onSetPlaceholderHeight,
      onSetRewardLevel,
      onSetVisible,
      onShowTCReplyInput,
      onUploadTargetComment,
      onUploadComment,
      onUploadReply
    }
  } = useContentContext();

  const contentState = useContentState({ contentType, contentId });
  const {
    commentId,
    commentsShown,
    loaded,
    placeholderHeight: previousPlaceholderHeight,
    rootObj,
    rootType,
    started,
    targetObj,
    visible: previousVisible,
    rootId
  } = contentState;
  const [placeholderHeight, setPlaceholderHeight] = useState(
    previousPlaceholderHeight
  );
  const [visible, setVisible] = useState(previousVisible);
  const visibleRef = useRef(null);
  useLazyLoad({
    PanelRef,
    inView,
    onSetPlaceholderHeight: setPlaceholderHeight,
    onSetVisible: (visible) => {
      setVisible(visible);
      visibleRef.current = visible;
    },
    delay: 1000
  });
  const [videoShown, setVideoShown] = useState(false);
  const mounted = useRef(true);
  const loading = useRef(false);
  const inputAtBottom = contentType === 'comment';
  const heightNotSet = !previousPlaceholderHeight && !placeholderHeight;

  const { started: rootStarted } = useContentState({
    contentType: rootType,
    contentId: rootId
  });

  useEffect(() => {
    mounted.current = true;
    const container = ContainerRef.current;
    return function cleanUp() {
      onSetPlaceholderHeight({
        contentType,
        contentId,
        height: container?.clientHeight
      });
      onSetVisible({
        contentId,
        contentType,
        visible: visibleRef.current
      });
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded && !loading.current && contentId) {
      onMount();
    }
    async function onMount() {
      loading.current = true;
      const data = await loadContent({ contentId, contentType });
      if (mounted.current) {
        onInitContent({
          ...data,
          feedId: contentState.feedId
        });
        if (data.rootObj) {
          onInitContent({
            contentId: data.rootId,
            contentType: data.rootType,
            ...data.rootObj
          });
        }
        loading.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const contentShown = useMemo(
    () =>
      !loaded || heightNotSet || visible || inView || started || rootStarted,
    [heightNotSet, inView, loaded, rootStarted, started, visible]
  );

  return (
    <ErrorBoundary>
      <Context.Provider
        value={{
          commentsLoadLimit,
          onAddTags,
          onAddTagToContents,
          onAttachStar,
          onByUserStatusChange: onSetByUserStatus,
          onCommentSubmit: onUploadComment,
          onDeleteComment,
          onDeleteContent,
          onEditComment,
          onEditContent,
          onEditRewardComment,
          onLoadComments,
          onLikeContent,
          onLoadMoreComments,
          onLoadMoreReplies,
          onLoadTags,
          onLoadRepliesOfReply,
          onReplySubmit: onUploadReply,
          onSetCommentsShown,
          onSetRewardLevel,
          onUploadTargetComment
        }}
      >
        {!contentState.deleted ? (
          <div ref={ComponentRef}>
            <div
              ref={ContainerRef}
              style={{
                width: '100%',
                margin: '1rem 0 1rem 0',
                height: contentShown ? 'auto' : placeholderHeight || '15rem'
              }}
            >
              {contentShown && (
                <div
                  ref={PanelRef}
                  style={{
                    height: !loaded && '15rem',
                    position: 'relative',
                    ...style
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 3
                    }}
                    className={container}
                  >
                    {!loaded && <Loading />}
                    {loaded && (
                      <>
                        <Heading
                          contentObj={contentState}
                          action={
                            commentId
                              ? targetObj.comment.notFound
                                ? 'replied on'
                                : 'replied to'
                              : rootType === 'subject'
                              ? 'responded to'
                              : rootType === 'user'
                              ? 'left a message to'
                              : 'commented on'
                          }
                          onPlayVideoClick={() => setVideoShown(true)}
                          attachedVideoShown={videoShown}
                        />
                        <div className="body">
                          <Body
                            autoExpand={autoExpand}
                            commentsShown={commentsShown}
                            contentObj={contentState}
                            inputAtBottom={inputAtBottom}
                            attachedVideoShown={videoShown}
                            numPreviewComments={numPreviewComments}
                            onChangeSpoilerStatus={onChangeSpoilerStatus}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {loaded && targetObj?.comment && (
                    <TargetContent
                      style={{
                        position: 'relative',
                        zIndex: 2
                      }}
                      targetObj={targetObj}
                      rootObj={rootObj}
                      rootType={contentState.rootType}
                      contentId={contentId}
                      contentType={contentType}
                      onShowTCReplyInput={onShowTCReplyInput}
                    />
                  )}
                  {contentState.loaded && targetObj?.subject && (
                    <div>
                      <ContentListItem
                        comments={contentState.childComments}
                        style={{
                          zIndex: 1,
                          position: 'relative'
                        }}
                        expandable
                        onClick={() =>
                          history.push(`/subjects/${targetObj.subject.id}`)
                        }
                        contentObj={targetObj.subject}
                        onChangeSpoilerStatus={onChangeSpoilerStatus}
                      />
                    </div>
                  )}
                  {contentType === 'comment' &&
                    contentState.rootType === 'video' && (
                      <ContentListItem
                        style={{
                          position: 'relative'
                        }}
                        expandable
                        onClick={() => history.push(`/videos/${rootObj.id}`)}
                        contentObj={rootObj}
                      />
                    )}
                  {(contentType === 'comment' || contentType === 'subject') &&
                    rootType === 'url' && (
                      <div
                        className={css`
                          padding: 1rem;
                          background: ${Color.whiteGray()};
                          border: 1px solid ${Color.borderGray()};
                          border-radius: ${borderRadius};
                          margin-top: -1rem;
                          transition: background 0.5s;
                          &:hover {
                            background: #fff;
                          }
                          @media (max-width: ${mobileMaxWidth}) {
                            margin-top: -0.5rem;
                            border-left: 0;
                            border-right: 0;
                          }
                        `}
                      >
                        <Embedly small contentId={contentState.rootId} />
                      </div>
                    )}
                  {contentType === 'comment' &&
                    contentState.rootType === 'user' && (
                      <div
                        className={css`
                          cursor: pointer;
                          background: ${Color.whiteGray()};
                          border: 1px solid ${Color.borderGray()};
                          border-radius: ${borderRadius};
                          margin-top: -1rem;
                          transition: background 0.5s;
                          padding-bottom: 1rem;
                          &:hover {
                            background: #fff;
                          }
                          @media (max-width: ${mobileMaxWidth}) {
                            border-left: 0;
                            border-right: 0;
                            margin-top: -0.5rem;
                          }
                        `}
                        onClick={() =>
                          history.push(`/users/${rootObj.username}`)
                        }
                      >
                        <Profile profile={rootObj} />
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Context.Provider>
    </ErrorBoundary>
  );
}
