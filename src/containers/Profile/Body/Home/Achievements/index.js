import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import ContentPanel from 'components/ContentPanel';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import MonthlyXp from './MonthlyXp';
import ErrorBoundary from 'components/ErrorBoundary';
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
  const {
    requestHelpers: { loadMoreNotableContents, loadNotableContent }
  } = useAppContext();
  const {
    actions: { onLoadNotables, onLoadMoreNotables }
  } = useProfileContext();
  const {
    notables: { feeds, loaded, loadMoreButton }
  } = useProfileState(username);
  const [loading, setLoading] = useState(false);
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

  return (
    <ErrorBoundary>
      <SectionPanel
        customColorTheme={selectedTheme}
        title={notableActivitiesLabel}
        loaded={!loading}
      >
        {feeds.length === 0 && (
          <div
            style={{ fontSize: '2rem', textAlign: 'center' }}
          >{`${username} hasn't engaged in an activity worth showing here, yet`}</div>
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
        {loadMoreButton && (
          <LoadMoreButton
            style={{ fontSize: '1.7rem' }}
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
    const { results, loadMoreButton } = await loadMoreNotableContents({
      userId: profile.id,
      notables: feeds
    });
    onLoadMoreNotables({
      feeds: results,
      loadMoreButton,
      username
    });
  }
}
