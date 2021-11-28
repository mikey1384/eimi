import React from 'react';
import PropTypes from 'prop-types';
import ItemPanel from './ItemPanel';
import Icon from 'components/Icon';
import MaxLevelItemInfo from './MaxLevelItemInfo';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { karmaPointTable } from 'constants/defaultValues';
import localize from 'constants/localize';

const postPicturesOnYourProfilePageLabel = localize(
  'postPicturesOnYourProfilePage'
);

const item = {
  maxLvl: 7,
  name: [
    postPicturesOnYourProfilePageLabel,
    `${postPicturesOnYourProfilePageLabel} (level 2)'`,
    `${postPicturesOnYourProfilePageLabel} (level 3)'`,
    `${postPicturesOnYourProfilePageLabel} (level 4)'`,
    `${postPicturesOnYourProfilePageLabel} (level 5)'`,
    `${postPicturesOnYourProfilePageLabel} (level 6)'`,
    `${postPicturesOnYourProfilePageLabel} (level 7)'`
  ]
};

ProfilePictureItem.propTypes = {
  style: PropTypes.object
};

export default function ProfilePictureItem({ style }) {
  const { karmaPoints, numPics = 0, userId } = useMyState();
  const {
    requestHelpers: { upgradeNumPics }
  } = useAppContext();
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  return (
    <ItemPanel
      isLeveled
      currentLvl={numPics}
      maxLvl={item.maxLvl}
      karmaPoints={karmaPoints}
      requiredKarmaPoints={karmaPointTable.profilePicture[numPics]}
      locked={!numPics}
      onUnlock={handleUpgrade}
      itemName={item.name[numPics]}
      itemDescription={
        numPics > 0
          ? `Upgrade this item to post up to ${
              numPics + 1
            } pictures on you profile page`
          : 'Unlock this item to post pictures on your profile page'
      }
      style={style}
      upgradeIcon={<Icon size="3x" icon="image" />}
    >
      <MaxLevelItemInfo
        icon="image"
        title="Profile Pictures - Level 7"
        description={`You can now post up to ${numPics} pictures on your profile page`}
      />
    </ItemPanel>
  );

  async function handleUpgrade() {
    const success = await upgradeNumPics();
    if (success) {
      onUpdateProfileInfo({ userId, numPics: numPics + 1 });
    }
  }
}
