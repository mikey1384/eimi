const selectedLanguage = process.env.REACT_APP_SELECTED_LANGUAGE;
const languageObj = {
  add: {
    en: 'Add',
    kr: '추가'
  },
  addQuestions: {
    en: 'Add Questions',
    kr: '문제 등록하기'
  },
  addEditQuestions: {
    en: 'Add/Edit Questions',
    kr: '문제 등록/수정하기'
  },
  allPosts: {
    en: 'All Posts',
    kr: '모든 게시물'
  },
  chat: {
    en: 'Chat',
    kr: '채팅'
  },
  copyAndPasteUrl: {
    en: 'Copy and paste a URL address here',
    kr: 'URL 주소를 복사한 후 여기에 붙여넣으세요'
  },
  explore: {
    en: 'Explore',
    kr: '탐색'
  },
  hideWatched: {
    en: 'Hide Watched',
    kr: '시청한 영상 숨기기'
  },
  home: {
    en: 'Home',
    kr: '홈'
  },
  link: {
    en: 'Link',
    kr: '링크'
  },
  mission: {
    en: 'Mission',
    kr: '미션'
  },
  missions: {
    en: 'Missions',
    kr: '미션 목록'
  },
  newToOld: {
    en: 'New to Old',
    kr: '최신순'
  },
  oldToNew: {
    en: 'Old to New',
    kr: '오래된순'
  },
  pleaseClickDoneButtonBelow: {
    en: 'Please click the "Done" button below',
    kr: '아래의 "완료" 버튼을 눌러주세요'
  },
  pleaseEnterTitle: {
    en: 'Please enter a title',
    kr: '제목을 입력해주세요'
  },
  pleaseMarkTheCorrectChoice: {
    en: 'Please mark the correct choice',
    kr: '정답을 선택해주세요'
  },
  posts: {
    en: 'Posts',
    kr: '게시물'
  },
  postSubject: {
    en: 'Post a subject users can talk about',
    kr: '대화 나누고 싶은 주제를 게시하세요'
  },
  postSubjectPlaceholder: {
    en: 'A subject users can talk about',
    kr: '무엇에 대해 이야기 나누고 싶으신가요?'
  },
  postContent: {
    en: 'Share interesting videos or webpages',
    kr: '흥미로운 동영상이나 웹페이지를 공유하세요'
  },
  questions: {
    en: 'Questions',
    kr: '문제'
  },
  recommended: {
    en: 'Recommended',
    kr: '추천'
  },
  recommendedPosts: {
    en: 'Recommended Posts',
    kr: '추천 게시물'
  },
  reorder: {
    en: 'Reorder',
    kr: '순서 변경'
  },
  reset: {
    en: 'Reset',
    kr: '초기화'
  },
  subject: {
    en: 'Subject',
    kr: '주제'
  },
  subjects: {
    en: 'Subjects',
    kr: '주제'
  },
  submit: {
    en: 'Submit',
    kr: '제출'
  },
  submit2: {
    en: 'Submit',
    kr: '등록'
  },
  thereAreNoQuestions: {
    en: 'There are no questions, yet',
    kr: '등록된 문제가 없습니다'
  },
  thereMustBeAtLeastTwoChoices: {
    en: 'There must be at least two choices',
    kr: '최소 두 개의 선택지를 입력해주세요'
  },
  video: {
    en: 'Video',
    kr: '동영상'
  },
  xpVideos: {
    en: 'XP Videos',
    kr: 'XP 동영상'
  },
  youtubeVideo: {
    en: 'YouTube Video',
    kr: '유튜브 동영상'
  }
};
export default function localize(section) {
  return languageObj[section][selectedLanguage];
}
