import React, { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import { Color } from 'constants/css';
import { css } from 'emotion';
import { useChatContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { returnWordLevel, rewardHash } from 'constants/defaultValues';
import { addCommasToNumber } from 'helpers/stringHelpers';

Vocabulary.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

function Vocabulary({ selected, onClick }) {
  const {
    state: { wordsObj, vocabActivities }
  } = useChatContext();
  const { userId: myId } = useMyState();

  const lastActivity = useMemo(() => {
    return wordsObj[vocabActivities[vocabActivities.length - 1]];
  }, [vocabActivities, wordsObj]);

  const lastRewardedXp = useMemo(
    () =>
      addCommasToNumber(
        rewardHash[
          returnWordLevel({
            frequency: lastActivity.frequency,
            word: lastActivity.content
          })
        ].rewardAmount
      ),
    [lastActivity.content, lastActivity.frequency]
  );

  return (
    <div
      style={{
        cursor: 'pointer',
        padding: '1rem',
        borderBottom: `1px solid ${Color.borderGray()}`,
        background: selected && Color.highlightGray()
      }}
      className={`unselectable ${css`
        &:hover {
          background: ${Color.checkboxAreaGray()};
        }
      `}`}
      onClick={onClick}
    >
      <div style={{ height: '5rem', position: 'relative' }}>
        <div style={{ fontSize: '1.7rem' }}>
          <Icon icon="book" />
          <span style={{ fontWeight: 'bold', marginLeft: '0.7rem' }}>
            Vocabulary
          </span>
        </div>
        {lastActivity && (
          <div style={{ position: 'absolute' }}>
            <p
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
            >
              {lastActivity.userId === myId ? 'You' : lastActivity.username}:{' '}
              <b>
                {lastActivity.content} (+{lastRewardedXp} XP)
              </b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Vocabulary);
