import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import DropdownButton from 'components/Buttons/DropdownButton';
import Button from 'components/Button';
import { isMobile, determineXpButtonDisabled, textIsOverflown } from 'helpers';
import Icon from 'components/Icon';
import XPRewardInterface from 'components/XPRewardInterface';
import AlreadyPosted from 'components/AlreadyPosted';
import BasicInfos from './BasicInfos';
import SideButtons from './SideButtons';
import Description from './Description';
import TagStatus from 'components/TagStatus';
import { Color, mobileMaxWidth } from 'constants/css';
import {
  addCommasToNumber,
  addEmoji,
  exceedsCharLimit,
  stringIsEmpty,
  finalizeEmoji,
  isValidYoutubeUrl
} from 'helpers/stringHelpers';
import { useContentState, useMyState } from 'helpers/hooks';
import { useContentContext, useInputContext } from 'contexts';
import { css } from 'emotion';

Details.propTypes = {
  addTags: PropTypes.func.isRequired,
  attachStar: PropTypes.func.isRequired,
  changeByUserStatus: PropTypes.func.isRequired,
  byUser: PropTypes.bool,
  changingPage: PropTypes.bool,
  content: PropTypes.string.isRequired,
  description: PropTypes.string,
  rewardLevel: PropTypes.number,
  likes: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEditFinish: PropTypes.func.isRequired,
  onLikeVideo: PropTypes.func.isRequired,
  onSetRewardLevel: PropTypes.func.isRequired,
  tags: PropTypes.array,
  stars: PropTypes.array,
  timeStamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string.isRequired,
  uploader: PropTypes.object.isRequired,
  userId: PropTypes.number,
  videoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  videoViews: PropTypes.number.isRequired
};

