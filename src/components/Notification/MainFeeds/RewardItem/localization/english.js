import React from 'react';
import UsernameText from 'components/Texts/UsernameText';
import ContentLink from 'components/ContentLink';
import { Color } from 'constants/css';
import { truncateText } from 'helpers/stringHelpers';

export default function renderEnglishText({
  contentId,
  contentType,
  isTask,
  rewardType,
  rewardAmount,
  rewarderId,
  rewarderUsername,
  rootId,
  rootType,
  rootMissionType,
  targetObj
}) {
  if (rewardType === 'Twinkle') {
    return (
      <div>
        <UsernameText
          user={{ id: rewarderId, username: rewarderUsername }}
          color={Color.blue()}
        />{' '}
        <span
          style={{
            color:
              rewardAmount >= 10
                ? Color.gold()
                : rewardAmount >= 5
                ? Color.rose()
                : rewardAmount >= 3
                ? Color.pink()
                : Color.lightBlue(),
            fontWeight: 'bold'
          }}
        >
          rewarded you {rewardAmount === 1 ? 'a' : rewardAmount} {rewardType}
          {rewardAmount > 1 ? 's' : ''}
        </span>{' '}
        for your{' '}
        <ContentLink
          style={{ color: Color.green() }}
          content={{
            id: contentId,
            title: `${contentType}${
              !targetObj ||
              targetObj.notFound ||
              (contentType === 'comment' && targetObj?.filePath)
                ? ''
                : contentType === 'comment'
                ? ` (${truncateText({
                    text: targetObj.content,
                    limit: 100
                  })})`
                : ` (${truncateText({
                    text: targetObj.title,
                    limit: 100
                  })})`
            }`
          }}
          contentType={contentType}
        />
      </div>
    );
  }
  return (
    <div>
      <UsernameText
        user={{ id: rewarderId, username: rewarderUsername }}
        color={Color.blue()}
      />{' '}
      <b style={{ color: Color.pink() }}>also recommended</b>{' '}
      <ContentLink
        style={{ color: Color.green() }}
        content={{
          id: rootId,
          title: `this ${
            rootType === 'pass' ? (isTask ? 'task' : 'mission') : rootType
          }`,
          missionType: rootMissionType
        }}
        contentType={rootType === 'pass' ? 'mission' : rootType}
      />{' '}
      <p style={{ fontWeight: 'bold', color: Color.brownOrange() }}>
        You earn {rewardAmount} Twinkle Coin
        {rewardAmount > 1 ? 's' : ''}!
      </p>
    </div>
  );
}
