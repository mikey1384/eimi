import { returnMaxStars } from 'constants/defaultValues';

export function checkScrollIsAtTheBottom({ content, container }) {
  return content.offsetHeight <= container.offsetHeight + container.scrollTop;
}

export function determineXpButtonDisabled({
  rewardLevel,
  stars,
  myId,
  xpRewardInterfaceShown
}) {
  const maxStars = returnMaxStars({ rewardLevel });
  if (xpRewardInterfaceShown) return 'Reward';
  const numTotalStars = stars.reduce(
    (prev, star) => prev + star.rewardAmount,
    0
  );
  if (numTotalStars >= maxStars) return `${maxStars}/${maxStars} Twinkles`;
  const numPrevStars = stars.reduce((prev, star) => {
    if (star.rewarderId === myId) {
      return prev + star.rewardAmount;
    }
    return prev;
  }, 0);
  const maxRewardableStars = Math.ceil(maxStars / 2);
  if (numPrevStars >= maxRewardableStars) {
    return `${maxRewardableStars}/${maxRewardableStars} Rewarded`;
  }
  return false;
}

export function getSectionFromPathname(pathname) {
  const result = pathname?.split('/')[1];
  return {
    section: result === '' ? 'home' : result,
    isSubsection: !!pathname?.split(result)[1]
  };
}

export function isMobile(navigator) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function last(array) {
  return array[array.length - 1];
}

export function objectify(array, id = 'id') {
  const result = {};
  for (let elem of array) {
    result[elem[id]] = elem;
  }
  return result;
}

export function scrollElementToCenter(element, adjustment = -50) {
  if (!element) return;
  let offsetTop = 0;
  const body = document
    ? document.scrollingElement || document.documentElement
    : {};
  addAllOffsetTop(element);
  body.scrollTop =
    offsetTop + adjustment - (body.clientHeight - element.clientHeight) / 2;
  document.getElementById('App').scrollTop =
    offsetTop +
    adjustment -
    (document.getElementById('App').clientHeight - element.clientHeight) / 2;
  function addAllOffsetTop(element) {
    offsetTop += element.offsetTop;
    if (element.offsetParent) {
      addAllOffsetTop(element.offsetParent);
    }
  }
}

export function textIsOverflown(element) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
