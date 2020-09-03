import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import UserActions from './User/actions';
import UserReducer from './User/reducer';
import requestHelpers from './requestHelpers';
import { ChatContextProvider } from './Chat';
import { ContentContextProvider } from './Content';
import { ExploreContextProvider } from './Explore';
import { HomeContextProvider } from './Home';
import { InputContextProvider } from './Input';
import { InteractiveContextProvider } from './Interactive';
import { ManagementContextProvider } from './Management';
import { NotiContextProvider } from './Notification';
import { ProfileContextProvider } from './Profile';
import { TaskContextProvider } from './Task';
import { ViewContextProvider } from './View';
import { LAST_ONLINE_FILTER_LABEL } from 'constants/defaultValues';

export const AppContext = createContext();
export const initialUserState = {
  authLevel: 0,
  canDelete: false,
  canEdit: false,
  canEditRewardLevel: false,
  canReward: false,
  canEditPlaylists: false,
  canPinPlaylists: false,
  defaultSearchFilter: '',
  hideWatched: false,
  isCreator: false,
  loaded: false,
  loadMoreButton: false,
  loggedIn: false,
  numWordsCollected: 0,
  orderUsersBy: LAST_ONLINE_FILTER_LABEL,
  profileTheme: 'logoBlue',
  profiles: [],
  profilesLoaded: false,
  searchedProfiles: [],
  signinModalShown: false,
  userId: null
};

AppContextProvider.propTypes = {
  children: PropTypes.node
};

export function AppContextProvider({ children }) {
  const [userState, userDispatch] = useReducer(UserReducer, initialUserState);
  return (
    <ManagementContextProvider>
      <ProfileContextProvider>
        <ExploreContextProvider>
          <ViewContextProvider>
            <NotiContextProvider>
              <TaskContextProvider>
                <HomeContextProvider>
                  <ChatContextProvider>
                    <InputContextProvider>
                      <ContentContextProvider>
                        <InteractiveContextProvider>
                          <AppContext.Provider
                            value={{
                              user: {
                                state: userState,
                                actions: UserActions(userDispatch)
                              },
                              requestHelpers: requestHelpers(handleError)
                            }}
                          >
                            {children}
                          </AppContext.Provider>
                        </InteractiveContextProvider>
                      </ContentContextProvider>
                    </InputContextProvider>
                  </ChatContextProvider>
                </HomeContextProvider>
              </TaskContextProvider>
            </NotiContextProvider>
          </ViewContextProvider>
        </ExploreContextProvider>
      </ProfileContextProvider>
    </ManagementContextProvider>
  );

  function handleError(error) {
    if (error.response) {
      console.error(error.response);
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        userDispatch({
          type: 'LOGOUT_AND_OPEN_SIGNIN_MODAL'
        });
      }
      if (status === 301) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
}
