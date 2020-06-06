import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchInput from 'components/Texts/SearchInput';
import ProfilePanel from 'components/ProfilePanel';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import Loading from 'components/Loading';
import PeopleFilterBar from './PeopleFilterBar';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { css } from 'emotion';
import { mobileMaxWidth } from 'constants/css';
import { useAppContext, useInputContext, useViewContext } from 'contexts';
import {
  useInfiniteScroll,
  useMyState,
  useSearch,
  useScrollPosition
} from 'helpers/hooks';
import request from 'axios';
import URL from 'constants/URL';
import {
  LAST_ONLINE_FILTER_LABEL,
  RANKING_FILTER_LABEL
} from 'constants/defaultValues';

People.propTypes = {
  location: PropTypes.object.isRequired
};

function People({ location }) {
  const {
    user: {
      actions: {
        onClearUserSearch,
        onLoadUsers,
        onLoadMoreUsers,
        onSearchUsers,
        onSetOrderUsersBy
      },
      state: {
        loadMoreButton,
        profilesLoaded,
        orderUsersBy,
        profiles,
        searchedProfiles
      }
    },
    requestHelpers: { loadUsers }
  } = useAppContext();
  const { profileTheme } = useMyState();
  const {
    actions: { onRecordScrollPosition },
    state: { scrollPositions }
  } = useViewContext();
  useScrollPosition({
    onRecordScrollPosition,
    pathname: location.pathname,
    scrollPositions
  });
  const {
    state: { userSearchText },
    actions: { onSetSearchText }
  } = useInputContext();
  const [loading, setLoading] = useState(false);
  const { handleSearch, searching } = useSearch({
    onSearch: handleSearchUsers,
    onSetSearchText: (searchText) =>
      onSetSearchText({ category: 'user', searchText }),
    onClear: onClearUserSearch
  });
  const prevOrderUsersBy = useRef(orderUsersBy);
  const mounted = useRef(true);
  const dropdownLabel =
    orderUsersBy === LAST_ONLINE_FILTER_LABEL
      ? RANKING_FILTER_LABEL
      : LAST_ONLINE_FILTER_LABEL;

  useInfiniteScroll({
    scrollable: profiles.length > 0 && stringIsEmpty(userSearchText),
    loadable: loadMoreButton,
    loading,
    feedsLength: profiles.length,
    onScrollToBottom: () => setLoading(true),
    onLoad: loadMoreProfiles
  });

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    init();
    async function init() {
      if (!profilesLoaded || orderUsersBy !== prevOrderUsersBy.current) {
        const data = await loadUsers({
          orderBy: orderUsersBy === RANKING_FILTER_LABEL ? 'twinkleXP' : ''
        });
        onLoadUsers(data);
        prevOrderUsersBy.current = orderUsersBy;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderUsersBy, profilesLoaded]);

  return (
    <div style={{ height: '100%' }}>
      <SearchInput
        className={css`
          @media (max-width: ${mobileMaxWidth}) {
            margin-top: 1rem;
          }
        `}
        style={{ zIndex: 0 }}
        addonColor={profileTheme}
        borderColor={profileTheme}
        placeholder="Search Users"
        onChange={handleSearch}
        value={userSearchText}
      />
      <div
        style={{
          marginTop: '1rem',
          position: 'relative',
          minHeight: '30%',
          width: '100%'
        }}
      >
        <PeopleFilterBar
          style={{
            marginBottom: '1rem'
          }}
          onSetOrderByText={onSetOrderUsersBy}
          orderByText={orderUsersBy}
          dropdownLabel={dropdownLabel}
        />
        {(!profilesLoaded || (!stringIsEmpty(userSearchText) && searching)) && (
          <Loading text={`${searching ? 'Searching' : 'Loading'} Users...`} />
        )}
        {profilesLoaded &&
          stringIsEmpty(userSearchText) &&
          profiles.map((profile) => (
            <ProfilePanel expandable key={profile.id} profileId={profile.id} />
          ))}
        {!stringIsEmpty(userSearchText) &&
          !searching &&
          searchedProfiles.map((profile) => (
            <ProfilePanel expandable key={profile.id} profileId={profile.id} />
          ))}
        {!stringIsEmpty(userSearchText) &&
          !searching &&
          searchedProfiles.length === 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '15rem',
                fontSize: '2.8rem'
              }}
            >
              No Users Found
            </div>
          )}
        {stringIsEmpty(userSearchText) && profilesLoaded && loadMoreButton && (
          <LoadMoreButton
            style={{ marginBottom: '1rem' }}
            filled
            color="lightBlue"
            onClick={() => setLoading(true)}
            loading={loading}
          />
        )}
        <div
          className={css`
            display: none;
            @media (max-width: ${mobileMaxWidth}) {
              display: block;
              height: 5rem;
            }
          `}
        />
      </div>
    </div>
  );

  async function handleSearchUsers(text) {
    const { data: users } = await request.get(
      `${URL}/user/users/search?queryString=${text}`
    );
    onSearchUsers(users);
  }

  async function loadMoreProfiles() {
    try {
      const data = await loadUsers({
        lastActive:
          profiles.length > 0 ? profiles[profiles.length - 1].lastActive : null,
        lastUserId:
          profiles.length > 0 ? profiles[profiles.length - 1].id : null,
        lastTwinkleXP:
          profiles.length > 0 ? profiles[profiles.length - 1].twinkleXP : null,
        orderBy: orderUsersBy === RANKING_FILTER_LABEL ? 'twinkleXP' : ''
      });
      onLoadMoreUsers(data);
      if (mounted.current) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }
}

export default memo(People);
