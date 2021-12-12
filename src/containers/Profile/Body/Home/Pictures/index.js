import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import Button from 'components/Button';
import DropdownButton from 'components/Buttons/DropdownButton';
import Carousel from 'components/Carousel';
import Frame from './Frame';
import Icon from 'components/Icon';
import DeleteInterface from './DeleteInterface';
import AddPictureModal from './AddPictureModal';
import { objectify } from 'helpers';
import { useAppContext, useContentContext } from 'contexts';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import ErrorBoundary from 'components/ErrorBoundary';
import ReorderInterface from './ReorderInterface';
import NoPictures from './NoPictures';
import localize from 'constants/localize';

const addPictureLabel = localize('addPicture');
const deleteLabel = localize('delete');
const deletePicturesLabel = localize('deletePictures');
const picturesLabel = localize('pictures');
const reorderLabel = localize('reorder');
const reorderPicturesByDraggingLabel = localize('reorderPicturesByDragging');

Pictures.propTypes = {
  numPics: PropTypes.number,
  pictures: PropTypes.array,
  profileId: PropTypes.number,
  selectedTheme: PropTypes.string
};

export default function Pictures({
  numPics,
  profileId,
  pictures,
  selectedTheme
}) {
  const { userId, banned } = useMyState();
  const [addPictureModalShown, setAddPictureModalShown] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [reorderedPictureIds, setReorderedPictureIds] = useState([]);
  const [remainingPictures, setRemainingPictures] = useState(pictures);
  const {
    requestHelpers: {
      deleteProfilePictures,
      reorderProfilePictures,
      updateUserPictures
    }
  } = useAppContext();
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  const addPictureButtonDisabled = useMemo(() => {
    return pictures.length >= numPics;
  }, [numPics, pictures]);
  useEffect(() => {
    setReorderedPictureIds(pictures.map((picture) => picture.id));
    setRemainingPictures(pictures);
  }, [pictures]);

  const menuButtons = useMemo(() => {
    if (userId !== profileId || !pictures) return null;
    return deleteMode || reorderMode ? (
      <div style={{ display: 'flex' }}>
        <Button color="vantaBlack" transparent onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          skeuomorphic
          style={{ marginLeft: '1rem' }}
          onClick={handleConfirm}
        >
          Save
        </Button>
      </div>
    ) : (
      <div style={{ display: 'flex' }}>
        <Button
          disabled={addPictureButtonDisabled}
          color="darkerGray"
          skeuomorphic
          onClick={() => setAddPictureModalShown(true)}
        >
          <Icon icon="plus" />
          <span style={{ marginLeft: '0.7rem' }}>
            {addPictureLabel} ({pictures.length}/{numPics})
          </span>
        </Button>
        <DropdownButton
          skeuomorphic
          icon="ellipsis-h"
          color="darkerGray"
          direction="left"
          style={{ marginLeft: '1rem' }}
          menuProps={[
            ...(pictures.length > 1
              ? [
                  {
                    label: (
                      <>
                        <Icon icon="sort" />
                        <span style={{ marginLeft: '1rem' }}>
                          {reorderLabel}
                        </span>
                      </>
                    ),
                    onClick: () => setReorderMode(true)
                  }
                ]
              : []),
            {
              label: (
                <>
                  <Icon icon="trash-alt" />
                  <span style={{ marginLeft: '1rem' }}>{deleteLabel}</span>
                </>
              ),
              onClick: () => setDeleteMode(true)
            }
          ]}
        />
      </div>
    );

    function handleCancel() {
      if (deleteMode) {
        handlePictureDeleteCancel();
      } else {
        handlePictureReorderCancel();
      }
    }

    function handlePictureDeleteCancel() {
      setDeleteMode(false);
      setRemainingPictures(pictures);
    }

    function handlePictureReorderCancel() {
      setReorderMode(false);
      setReorderedPictureIds(pictures.map((picture) => picture.id));
    }

    function handleConfirm() {
      if (deleteMode) {
        handlePictureDeleteConfirm();
      } else {
        handlePictureReorderConfirm();
      }
    }

    async function handlePictureDeleteConfirm() {
      const success = await deleteProfilePictures(remainingPictures);
      if (success) {
        onUpdateProfileInfo({ userId: profileId, pictures: remainingPictures });
      }
      setDeleteMode(false);
    }

    async function handlePictureReorderConfirm() {
      const success = await reorderProfilePictures(reorderedPictureIds);
      if (success) {
        const pictureObj = objectify(pictures);
        onUpdateProfileInfo({
          userId: profileId,
          pictures: reorderedPictureIds.map(
            (pictureId) => pictureObj[pictureId]
          )
        });
      }
      setReorderMode(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deleteMode,
    reorderMode,
    numPics,
    pictures,
    remainingPictures,
    reorderedPictureIds
  ]);

  return (
    <ErrorBoundary>
      {pictures && pictures.length > 0 ? (
        <SectionPanel
          button={menuButtons}
          customColorTheme={selectedTheme}
          loaded
          title={
            deleteMode
              ? deletePicturesLabel
              : reorderMode
              ? reorderPicturesByDraggingLabel
              : picturesLabel
          }
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '-1rem'
            }}
          >
            {deleteMode ? (
              <DeleteInterface
                remainingPictures={remainingPictures}
                numPictures={pictures.length}
                onSetRemainingPictures={setRemainingPictures}
              />
            ) : reorderMode ? (
              <ReorderInterface
                reorderedPictureIds={reorderedPictureIds}
                pictures={pictures}
                numPictures={pictures.length}
                onSetReorderedPictureIds={setReorderedPictureIds}
              />
            ) : pictures.length > 2 ? (
              <Carousel
                className={css`
                  width: 75%;
                `}
                allowDrag={false}
                slidesToShow={3}
                slidesToScroll={1}
              >
                {pictures.map((picture, index) => (
                  <Frame
                    forCarousel
                    key={index}
                    picture={picture}
                    userIsUploader={profileId === userId}
                    onUpdatePictureCaption={handleUpdatePictureCaption}
                  />
                ))}
              </Carousel>
            ) : (
              <div
                style={{
                  width: '75%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {pictures.map((picture, index) => (
                  <Frame
                    key={index}
                    picture={picture}
                    style={{ marginLeft: index === 0 ? 0 : '1rem' }}
                    userIsUploader={profileId === userId}
                    onUpdatePictureCaption={handleUpdatePictureCaption}
                  />
                ))}
              </div>
            )}
          </div>
        </SectionPanel>
      ) : (
        <NoPictures
          onAddButtonClick={() => setAddPictureModalShown(true)}
          profileId={profileId}
          numPics={numPics}
        />
      )}
      {addPictureModalShown && (
        <AddPictureModal
          onHide={() => setAddPictureModalShown(false)}
          onConfirm={handleAddPictures}
          profileId={profileId}
          currentPictures={pictures}
          maxNumSelectable={numPics - pictures.length}
        />
      )}
    </ErrorBoundary>
  );

  async function handleAddPictures({ selectedPictureIds }) {
    if (banned?.posting) {
      return;
    }
    const pics = await updateUserPictures([
      ...selectedPictureIds,
      ...pictures.map((picture) => picture.id)
    ]);
    onUpdateProfileInfo({ userId: profileId, pictures: pics });
    setAddPictureModalShown(false);
  }

  function handleUpdatePictureCaption({ caption, pictureId }) {
    onUpdateProfileInfo({
      userId: profileId,
      pictures: pictures.map((picture) =>
        picture.id === pictureId
          ? {
              ...picture,
              caption
            }
          : picture
      )
    });
  }
}
