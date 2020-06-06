export const defaultChatSubject = 'Introduce yourself!';
export const rewardValue = {
  star: 200
};
export const cloudFrontURL = `https://${process.env.REACT_APP_CLOUDFRONT_KEY}.cloudfront.net`;
export const S3URL = `https://${process.env.REACT_APP_AWS_S3_BUCKET_NAME}.s3.amazonaws.com`;
export const clientVersion = '1.3.58';
export const descriptionLengthForExtraRewardLevel = 1000;
export const charLimit = {
  chat: {
    subject: 200,
    message: 5000
  },
  comment: 10000,
  playlist: {
    title: 200,
    description: 5000
  },
  videoQuestion: {
    title: 2000,
    choice: 2000
  },
  subject: {
    title: 300,
    description: 20000
  },
  rewardComment: 5000,
  statusMsg: 500,
  url: {
    title: 300,
    description: 20000,
    url: 1000
  },
  video: {
    title: 200,
    description: 10000,
    url: 300
  }
};

export const rewardHash = {
  1: {
    label: 'basic',
    rewardAmount: 10,
    color: 'logoBlue'
  },
  2: {
    label: 'elementary',
    rewardAmount: 25,
    color: 'pink'
  },
  3: {
    label: 'intermediate',
    rewardAmount: 50,
    color: 'orange'
  },
  4: {
    label: 'advanced',
    rewardAmount: 100,
    color: 'red'
  },
  5: {
    label: 'epic',
    rewardAmount: 500,
    color: 'gold'
  }
};

export const rewardReasons = {
  1: {
    color: 'pink',
    icon: 'heart',
    message: 'for being considerate'
  },
  2: {
    color: 'logoBlue',
    icon: 'comments',
    message: 'for posting something related to the subject'
  },
  3: {
    color: 'orange',
    icon: 'surprise',
    message: 'for posting something interesting'
  },
  4: {
    color: 'gold',
    icon: 'bolt',
    message: 'for putting in a lot of effort'
  },
  5: {
    color: 'green',
    icon: 'check-circle',
    message: 'for participating in a group project or event'
  }
};

export const FILE_UPLOAD_XP_REQUIREMENT = 100000;
export const LAST_ONLINE_FILTER_LABEL = 'Last Online';
export const RANKING_FILTER_LABEL = 'Ranking';
export const MAX_PROFILE_PIC_SIZE = 10000;

export const returnMaxStars = ({ rewardLevel }) => {
  let maxStars = 5;
  if (rewardLevel > 0) {
    maxStars = 10 * rewardLevel;
  }
  return maxStars;
};

const intermediateWordFrequency = 4;
const advancedWordFrequency = 2.5;
const epicWordFrequency = 1.6;

export function returnWordLevel({ frequency, word }) {
  if (!frequency) return 3;
  if (frequency > intermediateWordFrequency) {
    if (word.length < 7) return 1;
    return 2;
  }
  if (word.slice(-2) === 'ly') return 3;
  if (frequency > advancedWordFrequency) return 3;
  if (frequency > epicWordFrequency) return 4;
  if (frequency <= epicWordFrequency) return 5;
  return 3;
}
