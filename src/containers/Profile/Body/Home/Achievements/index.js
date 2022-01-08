import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import ContentPanel from 'components/ContentPanel';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import MonthlyXp from './MonthlyXp';
import ErrorBoundary from 'components/ErrorBoundary';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import { useAppContext, useProfileContext } from 'contexts';
import { useProfileState } from 'helpers/hooks';
import localize from 'constants/localize';

const notableActivitiesLabel = localize('notableActivities');
const showMoreLabel = localize('showMore');

Achievements.propTypes = {
  profile: PropTypes.object.isRequired,
  selectedTheme: PropTypes.string
};

export default function Achievements({
  profile,
  profile: { id, username },
  selectedTheme
}) {
  const loadMoreNotableContents = useAppContext(
    (v) => v.requestHelpers.loadMoreNotableContents
  );
  const loadNotableContent = useAppContext(
    (v) => v.requestHelpers.loadNotableContent
  );
  const onLoadNotables = useProfileContext((v) => v.actions.onLoadNotables);
  const onLoadMoreNotables = useProfileContext(
    (v) => v.actions.onLoadMoreNotables
  );
  const {
    notables: { feeds, loaded, loadMoreButton: loadMoreButtonShown }
  } = useProfileState(username);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      initNotables();
    }
    async function initNotables() {
      setLoading(true);
      const { results, loadMoreButton } = await loadNotableContent({
        userId: id
      });
      if (mounted.current) {
        onLoadNotables({ username, feeds: results, loadMoreButton });
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loaded, profile.id, username]);

  const hasntEngagedLabel = useMemo(() => {
    if (SELECTED_LANGUAGE === 'kr') {
      return `${username}님은 아직 여기에 보일 만한 활동기록이 없습니다`;
    }
    return `${username} hasn't engaged in an activity worth showing here, yet`;
  }, [username]);

  return (
    <ErrorBoundary>
      <SectionPanel
        customColorTheme={selectedTheme}
        title={notableActivitiesLabel}
        loaded={!loading}
      >
        {feeds.length === 0 && (
          <div style={{ fontSize: '2rem', textAlign: 'center' }}>
            {hasntEngagedLabel}
          </div>
        )}
        {feeds.map((notable, index) => {
          const { contentId, contentType } = notable;
          return (
            <ContentPanel
              key={contentType + contentId}
              zIndex={feeds.length - index}
              style={{ marginBottom: '1rem' }}
              contentId={contentId}
              contentType={contentType}
              commentsLoadLimit={5}
              numPreviewComments={1}
            />
          );
        })}
        {loadMoreButtonShown && (
          <LoadMoreButton
            style={{ fontSize: '1.7rem' }}
            loading={loadingMore}
            label={showMoreLabel}
            transparent
            onClick={handleLoadMoreNotables}
          />
        )}
      </SectionPanel>
      <MonthlyXp selectedTheme={selectedTheme} userId={id} />
    </ErrorBoundary>
  );

  async function handleLoadMoreNotables() {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const { results, loadMoreButton } = await loadMoreNotableContents({
      userId: profile.id,
      notables: feeds
    });
    onLoadMoreNotables({
      feeds: results,
      loadMoreButton,
      username
    });
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }
}
