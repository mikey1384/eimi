import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ChangePicture from './ChangePicture';
import { cloudFrontURL } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import StatusTag from './StatusTag';

ProfilePic.propTypes = {
  className: PropTypes.string,
  isAway: PropTypes.bool,
  isBusy: PropTypes.bool,
  isProfilePage: PropTypes.bool,
  large: PropTypes.bool,
  onClick: PropTypes.func,
  online: PropTypes.bool,
  profilePicId: PropTypes.number,
  statusShown: PropTypes.bool,
  style: PropTypes.object,
  userId: PropTypes.number
};

export default function ProfilePic({
  className,
  isAway,
  isBusy,
  isProfilePage,
  large,
  onClick = () => {},
  userId,
  online,
  profilePicId,
  statusShown,
  style
}) {
  const { userId: myId } = useMyState();
  const [changePictureShown, setChangePictureShown] = useState(false);
  const [src, setSrc] = useState(
    `${cloudFrontURL}/pictures/${userId}/${profilePicId}.jpg`
  );
  useEffect(() => {
    setSrc(`${cloudFrontURL}/pictures/${userId}/${profilePicId}.jpg`);
  }, [profilePicId, userId]);
  const statusTagShown = useMemo(
    () => (online || myId === userId) && statusShown,
    [myId, online, statusShown, userId]
  );

  return (
    <div
      className={className}
      style={{
        display: 'block',
        position: 'relative',
        userSelect: 'none',
        borderRadius: '50%',
        cursor: myId === userId && isProfilePage ? 'pointer' : 'default',
        ...style
      }}
      onClick={onClick}
      onMouseEnter={() => setChangePictureShown(true)}
      onMouseLeave={() => setChangePictureShown(false)}
    >
      <img
        alt="Thumbnail"
        style={{
          display: 'block',
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%'
        }}
        src={profilePicId ? src : '/img/default.png'}
        onError={() => setSrc('/img/default.png')}
      />
      <ChangePicture
        shown={myId === userId && isProfilePage && changePictureShown}
      />
      {statusTagShown && (
        <StatusTag
          status={isAway ? 'away' : isBusy ? 'busy' : 'online'}
          large={large}
        />
      )}
    </div>
  );
}
