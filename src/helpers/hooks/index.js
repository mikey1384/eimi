import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { addEvent, removeEvent } from '../listenerHelpers';
import { stringIsEmpty } from '../stringHelpers';
import { useAppContext, useContentContext, useProfileContext } from 'contexts';
export { default as useScrollToBottom } from './useScrollToBottom';
export { default as useInfiniteScroll } from './useInfiniteScroll';
import { defaultContentState } from 'constants/defaultValues';

export function useContentState({ contentType, contentId }) {
  const { state } = useContentContext();
  return state[contentType + contentId]
    ? { ...defaultContentState, ...state[contentType + contentId] }
    : defaultContentState;
}

export function useInterval(callback, interval) {
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setInterval(callback, interval);
    return function cleanUp() {
      clearInterval(timerRef.current);
    };
  }, [callback, interval]);
}

export function useLazyLoad({
  PanelRef,
  inView,
  onSetPlaceholderHeight,
  onSetVisible,
  delay
}) {
  const timerRef = useRef(null);
  const currentInView = useRef(inView);

  useEffect(() => {
    currentInView.current = inView;
    clearTimeout(timerRef.current);
    if (currentInView.current !== false) {
      onSetVisible(true);
    } else {
      timerRef.current = setTimeout(() => {
        if (!currentInView.current) {
          onSetVisible(false);
        }
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    const clientHeight = PanelRef.current?.clientHeight;
    if (clientHeight) {
      onSetPlaceholderHeight(PanelRef.current?.clientHeight);
    }
    return function onRefresh() {
      if (clientHeight) {
        onSetPlaceholderHeight(clientHeight);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PanelRef.current?.clientHeight]);

  useEffect(() => {
    return function cleanUp() {
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useMyState() {
  const {
    user: {
      state: {
        hideWatched,
        lastChatPath,
        loaded,
        numWordsCollected,
        userId,
        searchFilter,
        signinModalShown,
        xpThisMonth
      }
    }
  } = useAppContext();
  const myState = useContentState({
    contentId: userId,
    contentType: 'user'
  });
  return myState.loaded
    ? {
        ...myState,
        lastChatPath,
        loaded,
        numWordsCollected,
        userId,
        defaultSearchFilter: searchFilter,
        hideWatched,
        isCreator:
          myState.userType === 'admin' || myState.userType === 'creator',
        loggedIn: true,
        signinModalShown,
        xpThisMonth
      }
    : {
        loaded,
        lastChatPath: '',
        rewardBoostLvl: 0,
        profileTheme: 'logoBlue',
        signinModalShown
      };
}

export function useOutsideClick(ref, callback) {
  const [insideClicked, setInsideClicked] = useState(false);
  useEffect(() => {
    function uPlistener(event) {
      if (insideClicked) return setInsideClicked(false);
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback();
    }
    function downListener(event) {
      if (ref.current?.contains(event.target)) {
        setInsideClicked(true);
      }
    }
    addEvent(document, 'mousedown', downListener);
    addEvent(document, 'mouseup', uPlistener);
    addEvent(document, 'touchend', uPlistener);
    return function cleanUp() {
      removeEvent(document, 'mousedown', downListener);
      removeEvent(document, 'mouseup', uPlistener);
      removeEvent(document, 'touchend', uPlistener);
    };
  });
}

export function useProfileState(username) {
  const { state = {} } = useProfileContext();
  const { [username]: userState = {} } = state;
  const {
    notExist = false,
    notables = { feeds: [] },
    posts = {
      all: [],
      comments: [],
      likes: [],
      subjects: [],
      videos: [],
      watched: [],
      links: []
    },
    profileId
  } = userState;
  return { notables, posts, notExist, profileId };
}

export function useSearch({
  onSearch,
  onEmptyQuery,
  onClear,
  onSetSearchText
}) {
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  function handleSearch(text) {
    clearTimeout(timerRef.current);
    onSetSearchText(text);
    onClear?.();
    if (stringIsEmpty(text)) {
      onEmptyQuery?.();
      return setSearching(false);
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      await onSearch(text);
      setSearching(false);
    }, 500);
  }

  return { handleSearch, searching };
}

export function useScrollPosition({
  isMobile,
  onRecordScrollPosition,
  pathname,
  scrollPositions = {}
}) {
  const BodyRef = useRef(document.scrollingElement || document.documentElement);

  useEffect(() => {
    document.getElementById('App').scrollTop = scrollPositions[pathname] || 0;
    BodyRef.current.scrollTop = scrollPositions[pathname] || 0;
    // prevents bug on mobile devices where tapping stops working after user swipes left to go to previous page
    if (isMobile) {
      setTimeout(() => {
        document.getElementById('App').scrollTop =
          scrollPositions[pathname] || 0;
        BodyRef.current.scrollTop = scrollPositions[pathname] || 0;
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useLayoutEffect(() => {
    addEvent(window, 'scroll', handleScroll);
    addEvent(document.getElementById('App'), 'scroll', handleScroll);

    return function cleanUp() {
      removeEvent(window, 'scroll', handleScroll);
      removeEvent(document.getElementById('App'), 'scroll', handleScroll);
    };

    function handleScroll() {
      const position = Math.max(
        document.getElementById('App').scrollTop,
        BodyRef.current.scrollTop
      );
      onRecordScrollPosition({ section: pathname, position });
    }
  });
}
