import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import HomeActions from './actions';
import HomeReducer from './reducer';

export const HomeContext = createContext();
export const initialHomeState = {
  category: 'recommended',
  displayOrder: 'desc',
  feeds: [],
  feedsOutdated: false,
  fileUploadProgress: null,
  fileUploadComplete: false,
  secretAttachmentUploadProgress: null,
  secretAttachmentUploadComplete: false,
  loadMoreButton: false,
  subFilter: 'all',
  submittingSubject: false,
  uploadingFile: false
};

HomeContextProvider.propTypes = {
  children: PropTypes.node
};

export function HomeContextProvider({ children }) {
  const [homeState, homeDispatch] = useReducer(HomeReducer, initialHomeState);
  return (
    <HomeContext.Provider
      value={{
        state: homeState,
        actions: HomeActions(homeDispatch)
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}
