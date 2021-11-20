import React from 'react';
import { stringIsEmpty, truncateText } from 'helpers/stringHelpers';
import { Color } from 'constants/css';
import localize from 'constants/localize';
import ContentLink from 'components/ContentLink';

export default function renderEnglishMessage({
  actionObj,
  isNotification,
  isReply,
  isSubjectResponse,
  isTask,
  rewardRootId,
  rewardType,
  rewardRootMissionType,
  rewardRootType,
  rootMissionType,
  targetComment,
  targetObj,
  targetSubject
}) {
  const contentPreview = `${
    !stringIsEmpty(targetObj.content)
      ? `${truncateText({
          text: targetObj.content,
          limit: 100
        })} `
      : ''
  }(${
    targetObj.contentType === 'url'
      ? localize('link')
      : localize(targetObj.contentType)
  })`;
  switch (actionObj.contentType) {
    case 'like':
      return (
        <>
          <span>님이</span>{' '}
          <span style={{ color: Color.lightBlue(), fontWeight: 'bold' }}>
            좋아요
          </span>{' '}
          버튼을 누르셨습니다:{' '}
          <ContentLink
            contentType={targetObj.contentType}
            content={{
              id: targetObj.id,
              title: contentPreview
            }}
          />
        </>
      );
    case 'mention':
      return (
        <>
          <span>님이</span> 회원님을{' '}
          <span style={{ color: Color.passionFruit(), fontWeight: 'bold' }}>
            언급
          </span>
          하셨습니다:{' '}
          <ContentLink
            contentType={targetObj.contentType}
            content={{
              id: targetObj.id,
              title: contentPreview
            }}
          />
        </>
      );
    case 'recommendation':
      return (
        <>
          <span>님이</span>{' '}
          <span style={{ color: Color.brownOrange(), fontWeight: 'bold' }}>
            추천
          </span>
          하셨습니다:{' '}
          <ContentLink
            contentType={targetObj.contentType}
            content={{
              id: targetObj.id,
              title: contentPreview
            }}
          />
        </>
      );
    case 'reward': {
      if (rewardType === 'Twinkle') {
        return (
          <>
            <span>님이</span>{' '}
            <span
              style={{
                color:
                  actionObj.amount >= 10
                    ? Color.rose()
                    : actionObj.amount >= 5
                    ? Color.orange()
                    : actionObj.amount >= 3
                    ? Color.pink()
                    : Color.lightBlue(),
                fontWeight: 'bold'
              }}
            >
              트윈클 {actionObj.amount}개를 선물하셨습니다
            </span>
            :{' '}
            <ContentLink
              contentType={targetObj.contentType}
              content={{
                id: targetObj.id,
                title: contentPreview
              }}
            />
          </>
        );
      } else {
        return (
          <>
            <span>님이</span>{' '}
            <ContentLink
              style={{ color: Color.green() }}
              content={{
                id: rewardRootId,
                title: `이 ${
                  rewardRootType === 'pass'
                    ? isTask
                      ? localize('task')
                      : localize('mission')?.toLowerCase()
                    : localize(rewardRootType)
                }`,
                missionType: rewardRootMissionType
              }}
              contentType={
                rewardRootType === 'pass' ? 'mission' : rewardRootType
              }
            />
            에 대한 회원님의 추천을{' '}
            <b style={{ color: Color.pink() }}>승인하셨습니다</b>:{' '}
            <p style={{ fontWeight: 'bold', color: Color.brownOrange() }}>
              트윈클 코인 {actionObj.amount}개가 지급되었습니다
            </p>
          </>
        );
      }
    }
    case 'comment':
      return isNotification ? (
        <>
          <span>님이</span> 회원님이 올리신{' '}
          <ContentLink
            contentType="subject"
            content={{
              id: targetSubject.id,
              title: localize('subject')
            }}
          />
          {`의 비밀 메시지를 조회하셨습니다.`}
        </>
      ) : (
        <>
          <span>님이</span> 회원님
          {targetObj.contentType === 'user' ? '의' : '이 올리신'}{' '}
          <ContentLink
            contentType={
              isReply
                ? localize('comment')
                : isSubjectResponse
                ? localize('subject')
                : targetObj.contentType
            }
            content={{
              id: isReply
                ? targetComment.id
                : isSubjectResponse
                ? targetSubject.id
                : targetObj.id,
              username: targetObj.content,
              title: `${
                isReply
                  ? localize('comment')
                  : isSubjectResponse
                  ? localize('subject')
                  : targetObj.contentType === 'user'
                  ? localize('profile')
                  : targetObj.contentType === 'url'
                  ? localize('link')
                  : localize(targetObj.contentType)
              }${
                !isReply && targetObj.contentType === 'user'
                  ? ''
                  : `(${truncateText({
                      text: isReply
                        ? targetComment.content
                        : isSubjectResponse
                        ? targetSubject.content
                        : targetObj.content,
                      limit: 100
                    })})`
              }`
            }}
          />
          에{' '}
          <ContentLink
            contentType="comment"
            content={{
              id: actionObj.id,
              title: isReply
                ? '답글'
                : targetObj.contentType === 'user'
                ? '메시지'
                : '댓글'
            }}
            style={{ color: Color.green() }}
          />
          {targetObj.contentType === 'user' ? '를' : '을'} 남기셨습니다:{' '}
          {!stringIsEmpty(actionObj.content) && (
            <>
              <ContentLink
                contentType="comment"
                content={{
                  id: actionObj.id,
                  title: `"${truncateText({
                    text: actionObj.content,
                    limit: 100
                  })}"`
                }}
                style={{ color: Color.green() }}
              />
            </>
          )}
        </>
      );
    case 'subject':
      return (
        <>
          <span>added a </span>
          <ContentLink
            contentType="subject"
            content={{
              id: actionObj.id,
              title: `subject (${truncateText({
                text: actionObj.content,
                limit: 100
              })})`
            }}
            style={{ color: Color.green() }}
          />{' '}
          <span>to your </span>
          <ContentLink
            contentType={targetObj.contentType}
            content={{
              id: targetObj.id,
              title: `${
                targetObj.contentType === 'url' ? 'link' : targetObj.contentType
              } (${truncateText({ text: targetObj.content, limit: 100 })})`
            }}
          />
        </>
      );
    case 'pass':
      return (
        <>
          <b style={{ color: Color.brownOrange() }}>Mission accomplished!</b>{' '}
          <ContentLink
            contentType="mission"
            content={{
              id: targetObj.id,
              missionType: rootMissionType || targetObj.missionType,
              title: `(${truncateText({
                text: targetObj.content,
                limit: 100
              })})`
            }}
            style={{ color: Color.blue() }}
          />
        </>
      );
    case 'fail':
      return (
        <>
          <b style={{ color: Color.darkerGray() }}>Mission failed...</b>{' '}
          <ContentLink
            contentType="mission"
            content={{
              id: targetObj.id,
              missionType: targetObj.missionType,
              title: `(${truncateText({
                text: targetObj.content,
                limit: 100
              })})`
            }}
            style={{ color: Color.blue() }}
          />
        </>
      );
    default:
      return <span>There was an error - report to Mikey!</span>;
  }
}
