import React, { useEffect, useRef } from 'react';
import FeaturedSubjects from './FeaturedSubjects';
import RecommendedSubjects from './RecommendedSubjects';
import { useAppContext, useExploreContext } from 'contexts';

export default function Subjects() {
  const featuredLoadedRef = useRef(false);
  const {
    requestHelpers: { loadFeaturedSubjects }
  } = useAppContext();
  const {
    state: {
      subjects: { loaded, featured, featuredLoaded, featuredLoadedMore }
    },
    actions: {
      onLoadFeaturedSubjects,
      onSetFeaturedSubjectsLoadedMore,
      onSetSubjectsLoaded
    }
  } = useExploreContext();
  useEffect(() => {
    init();
    async function init() {
      if (!loaded) {
        handleLoadFeaturedSubjects();
        onSetSubjectsLoaded(true);
      }
    }

    async function handleLoadFeaturedSubjects() {
      const subjects = await loadFeaturedSubjects();
      onLoadFeaturedSubjects(subjects);
      featuredLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div>
      <FeaturedSubjects
        loaded={featuredLoaded || featuredLoadedRef.current}
        loadedMore={featuredLoadedMore}
        subjects={featured}
        onSubmit={onLoadFeaturedSubjects}
        onLoadMore={() => onSetFeaturedSubjectsLoadedMore(true)}
      />
      <RecommendedSubjects />
    </div>
  );
}
