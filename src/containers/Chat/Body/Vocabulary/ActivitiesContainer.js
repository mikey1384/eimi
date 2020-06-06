import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Activity from './Activity';
import Button from 'components/Button';
import { useAppContext, useChatContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { checkScrollIsAtTheBottom } from 'helpers';
import { addEvent, removeEvent } from 'helpers/listenerHelpers';

ActivitiesContainer.propTypes = {
  style: PropTypes.object
};

function ActivitiesContainer({ style }) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [scrollAtBottom, setScrollAtBottom] = useState(false);
  const ActivitiesContainerRef = useRef(null);
  const ContentRef = useRef(null);
  const mounted = useRef(null);
  const timerRef = useRef(null);
  const { userId } = useMyState();
  useEffect(() => {
    handleSetScrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const ActivitiesContainer = ActivitiesContainerRef.current;
    mounted.current = true;
    addEvent(ActivitiesContainer, 'scroll', handleScroll);

    return function cleanUp() {
      mounted.current = false;
      removeEvent(ActivitiesContainer, 'scroll', handleScroll);
    };

    function handleScroll() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (ActivitiesContainerRef.current?.scrollTop === 0) {
          handleLoadMore();
        }
      }, 200);
    }
  });
  const {
    requestHelpers: { loadVocabulary }
  } = useAppContext();
  const {
    state: { vocabActivities, wordsObj, vocabActivitiesLoadMoreButton },
    actions: { onLoadMoreVocabulary }
  } = useChatContext();

  const fillerHeight = useMemo(
    () =>
      ActivitiesContainerRef.current?.offsetHeight >
      ContentRef.current?.offsetHeight
        ? ActivitiesContainerRef.current?.offsetHeight -
          ContentRef.current?.offsetHeight
        : 20,
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ActivitiesContainerRef.current?.offsetHeight,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ContentRef.current?.offsetHeight
    ]
  );

  return (
    <div
      ref={ActivitiesContainerRef}
      style={{ paddingLeft: '1rem', ...style }}
      onScroll={() => {
        if (
          checkScrollIsAtTheBottom({
            content: ContentRef.current,
            container: ActivitiesContainerRef.current
          })
        ) {
          setScrollAtBottom(true);
        } else {
          setScrollAtBottom(false);
        }
      }}
    >
      {vocabActivitiesLoadMoreButton ? (
        <div
          style={{
            marginTop: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <Button
            filled
            color="lightBlue"
            disabled={loadingMore}
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </div>
      ) : (
        <div
          style={{
            height: fillerHeight + 'px'
          }}
        />
      )}
      <div style={{ position: 'relative' }} ref={ContentRef}>
        {vocabActivities.map((vocab, index) => {
          const word = wordsObj[vocab] || {};
          return (
            <Activity
              key={word.id}
              activity={word}
              setScrollToBottom={handleSetScrollToBottom}
              isLastActivity={index === vocabActivities.length - 1}
              myId={userId}
              onReceiveNewActivity={handleReceiveNewActivity}
            />
          );
        })}
      </div>
    </div>
  );

  async function handleLoadMore() {
    if (vocabActivitiesLoadMoreButton) {
      const prevContentHeight = ContentRef.current?.offsetHeight || 0;
      if (!loadingMore) {
        setLoadingMore(true);
        const data = await loadVocabulary(wordsObj[vocabActivities[0]]?.id);
        onLoadMoreVocabulary(data);
        ActivitiesContainerRef.current.scrollTop = Math.max(
          ActivitiesContainerRef.current.scrollTop,
          (ContentRef.current?.offsetHeight || 0) - prevContentHeight
        );
        setLoadingMore(false);
      }
    }
  }

  function handleReceiveNewActivity() {
    if (scrollAtBottom) {
      handleSetScrollToBottom();
    }
  }

  function handleSetScrollToBottom() {
    ActivitiesContainerRef.current.scrollTop =
      ContentRef.current?.offsetHeight || 0;
    setTimeout(
      () =>
        (ActivitiesContainerRef.current.scrollTop =
          ContentRef.current?.offsetHeight || 0),
      100
    );
    if (ContentRef.current?.offsetHeight) setScrollAtBottom(true);
  }
}

export default memo(ActivitiesContainer);
