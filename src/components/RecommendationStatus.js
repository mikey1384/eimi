import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import UsernameText from 'components/Texts/UsernameText';
import UserListModal from 'components/Modals/UserListModal';
import { Color } from 'constants/css';
import { useMyState } from 'helpers/hooks';
import localize from 'constants/localize';

const andLabel = localize('and');
const recommendedByLabel = localize('recommendedBy');
const youLabel = localize('you');

RecommendationStatus.propTypes = {
  contentType: PropTypes.string.isRequired,
  recommendations: PropTypes.array.isRequired,
  style: PropTypes.object
};

export default function RecommendationStatus({
  contentType,
  recommendations = [],
  style
}) {
  const { profileTheme, userId } = useMyState();
  const [userListModalShown, setUserListModalShown] = useState(false);
  const recommendationsByUsertype = useMemo(() => {
    const result = [...recommendations];
    result.sort((a, b) => b.authLevel - a.authLevel);
    return result;
  }, [recommendations]);

  const myRecommendation = useMemo(
    () =>
      recommendationsByUsertype.filter(
        (recommendation) => recommendation.userId === userId
      )[0],
    [recommendationsByUsertype, userId]
  );

  const recommendationsByUsertypeExceptMe = useMemo(
    () =>
      recommendationsByUsertype.filter(
        (recommendation) => recommendation.userId !== userId
      ),
    [recommendationsByUsertype, userId]
  );

  const mostRecentRecommenderOtherThanMe = useMemo(
    () => recommendationsByUsertypeExceptMe?.[0],
    [recommendationsByUsertypeExceptMe]
  );

  const mostRecentRewardEnabledRecommenderOtherThanMe = useMemo(
    () =>
      recommendationsByUsertypeExceptMe.filter(
        (recommendation) => !recommendation.rewardDisabled
      )?.[0],
    [recommendationsByUsertypeExceptMe]
  );

  const isRewardable = useMemo(
    () =>
      (myRecommendation?.authLevel > 1 && !myRecommendation?.rewardDisabled) ||
      (mostRecentRewardEnabledRecommenderOtherThanMe?.authLevel > 1 &&
        !mostRecentRewardEnabledRecommenderOtherThanMe?.rewardDisabled),
    [
      mostRecentRewardEnabledRecommenderOtherThanMe?.authLevel,
      mostRecentRewardEnabledRecommenderOtherThanMe?.rewardDisabled,
      myRecommendation?.authLevel,
      myRecommendation?.rewardDisabled
    ]
  );

  return recommendations.length > 0 ? (
    <div
      style={{
        padding: '0.5rem',
        background: isRewardable && Color[profileTheme](0.1),
        borderTop: `1px solid ${Color.borderGray()}`,
        borderBottom: `1px solid ${Color.borderGray()}`,
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5rem',
        ...style
      }}
    >
      <div>
        {recommendedByLabel}{' '}
        {myRecommendation && (
          <b
            style={{
              color: isRewardable ? '#000' : Color.black()
            }}
          >
            {youLabel}
          </b>
        )}
        {mostRecentRecommenderOtherThanMe && (
          <>
            {myRecommendation &&
              (recommendationsByUsertypeExceptMe.length > 1
                ? ', '
                : `${andLabel} `)}
            <UsernameText
              color={isRewardable ? '#000' : Color.black()}
              user={{
                username: mostRecentRecommenderOtherThanMe.username,
                id: mostRecentRecommenderOtherThanMe.userId
              }}
            />
          </>
        )}
        {recommendationsByUsertypeExceptMe.length === 2 && (
          <>
            {andLabel}{' '}
            <UsernameText
              color={isRewardable ? '#000' : Color.black()}
              user={{
                username: recommendationsByUsertypeExceptMe[1].username,
                id: recommendationsByUsertypeExceptMe[1].userId
              }}
            />
          </>
        )}
        {recommendationsByUsertypeExceptMe.length > 2 && (
          <>
            {andLabel}{' '}
            <a
              style={{ cursor: 'pointer', fontWeight: 'bold', color: '#000' }}
              onClick={() => setUserListModalShown(true)}
            >
              {recommendationsByUsertypeExceptMe.length - 1} others
            </a>
          </>
        )}
      </div>
      {userListModalShown && (
        <UserListModal
          onHide={() => setUserListModalShown(false)}
          title={`People who recommended this ${contentType}`}
          users={recommendationsByUsertype.map((user) => ({
            ...user,
            id: user.userId
          }))}
        />
      )}
    </div>
  ) : null;
}