export default function Details({
  addTags,
  attachStar,
  byUser,
  changeByUserStatus,
  changingPage,
  content,
  rewardLevel,
  userId,
  uploader,
  title,
  description,
  likes,
  onDelete,
  onEditFinish,
  onLikeVideo,
  tags = [],
  onSetRewardLevel,
  stars,
  timeStamp,
  videoId,
  videoViews
}) {
  const {
    authLevel,
    canDelete,
    canEdit,
    canEditPlaylists,
    canStar
  } = useMyState();
  const {
    actions: { onSetIsEditing, onSetXpRewardInterfaceShown }
  } = useContentContext();
  const {
    state: inputState,
    actions: { onSetEditForm }
  } = useInputContext();
  const { isEditing, xpRewardInterfaceShown } = useContentState({
    contentType: 'video',
    contentId: videoId
  });
  const [titleHovered, setTitleHovered] = useState(false);
  const TitleRef = useRef(null);
  const RewardInterfaceRef = useRef(null);

  useEffect(() => {
    if (!inputState['edit' + 'video' + videoId]) {
      onSetEditForm({
        contentId: videoId,
        contentType: 'video',
        form: {
          editedDescription: description || '',
          editedTitle: title || '',
          editedUrl: `https://www.youtube.com/watch?v=${content}`
        }
      });
    }
    onSetXpRewardInterfaceShown({
      contentId: videoId,
      contentType: 'video',
      shown: false
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, title, description, content]);

  useEffect(() => {
    onSetXpRewardInterfaceShown({
      contentType: 'video',
      contentId: videoId,
      shown:
        xpRewardInterfaceShown &&
        canStar &&
        authLevel > uploader.authLevel &&
        !userIsUploader
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const editForm = useMemo(() => inputState['edit' + 'video' + videoId] || {}, [
    inputState,
    videoId
  ]);
  const { editedDescription = '', editedTitle = '', editedUrl = '' } = editForm;
  const userIsUploader = uploader.id === userId;

  const editButtonShown = useMemo(() => {
    const userCanEditThis =
      (canEdit || canDelete) && authLevel > uploader.authLevel;
    return userIsUploader || userCanEditThis;
  }, [authLevel, canDelete, canEdit, uploader.authLevel, userIsUploader]);

  const rewardButtonShown = useMemo(() => {
    return (
      !isEditing && canStar && !userIsUploader && authLevel > uploader.authLevel
    );
  }, [authLevel, canStar, isEditing, uploader.authLevel, userIsUploader]);

  const editMenuItems = useMemo(() => {
    const items = [];
    if (userIsUploader || canEdit) {
      items.push({
        label: 'Edit',
        onClick: handleEditStart
      });
    }
    if (userIsUploader || canDelete) {
      items.push({
        label: 'Delete',
        onClick: onDelete
      });
    }
    return items;

    function handleEditStart() {
      onSetIsEditing({
        contentId: videoId,
        contentType: 'video',
        isEditing: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canDelete, canEdit, userIsUploader, videoId]);

  return (
    <div style={{ width: '100%' }}>
      <AlreadyPosted
        changingPage={changingPage}
        style={{ marginBottom: '1rem' }}
        contentId={Number(videoId)}
        contentType="video"
        url={content}
        uploaderId={uploader.id}
        videoCode={content}
      />
      <TagStatus
        style={{ fontSize: '1.5rem' }}
        onAddTags={addTags}
        tags={tags}
        contentId={Number(videoId)}
      />
      <div
        style={{
          padding: '0 1rem 1rem 1rem',
          width: '100%'
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1.5rem'
            }}
          >
            <BasicInfos
              className={css`
                width: CALC(100% - 25rem);
                @media (max-width: ${mobileMaxWidth}) {
                  width: CALC(100% - ${canStar ? '15rem' : '12rem'});
                }
              `}
              style={{
                marginRight: '1rem',
                display: 'flex',
                flexDirection: 'column'
              }}
              editedUrl={editedUrl}
              editedTitle={editedTitle}
              onTitleChange={title =>
                onSetEditForm({
                  contentId: videoId,
                  contentType: 'video',
                  form: {
                    editedTitle: title
                  }
                })
              }
              innerRef={TitleRef}
              onTitleKeyUp={event => {
                if (event.key === ' ') {
                  onSetEditForm({
                    contentId: videoId,
                    contentType: 'video',
                    form: {
                      editedTitle: addEmoji(event.target.value)
                    }
                  });
                }
              }}
              onUrlChange={text =>
                onSetEditForm({
                  contentId: videoId,
                  contentType: 'video',
                  form: {
                    editedUrl: text
                  }
                })
              }
              onEdit={isEditing}
              onMouseLeave={() => setTitleHovered(false)}
              onMouseOver={onMouseOver}
              onTitleClick={() => {
                if (textIsOverflown(TitleRef.current)) {
                  setTitleHovered(titleHovered => !titleHovered);
                }
              }}
              title={title}
              titleExceedsCharLimit={titleExceedsCharLimit}
              titleHovered={titleHovered}
              timeStamp={timeStamp}
              uploader={uploader}
              urlExceedsCharLimit={urlExceedsCharLimit}
            />
            <SideButtons
              className={css`
                width: 25rem;
                @media (max-width: ${mobileMaxWidth}) {
                  width: ${canStar ? '15rem' : '12rem'};
                }
              `}
              style={{
                marginTop: canEditPlaylists ? 0 : '1rem',
                display: 'flex',
                flexDirection: 'column'
              }}
              byUser={byUser}
              canStar={canStar}
              changeByUserStatus={changeByUserStatus}
              rewardLevel={rewardLevel}
              likes={likes}
              onLikeVideo={onLikeVideo}
              onSetRewardLevel={onSetRewardLevel}
              uploader={uploader}
              userId={userId}
              videoId={videoId}
            />
          </div>
        </div>
        <Description
          onChange={event =>
            onSetEditForm({
              contentId: videoId,
              contentType: 'video',
              form: {
                editedDescription: event.target.value
              }
            })
          }
          onEdit={isEditing}
          onEditCancel={handleEditCancel}
          onEditFinish={handleEditFinish}
          onKeyUp={event => {
            if (event.key === ' ') {
              onSetEditForm({
                contentId: videoId,
                contentType: 'video',
                form: {
                  editedDescription: addEmoji(event.target.value)
                }
              });
            }
          }}
          description={description}
          editedDescription={editedDescription}
          descriptionExceedsCharLimit={descriptionExceedsCharLimit}
          determineEditButtonDoneStatus={determineEditButtonDoneStatus}
        />
        {!isEditing && videoViews > 10 && (
          <div
            style={{
              padding: '1rem 0',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: Color.darkerGray()
            }}
          >
            {addCommasToNumber(videoViews)} view
            {`${videoViews > 1 ? 's' : ''}`}
          </div>
        )}
        <div style={{ display: 'flex' }}>
          {editButtonShown && !isEditing && (
            <DropdownButton
              skeuomorphic
              color="darkerGray"
              style={{ marginRight: '1rem' }}
              direction="left"
              text="Edit or Delete This Video"
              menuProps={editMenuItems}
            />
          )}
          {rewardButtonShown && (
            <Button
              skeuomorphic
              color="pink"
              disabled={determineXpButtonDisabled({
                rewardLevel: byUser ? 5 : 0,
                myId: userId,
                xpRewardInterfaceShown,
                stars
              })}
              onClick={handleSetXpRewardInterfaceShown}
            >
              <Icon icon="certificate" />
              <span style={{ marginLeft: '0.7rem' }}>
                {determineXpButtonDisabled({
                  rewardLevel: byUser ? 5 : 0,
                  myId: userId,
                  xpRewardInterfaceShown,
                  stars
                }) || 'Reward'}
              </span>
            </Button>
          )}
        </div>
        {xpRewardInterfaceShown && (
          <XPRewardInterface
            innerRef={RewardInterfaceRef}
            rewardLevel={byUser ? 5 : 0}
            stars={stars}
            contentType="video"
            contentId={Number(videoId)}
            noPadding
            uploaderId={uploader.id}
            onRewardSubmit={data => {
              onSetXpRewardInterfaceShown({
                contentId: videoId,
                contentType: 'video',
                shown: false
              });
              attachStar({ data, contentId: videoId, contentType: 'video' });
            }}
          />
        )}
      </div>
    </div>
  );

  function determineEditButtonDoneStatus() {
    const urlIsInvalid = !isValidYoutubeUrl(editedUrl);
    const titleIsEmpty = stringIsEmpty(editedTitle);
    const titleChanged = editedTitle !== title;
    const urlChanged =
      editedUrl !== `https://www.youtube.com/watch?v=${content}`;
    const descriptionChanged = editedDescription !== description;
    if (urlIsInvalid) return true;
    if (titleIsEmpty) return true;
    if (!titleChanged && !descriptionChanged && !urlChanged) return true;
    if (urlExceedsCharLimit(editedUrl)) return true;
    if (titleExceedsCharLimit(editedTitle)) return true;
    if (descriptionExceedsCharLimit(editedDescription)) return true;
    return false;
  }

  function handleEditCancel() {
    onSetEditForm({
      contentId: videoId,
      contentType: 'video',
      editForm: undefined
    });
    onSetIsEditing({
      contentId: videoId,
      contentType: 'video',
      isEditing: false
    });
  }

  async function handleEditFinish() {
    const params = {
      contentId: videoId,
      contentType: 'video',
      editedUrl,
      videoId,
      editedTitle: finalizeEmoji(editedTitle),
      editedDescription: finalizeEmoji(editedDescription)
    };
    await onEditFinish(params);
    onSetEditForm({
      contentId: videoId,
      contentType: 'video',
      editForm: undefined
    });
    onSetIsEditing({
      contentId: videoId,
      contentType: 'video',
      isEditing: false
    });
  }

  function handleSetXpRewardInterfaceShown() {
    onSetXpRewardInterfaceShown({
      contentId: videoId,
      contentType: 'video',
      shown: true
    });
  }

  function onMouseOver() {
    if (!isMobile(navigator) && textIsOverflown(TitleRef.current)) {
      setTitleHovered(true);
    }
  }

  function descriptionExceedsCharLimit(description) {
    return exceedsCharLimit({
      contentType: 'video',
      inputType: 'description',
      text: description
    });
  }

  function titleExceedsCharLimit(title) {
    return exceedsCharLimit({
      contentType: 'video',
      inputType: 'title',
      text: title
    });
  }

  function urlExceedsCharLimit(url) {
    return exceedsCharLimit({
      contentType: 'video',
      inputType: 'url',
      text: url
    });
  }
}
