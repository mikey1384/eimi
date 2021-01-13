import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from 'contexts';
import Loading from 'components/Loading';
import ArchivedPicture from './ArchivedPicture';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';

SelectFromArchive.propTypes = {
  currentPictures: PropTypes.array.isRequired,
  selectedPictureIds: PropTypes.array.isRequired,
  onSetSelectedPictureIds: PropTypes.func.isRequired
};

export default function SelectFromArchive({
  currentPictures,
  selectedPictureIds,
  onSetSelectedPictureIds
}) {
  const {
    requestHelpers: { loadUserPictures }
  } = useAppContext();
  const [loadMoreButtonShown, setLoadMoreButtonShown] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pictures, setPictures] = useState([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    init();
    async function init() {
      setLoading(true);
      const { pictures: pics, loadMoreShown } = await loadUserPictures({
        exclude: currentPictures
      });
      if (mounted.current) {
        setPictures(pics);
        setLoadMoreButtonShown(loadMoreShown);
        setLoading(false);
      }
    }

    return function onUnmount() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '-1rem'
      }}
    >
      {loading ? (
        <Loading style={{ height: '10rem' }} />
      ) : pictures.length === 0 ? (
        <div style={{ fontSize: '2rem' }}>Your picture archive is empty</div>
      ) : (
        pictures.map((picture) => (
          <ArchivedPicture
            key={picture.id}
            selectedPictureIds={selectedPictureIds}
            onDeleteArchivedPicture={(pictureId) => {
              setPictures((pictures) =>
                pictures.filter((picture) => picture.id !== pictureId)
              );
              onSetSelectedPictureIds((selectedPictureIds) =>
                selectedPictureIds.filter((id) => id !== pictureId)
              );
            }}
            onSelect={(pictureId) =>
              onSetSelectedPictureIds((selectedPictureIds) =>
                selectedPictureIds.includes(pictureId)
                  ? selectedPictureIds.filter((id) => id !== pictureId)
                  : selectedPictureIds.concat(pictureId)
              )
            }
            picture={picture}
            style={{ margin: '0.5rem', cursor: 'pointer' }}
          />
        ))
      )}
      {loadMoreButtonShown && (
        <LoadMoreButton
          style={{ marginTop: '2rem', width: '100%', fontSize: '2rem' }}
          transparent
          onClick={handleLoadMore}
          loading={loadingMore}
        />
      )}
    </div>
  );

  async function handleLoadMore() {
    setLoadingMore(true);
    const { pictures: pics, loadMoreShown } = await loadUserPictures({
      lastPictureId: pictures[pictures.length - 1].id,
      exclude: currentPictures
    });
    setPictures((pictures) => pictures.concat(pics));
    setLoadMoreButtonShown(loadMoreShown);
    setLoadingMore(false);
  }
}
