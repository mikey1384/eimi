async function loadPolyfills() {
  if (typeof window.IntersectionObserver === 'undefined') {
    await import('intersection-observer');
  }
}
loadPolyfills();

import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAlignJustify } from '@fortawesome/pro-solid-svg-icons/faAlignJustify';
import { faAndroid } from '@fortawesome/free-brands-svg-icons/faAndroid';
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple';
import { faArrowLeft } from '@fortawesome/pro-solid-svg-icons/faArrowLeft';
import { faArrowRight } from '@fortawesome/pro-solid-svg-icons/faArrowRight';
import { faArrowDown } from '@fortawesome/pro-solid-svg-icons/faArrowDown';
import { faArrowUp } from '@fortawesome/pro-solid-svg-icons/faArrowUp';
import { faBadgeDollar } from '@fortawesome/pro-solid-svg-icons/faBadgeDollar';
import { faBadgeDollar as farBadgeDollar } from '@fortawesome/pro-regular-svg-icons/faBadgeDollar';
import { faBadgeDollar as falBadgeDollar } from '@fortawesome/pro-light-svg-icons/faBadgeDollar';
import { faBan } from '@fortawesome/pro-solid-svg-icons/faBan';
import { faBars } from '@fortawesome/pro-solid-svg-icons/faBars';
import { faBolt } from '@fortawesome/pro-solid-svg-icons/faBolt';
import { faBook } from '@fortawesome/pro-solid-svg-icons/faBook';
import { faBriefcase } from '@fortawesome/pro-solid-svg-icons/faBriefcase';
import { faCameraAlt } from '@fortawesome/pro-solid-svg-icons/faCameraAlt';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons/faCaretDown';
import { faCertificate } from '@fortawesome/pro-solid-svg-icons/faCertificate';
import { faCertificate as farCertificate } from '@fortawesome/pro-regular-svg-icons/faCertificate';
import { faChalkboardTeacher } from '@fortawesome/pro-solid-svg-icons/faChalkboardTeacher';
import { faCheck } from '@fortawesome/pro-solid-svg-icons/faCheck';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons/faCheckCircle';
import { faChess } from '@fortawesome/pro-solid-svg-icons/faChess';
import { faChevronUp } from '@fortawesome/pro-solid-svg-icons/faChevronUp';
import { faChevronDown } from '@fortawesome/pro-solid-svg-icons/faChevronDown';
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons/faChevronRight';
import { faClipboardCheck } from '@fortawesome/pro-solid-svg-icons/faClipboardCheck';
import { faCodeBranch } from '@fortawesome/pro-solid-svg-icons/faCodeBranch';
import { faComment } from '@fortawesome/pro-solid-svg-icons/faComment';
import { faCommentAlt } from '@fortawesome/pro-solid-svg-icons/faCommentAlt';
import { faComments } from '@fortawesome/pro-solid-svg-icons/faComments';
import { faCopy } from '@fortawesome/pro-solid-svg-icons/faCopy';
import { faCrown } from '@fortawesome/pro-solid-svg-icons/faCrown';
import { faExchangeAlt } from '@fortawesome/pro-solid-svg-icons/faExchangeAlt';
import { faFilm } from '@fortawesome/pro-solid-svg-icons/faFilm';
import { faFile } from '@fortawesome/pro-solid-svg-icons/faFile';
import { faFileArchive } from '@fortawesome/pro-solid-svg-icons/faFileArchive';
import { faFileAudio } from '@fortawesome/pro-solid-svg-icons/faFileAudio';
import { faFilePdf } from '@fortawesome/pro-solid-svg-icons/faFilePdf';
import { faFileVideo } from '@fortawesome/pro-solid-svg-icons/faFileVideo';
import { faFileWord } from '@fortawesome/pro-solid-svg-icons/faFileWord';
import { faLink } from '@fortawesome/pro-solid-svg-icons/faLink';
import { faHeart } from '@fortawesome/pro-solid-svg-icons/faHeart';
import { faHeartSquare } from '@fortawesome/pro-solid-svg-icons/faHeartSquare';
import { faHome } from '@fortawesome/pro-solid-svg-icons/faHome';
import { faLock } from '@fortawesome/pro-solid-svg-icons/faLock';
import { faMinus } from '@fortawesome/pro-solid-svg-icons/faMinus';
import { faPaperclip } from '@fortawesome/pro-solid-svg-icons/faPaperclip';
import { faPaperPlane } from '@fortawesome/pro-solid-svg-icons/faPaperPlane';
import { faPencilAlt } from '@fortawesome/pro-solid-svg-icons/faPencilAlt';
import { faPhoneVolume } from '@fortawesome/pro-solid-svg-icons/faPhoneVolume';
import { faPlus } from '@fortawesome/pro-solid-svg-icons/faPlus';
import { faReply } from '@fortawesome/pro-solid-svg-icons/faReply';
import { faSearch } from '@fortawesome/pro-solid-svg-icons/faSearch';
import { faSchool } from '@fortawesome/pro-solid-svg-icons/faSchool';
import { faShoppingBag } from '@fortawesome/pro-solid-svg-icons/faShoppingBag';
import { faSignOutAlt } from '@fortawesome/pro-solid-svg-icons/faSignOutAlt';
import { faSlidersH } from '@fortawesome/pro-solid-svg-icons/faSlidersH';
import { faSpinner } from '@fortawesome/pro-solid-svg-icons/faSpinner';
import { faStar } from '@fortawesome/pro-solid-svg-icons/faStar';
import { faStarHalfAlt } from '@fortawesome/pro-solid-svg-icons/faStarHalfAlt';
import { faStar as farStar } from '@fortawesome/pro-regular-svg-icons/faStar';
import { faStarHalfAlt as farStarHalfAlt } from '@fortawesome/pro-regular-svg-icons/faStarHalfAlt';
import { faSurprise } from '@fortawesome/pro-solid-svg-icons/faSurprise';
import { faTasks } from '@fortawesome/pro-solid-svg-icons/faTasks';
import { faThumbsUp } from '@fortawesome/pro-solid-svg-icons/faThumbsUp';
import { faTimes } from '@fortawesome/pro-solid-svg-icons/faTimes';
import { faTrashAlt } from '@fortawesome/pro-solid-svg-icons/faTrashAlt';
import { faTrashRestore } from '@fortawesome/pro-solid-svg-icons/faTrashRestore';
import { faTree } from '@fortawesome/pro-solid-svg-icons/faTree';
import { faTrophy } from '@fortawesome/pro-solid-svg-icons/faTrophy';
import { faUser } from '@fortawesome/pro-solid-svg-icons/faUser';
import { faUpload } from '@fortawesome/pro-solid-svg-icons/faUpload';
import { faUserGraduate } from '@fortawesome/pro-solid-svg-icons/faUserGraduate';
import { faUsers } from '@fortawesome/pro-solid-svg-icons/faUsers';
import { faVolumeMute } from '@fortawesome/pro-solid-svg-icons/faVolumeMute';
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows';
import App from './containers/App';
import { AppContextProvider } from 'contexts';
import * as serviceWorker from './serviceWorker';

