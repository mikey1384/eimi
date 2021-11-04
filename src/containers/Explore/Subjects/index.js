import React, { useEffect } from 'react';
import Featured from './Featured';
import Recommended from './Recommended';
import MadeByUsers from './MadeByUsers';
import ErrorBoundary from 'components/ErrorBoundary';
import { useAppContext, useExploreContext } from 'contexts';
import { useMyState } from 'helpers/hooks';

export default function Subjects() {
  const { canPinPlaylists, userId } = useMyState();
  const {
    requestHelpers: {
      loadByUserUploads,
      loadFeaturedSubjects,
      loadRecommendedUploads
    }
  } = useAppContext();
  const {
    state: {
      subjects: {
        loaded,
        byUsers,
        byUsersExpanded,
        byUsersLoadMoreButton,
        byUsersLoaded,
        featureds,
        featuredLoaded,
        featuredExpanded,
        recommendeds,
        recommendedExpanded,
        recommendedLoadMoreButton,
        recommendedLoaded
      },
      prevUserId
    },
    actions: {
      onLoadFeaturedSubjects,
      onSetByUserSubjectsExpanded,
      onSetFeaturedSubjectsExpanded,
      onSetRecommendedSubjectsExpanded,
      onLoadByUserSubjects,
      onLoadRecommendedSubjects,
      onSetSubjectsLoaded
    }
  } = useExploreContext();
  useEffect(() => {
    init();
    async function init() {
      if (!loaded || userId !== prevUserId) {
        handleLoadFeaturedSubjects();
        handleLoadByUserSubjects();
        handleLoadRecommendedSubjects();
        onSetSubjectsLoaded(true);
      }
    }

    async function handleLoadFeaturedSubjects() {
      const subjects = await loadFeaturedSubjects();
      onLoadFeaturedSubjects(subjects);
    }

    async function handleLoadByUserSubjects() {
      const { results, loadMoreButton } = await loadByUserUploads({
        contentType: 'subject',
        limit: 5
      });
      onLoadByUserSubjects({
        subjects: results,
        loadMoreButton
      });
    }

    async function handleLoadRecommendedSubjects() {
      const { results, loadMoreButton: loadMoreRecommendsButton } =
        await loadRecommendedUploads({
          contentType: 'subject',
          limit: 5
        });
      onLoadRecommendedSubjects({
        subjects: results,
        loadMoreButton: loadMoreRecommendsButton
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, userId, prevUserId]);

  return (
    <div>
      <ErrorBoundary>
        {((featuredLoaded && featureds.length > 0) || canPinPlaylists) && (
          <Featured
            loaded={featuredLoaded}
            expanded={featuredExpanded}
            subjects={featureds}
            onSubmit={onLoadFeaturedSubjects}
            onExpand={() => onSetFeaturedSubjectsExpanded(true)}
          />
        )}
        {false && (
          <MadeByUsers
            style={{ marginTop: '2.5rem' }}
            expanded={byUsersExpanded}
            subjects={byUsers}
            loadMoreButton={byUsersLoadMoreButton}
            loaded={byUsersLoaded}
            onExpand={() => onSetByUserSubjectsExpanded(true)}
          />
        )}
        {false && (
          <Recommended
            style={{ marginTop: '2.5rem' }}
            expanded={recommendedExpanded}
            subjects={recommendeds}
            loadMoreButton={recommendedLoadMoreButton}
            loaded={recommendedLoaded}
            onExpand={() => onSetRecommendedSubjectsExpanded(true)}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
