import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import ContentLink from 'components/ContentLink';
import ProfilePic from 'components/ProfilePic';
import UsernameText from 'components/Texts/UsernameText';
import { useHistory } from 'react-router-dom';
import { timeSince } from 'helpers/timeStampHelpers';
import { Color } from 'constants/css';
// import { useMyState } from 'helpers/hooks';
import { css } from '@emotion/css';

Heading.propTypes = {
  action: PropTypes.string.isRequired,
  contentObj: PropTypes.shape({
    id: PropTypes.number,
    byUser: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    commentId: PropTypes.number,
    contentType: PropTypes.string,
    replyId: PropTypes.number,
    rootObj: PropTypes.object,
    rootId: PropTypes.number,
    rootType: PropTypes.string,
    subjectId: PropTypes.number,
    targetObj: PropTypes.object,
    timeStamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    uploader: PropTypes.object
  }).isRequired
};

function Heading({
  action,
  contentObj,
  contentObj: {
    // byUser,
    commentId,
    contentType,
    id,
    replyId,
    rootObj = {},
    rootType,
    targetObj = {},
    timeStamp,
    uploader = {}
  }
}) {
  const history = useHistory();
  // const { profileTheme } = useMyState();
  const MemoizedComponent = useMemo(() => {
    const contentLabel =
      rootType === 'url'
        ? 'link'
        : rootType === 'subject'
        ? 'subject'
        : rootType;
    switch (contentType) {
      case 'video':
        return (
          <>
            <UsernameText user={uploader} color={Color.blue()} /> uploaded a
            video:{' '}
            <ContentLink content={contentObj} contentType={contentType} />{' '}
          </>
        );
      case 'comment':
        return (
          <>
            <UsernameText user={uploader} color={Color.blue()} />{' '}
            <ContentLink
              content={{ id, title: action }}
              contentType={contentType}
              style={{ color: Color.green() }}
            />
            {renderTargetAction()} {contentLabel}:{' '}
            <ContentLink content={rootObj} contentType={rootType} />{' '}
          </>
        );
      case 'url':
        return (
          <>
            <UsernameText user={uploader} color={Color.blue()} /> shared a
            link:&nbsp;
            <ContentLink content={contentObj} contentType={contentType} />{' '}
          </>
        );
      case 'subject':
        return (
          <>
            <UsernameText user={uploader} color={Color.blue()} /> started a{' '}
            <ContentLink
              content={{ id, title: 'subject ' }}
              contentType={contentType}
              style={{
                color: /* byUser ? Color[profileTheme]() : */ Color.green()
              }}
            />
            {rootObj.id && (
              <>
                on {contentLabel}:{' '}
                <ContentLink content={rootObj} contentType={rootType} />{' '}
              </>
            )}
          </>
        );
      case 'pass':
        return (
          <>
            <UsernameText user={uploader} color={Color.blue()} /> completed a{' '}
            <ContentLink
              content={{
                id: rootObj.id,
                title: `${rootObj.isTask ? 'task' : 'mission'}: ${
                  rootObj.title
                }`,
                missionType: rootObj.missionType,
                rootMissionType: rootObj.rootMission?.missionType
              }}
              contentType="mission"
              style={{ color: Color.orange() }}
            />{' '}
          </>
        );
      default:
        return <span>Error</span>;
    }

    function renderTargetAction() {
      if (targetObj?.comment && !targetObj?.comment.notFound) {
        return (
          <span>
            {' '}
            <UsernameText
              user={targetObj.comment.uploader}
              color={Color.blue()}
            />
            {"'s "}
            <ContentLink
              content={{
                id: replyId || commentId,
                title: replyId
                  ? 'reply '
                  : rootType === 'user'
                  ? 'message '
                  : 'comment '
              }}
              contentType="comment"
              style={{ color: Color.green() }}
            />
            {!replyId && rootType === 'user' ? 'to' : 'on'}
          </span>
        );
      }
      return null;
    }
  }, [
    action,
    commentId,
    contentObj,
    contentType,
    id,
    replyId,
    rootObj,
    rootType,
    targetObj.comment,
    uploader
  ]);

  return (
    <header className="heading">
      <ProfilePic
        style={{ width: '6rem', height: '6rem' }}
        userId={uploader.id}
        profilePicUrl={uploader.profilePicUrl}
      />
      <div
        style={{
          width: '90%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: '1rem'
        }}
      >
        <div
          style={{
            width: '100%'
          }}
        >
          <span className="title">{MemoizedComponent}</span>
          <small
            className={`timestamp ${css`
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            `}`}
            onClick={() =>
              history.push(
                `/${
                  contentType === 'pass'
                    ? 'mission'
                    : contentType === 'url'
                    ? 'link'
                    : contentType
                }s/${contentType === 'pass' ? rootObj.id : id}`
              )
            }
          >
            {timeStamp ? `(${timeSince(timeStamp)})` : ''}
          </small>
        </div>
      </div>
    </header>
  );
}

export default memo(Heading);