library.add(
  faAlignJustify,
  faAndroid,
  faApple,
  faArrowLeft,
  faArrowRight,
  faArrowDown,
  faArrowUp,
  faBadgeDollar,
  farBadgeDollar,
  falBadgeDollar,
  faBan,
  faBars,
  faBolt,
  faBook,
  faBriefcase,
  faCodeBranch,
  faCameraAlt,
  faCaretDown,
  faCertificate,
  farCertificate,
  faChalkboardTeacher,
  faCheck,
  faCheckCircle,
  faChess,
  faChevronUp,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faClipboardCheck,
  faComment,
  faCommentAlt,
  faComments,
  faCopy,
  faCrown,
  faExchangeAlt,
  faFile,
  faFileArchive,
  faFileAudio,
  faFilePdf,
  faFileVideo,
  faFileWord,
  faFilm,
  faHeart,
  faHeartSquare,
  faHome,
  faLink,
  faLock,
  faMinus,
  faPaperclip,
  faPaperPlane,
  faPencilAlt,
  faPhoneVolume,
  faPlus,
  faReply,
  faSchool,
  faShoppingBag,
  faSearch,
  faSignOutAlt,
  faSlidersH,
  faSpinner,
  faStar,
  faStarHalfAlt,
  farStar,
  farStarHalfAlt,
  faSurprise,
  faTasks,
  faThumbsUp,
  faTimes,
  faTrashAlt,
  faTrashRestore,
  faTree,
  faTrophy,
  faUpload,
  faUser,
  faUserGraduate,
  faUsers,
  faVolumeMute,
  faWindows
);

ReactDOM.render(
  <BrowserRouter>
    <AppContextProvider>
      <Route component={App} />
    </AppContextProvider>
  </BrowserRouter>,
  document.getElementById('react-view')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
