import React, { useEffect, useRef, useState } from 'react';
import AddLinkModal from './AddLinkModal';
import Button from 'components/Button';
import SectionPanel from 'components/SectionPanel';
import LinkGroup from './LinkGroup';
import { useAppContext, useExploreContext } from 'contexts';

export default function Links() {
  const {
    requestHelpers: { loadByUserUploads, loadRecommendedUploads, loadUploads }
  } = useAppContext();
  const {
    state: {
      links: {
        byUserLoaded,
        byUserLinks,
        loadMoreByUserLinksButtonShown,
        recommendedsLoaded,
        recommendeds,
        loadMoreRecommendedsButtonShown,
        loaded,
        links,
        loadMoreLinksButtonShown
      }
    },
    actions: {
      onLoadByUserLinks,
      onLoadMoreByUserLinks,
      onLoadLinks,
      onLoadMoreLinks,
      onLoadRecommendedLinks,
      onLoadMoreRecommendedLinks
    }
  } = useExploreContext();
  const [addLinkModalShown, setAddLinkModalShown] = useState(false);
  const mounted = useRef(true);
  const lastId = useRef(null);
  const lastByUserId = useRef(null);
  const lastRecommendedId = useRef(null);
  const lastRecommendedTime = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (recommendeds.length > 0) {
      lastRecommendedId.current = recommendeds[recommendeds.length - 1].feedId;
      lastRecommendedTime.current =
        recommendeds[recommendeds.length - 1].lastInteraction;
    }
  }, [recommendeds]);

  useEffect(() => {
    if (links.length > 0) {
      lastId.current = links[links.length - 1].id;
    }
  }, [links]);

  useEffect(() => {
    if (byUserLinks.length > 0) {
      lastByUserId.current = byUserLinks[byUserLinks.length - 1].id;
    }
  }, [byUserLinks]);

  useEffect(() => {
    init();
    async function init() {
      if (!loaded) {
        handleLoadLinksMadeByUsers();
        handleLoadRecommendedLinks();
        handleLoadLinks();
      }
    }

    async function handleLoadLinksMadeByUsers() {
      const { results, loadMoreButton } = await loadByUserUploads({
        contentType: 'url',
        limit: 1
      });
      onLoadByUserLinks({
        links: results,
        loadMoreButton
      });
    }

    async function handleLoadRecommendedLinks() {
      const {
        results: recommendedLinks,
        loadMoreButton: loadMoreRecommendsButton
      } = await loadRecommendedUploads({
        contentType: 'url',
        limit: 5
      });
      onLoadRecommendedLinks({
        links: recommendedLinks,
        loadMoreButton: loadMoreRecommendsButton
      });
    }

    async function handleLoadLinks() {
      const { results: links, loadMoreButton } = await loadUploads({
        contentType: 'url',
        limit: 10
      });

      onLoadLinks({ links, loadMoreButton });
      loadedRef.current = true;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div>
      <SectionPanel
        title="Made by Twinkle Users"
        emptyMessage="No User Made Content"
        isEmpty={byUserLinks.length === 0}
        loaded={byUserLoaded}
        onLoadMore={handleLoadMoreByUserLinks}
        loadMoreButtonShown={loadMoreByUserLinksButtonShown}
      >
        <LinkGroup links={byUserLinks} />
      </SectionPanel>
      <SectionPanel
        title="Recommended"
        style={{ marginTop: '2.5rem' }}
        emptyMessage="No Recommended Links"
        isEmpty={recommendeds.length === 0}
        loaded={recommendedsLoaded}
        onLoadMore={handleLoadMoreRecommendeds}
        loadMoreButtonShown={loadMoreRecommendedsButtonShown}
      >
        <LinkGroup links={recommendeds} />
      </SectionPanel>
      <SectionPanel
        title="All Links"
        style={{ marginTop: '2.5rem' }}
        button={
          <Button
            skeuomorphic
            color="darkerGray"
            onClick={() => setAddLinkModalShown(true)}
          >
            + Add Link
          </Button>
        }
        emptyMessage="No Uploaded Links"
        isEmpty={links.length === 0}
        loaded={loaded || loadedRef.current}
        onLoadMore={handleLoadMoreLinks}
        loadMoreButtonShown={loadMoreLinksButtonShown}
      >
        <LinkGroup links={links} />
      </SectionPanel>
      {addLinkModalShown && (
        <AddLinkModal onHide={() => setAddLinkModalShown(false)} />
      )}
    </div>
  );

  async function handleLoadMoreByUserLinks() {
    const { results, loadMoreButton } = await loadByUserUploads({
      contentType: 'url',
      limit: 10,
      lastId: lastByUserId.current
    });
    onLoadMoreByUserLinks({ links: results, loadMoreButton });
  }

  async function handleLoadMoreRecommendeds() {
    const { results, loadMoreButton } = await loadRecommendedUploads({
      contentType: 'url',
      limit: 10,
      lastRecommendationId: lastRecommendedId.current,
      lastInteraction: lastRecommendedTime.current
    });
    onLoadMoreRecommendedLinks({ links: results, loadMoreButton });
  }

  async function handleLoadMoreLinks() {
    const { results: links, loadMoreButton } = await loadUploads({
      contentType: 'url',
      limit: 10,
      contentId: lastId.current
    });
    onLoadMoreLinks({ links, loadMoreButton });
  }
}
