import { initialUserState } from '../AppContext';

export default function UserReducer(state, action) {
  switch (action.type) {
    case 'CHANGE_DEFAULT_FILTER':
      return {
        ...state,
        myState: {
          ...state.myState,
          searchFilter: action.filter
        }
      };
    case 'CLEAR_USER_SEARCH':
      return {
        ...state,
        searchedProfiles: []
      };
    case 'CLOSE_SIGNIN_MODAL':
      return {
        ...state,
        signinModalShown: false
      };
    case 'INIT_MY_STATE':
      return {
        ...state,
        myState: {
          ...state.myState,
          ...action.data
        },
        loaded: true,
        loggedIn: true
      };
    case 'LOAD_USERS': {
      let loadMoreButton = false;
      if (action.data.length > 5) {
        action.data.pop();
        loadMoreButton = true;
      }
      return {
        ...state,
        profiles: action.data,
        loadMoreButton,
        profilesLoaded: true
      };
    }
    case 'LOAD_MORE_USERS': {
      let loadMoreButton = false;
      if (action.data.length > 1) {
        action.data.pop();
        loadMoreButton = true;
      }
      return {
        ...state,
        profiles: state.profiles.concat(action.data),
        loadMoreButton
      };
    }
    case 'LOGIN':
      return {
        ...state,
        myState: action.data,
        signinModalShown: false
      };
    case 'LOGOUT':
      return {
        ...initialUserState,
        loaded: true,
        loadMoreButton: state.loadMoreButton,
        profiles: state.profiles,
        profilesLoaded: state.profilesLoaded,
        searchedProfiles: state.searchedProfiles
      };
    case 'LOGOUT_AND_OPEN_SIGNIN_MODAL':
      return {
        ...initialUserState,
        loadMoreButton: state.loadMoreButton,
        signinModalShown: true,
        profiles: state.profiles,
        profilesLoaded: state.profilesLoaded,
        searchedProfiles: state.searchedProfiles
      };
    case 'OPEN_SIGNIN_MODAL':
      return {
        ...state,
        signinModalShown: true
      };
    case 'SEARCH_USERS':
      return {
        ...state,
        searchedProfiles: action.users
      };
    case 'SET_SESSION_LOADED':
      return {
        ...state,
        loaded: true
      };
    case 'SHOW_PROFILE_COMMENTS':
      return {
        ...state,
        profiles: state.profiles.map((profile) => ({
          ...profile,
          commentsShown:
            profile.id === action.profileId ? true : profile.commentsShown
        }))
      };
    case 'SIGNUP':
      return {
        ...state,
        myState: action.data,
        signinModalShown: false
      };
    case 'SET_LAST_CHAT_PATH':
      return {
        ...state,
        myState: {
          ...state.myState,
          lastChatPath: action.lastChatPath
        }
      };
    case 'SET_ORDER_USERS_BY':
      return {
        ...state,
        orderUsersBy: action.label
      };
    case 'SET_PROFILES_LOADED':
      return {
        ...state,
        profilesLoaded: action.loaded
      };
    case 'TOGGLE_HIDE_WATCHED':
      return {
        ...state,
        myState: {
          ...state.myState,
          hideWatched: action.hideWatched
        }
      };
    case 'UPDATE_NUM_WORDS_COLLECTED':
      return {
        ...state,
        myState: {
          ...state.myState,
          numWordsCollected: action.numWordsCollected
        }
      };
    default:
      return state;
  }
}
