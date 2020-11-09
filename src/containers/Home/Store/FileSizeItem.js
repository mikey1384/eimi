import React from 'react';
import ItemPanel from './ItemPanel';
import Icon from 'components/Icon';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { karmaPointTable } from 'constants/defaultValues';

const item = {
  maxLvl: 7,
  name: [
    'Expand maximum upload file size',
    'Expand maximum upload file size (level 2)',
    'Expand maximum upload file size (level 3)',
    'Expand maximum upload file size (level 4)',
    'Expand maximum upload file size (level 5)',
    'Expand maximum upload file size (level 6)',
    'Expand maximum upload file size (level 7)'
  ],
  description: [
    'Unlock this item to expand your maximum upload file size to 500 MB (from 300 MB)',
    'Upgrade this item to expand your maximum upload file size to 750 MB (from 500 MB)',
    'Upgrade this item to expand your maximum upload file size to 1 GB (from 750 MB)',
    'Upgrade this item to expand your maximum upload file size to 1.25 GB (from 1 GB)',
    'Upgrade this item to expand your maximum upload file size to 1.5 GB (from 1.25 GB)',
    'Upgrade this item to expand your maximum upload file size to 1.75 GB (from 1.5 GB)',
    'Upgrade this item to expand your maximum upload file size to 2 GB (from 1.75 GB)'
  ]
};

export default function FileSizeItem() {
  const { fileUploadLvl = 0, karmaPoints, userId } = useMyState();
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  const {
    requestHelpers: { upgradeFileUploadSize }
  } = useAppContext();
  return (
    <ItemPanel
      isLeveled
      currentLvl={fileUploadLvl}
      maxLvl={item.maxLvl}
      karmaPoints={karmaPoints}
      requiredKarmaPoints={karmaPointTable.file[fileUploadLvl]}
      locked={!fileUploadLvl}
      onUnlock={handleUpgrade}
      itemName={item.name[fileUploadLvl]}
      itemDescription={item.description[fileUploadLvl]}
      style={{ marginTop: '5rem' }}
      upgradeIcon={<Icon size="3x" icon="upload" />}
    >
      <div>Max Level Reached</div>
    </ItemPanel>
  );

  async function handleUpgrade() {
    const success = await upgradeFileUploadSize();
    if (success) {
      onUpdateProfileInfo({ userId, fileUploadLvl: fileUploadLvl + 1 });
    }
  }
}
