export default function ContentActions(dispatch) {
  return {
    onAddTags({ tags, contentType, contentId }) {
      return dispatch({
        type: 'ADD_TAGS',
        tags,
        contentType,
        contentId: Number(contentId)
      });
    },
    onAddTagToContents({ contentIds, contentType, tagId, tagTitle }) {
      return dispatch({
        type: 'ADD_TAG_TO_CONTENTS',
        contentIds,
        contentType,
        tagId,
        tagTitle
      });
    },
    onAttachReward({ reward, contentId, contentType }) {
      return dispatch({
        type: 'ATTACH_REWARD',
        reward,
        contentId,
        contentType
      });
    },
    onClearCommentFileUploadProgress({ contentId, contentType, filePath }) {
      return dispatch({
        type: 'CLEAR_COMMENT_FILE_UPLOAD_PROGRESS',
        filePath,
        contentId,
        contentType
      });
    },
    onChangeProfileTheme({ userId, theme }) {
      return dispatch({
        type: 'CHANGE_PROFILE_THEME',
        contentId: userId,
        contentType: 'user',
        theme
      });
    },
    onChangeSpoilerStatus({ prevSecretViewerId, shown, subjectId }) {
      return dispatch({
        type: 'CHANGE_SPOILER_STATUS',
        shown,
        prevSecretViewerId,
        contentId: subjectId,
        contentType: 'subject'
      });
    },
    onUpdateUserCoins({ coins, userId }) {
      return dispatch({
        type: 'UPDATE_USER_COINS',
        contentId: userId,
        contentType: 'user',
        coins
      });
    },
    onChangeUserXP({ xp, rank, userId }) {
      return dispatch({
        type: 'CHANGE_USER_XP',
        contentId: userId,
        contentType: 'user',
        xp,
        rank
      });
    },
    onDeleteComment(commentId) {
      return dispatch({
        type: 'DELETE_COMMENT',
        commentId
      });
    },
    onDeleteContent({ contentType, contentId }) {
      return dispatch({
        type: 'DELETE_CONTENT',
        contentType,
        contentId
      });
    },
    onEditComment({ commentId, editedComment }) {
      return dispatch({
        type: 'EDIT_COMMENT',
        commentId,
        editedComment
      });
    },
    onEditContent({ data, contentType, contentId }) {
      return dispatch({
        type: 'EDIT_CONTENT',
        contentType,
        contentId,
        data
      });
    },
    onEditRewardComment({ id, text }) {
      return dispatch({
        type: 'EDIT_REWARD_COMMENT',
        id,
        text
      });
    },
    onEditSubject({ editedSubject, subjectId }) {
      return dispatch({
        type: 'EDIT_SUBJECT',
        editedSubject,
        subjectId
      });
    },
    onIncreaseNumCoinsEarned({ videoId, amount }) {
      return dispatch({
        type: 'INCREASE_NUM_COINS_EARNED',
        amount,
        contentType: 'video',
        contentId: videoId
      });
    },
    onIncreaseNumXpEarned({ videoId, amount }) {
      return dispatch({
        type: 'INCREASE_NUM_XP_EARNED',
        amount,
        contentType: 'video',
        contentId: videoId
      });
    },
    onInitContent({ contentId, contentType, ...data }) {
      return dispatch({
        type: 'INIT_CONTENT',
        contentId: Number(contentId),
        contentType,
        data
      });
    },
    onLikeComment({ commentId, likes }) {
      return dispatch({
        type: 'LIKE_COMMENT',
        commentId,
        likes
      });
    },
    onLikeContent({ likes, contentType, contentId }) {
      return dispatch({
        type: 'LIKE_CONTENT',
        likes,
        contentType,
        contentId: Number(contentId)
      });
    },
    onLoadComments({
      comments,
      contentId,
      contentType,
      isPreview,
      loadMoreButton
    }) {
      return dispatch({
        type: 'LOAD_COMMENTS',
        comments,
        contentId,
        contentType,
        isPreview,
        loadMoreButton
      });
    },
    onLoadMoreComments({ comments, loadMoreButton, contentId, contentType }) {
      return dispatch({
        type: 'LOAD_MORE_COMMENTS',
        comments,
        loadMoreButton,
        contentId,
        contentType
      });
    },
    onLoadMoreReplies({
      commentId,
      replies,
      loadMoreButton,
      contentType,
      contentId
    }) {
      return dispatch({
        type: 'LOAD_MORE_REPLIES',
        commentId,
        replies,
        loadMoreButton,
        contentType,
        contentId
      });
    },
    onLoadMoreSubjectComments({
      comments,
      loadMoreButton,
      contentId,
      contentType,
      subjectId
    }) {
      return dispatch({
        type: 'LOAD_MORE_SUBJECT_COMMENTS',
        comments,
        loadMoreButton,
        subjectId,
        contentId,
        contentType
      });
    },
    onLoadMoreSubjectReplies({
      commentId,
      loadMoreButton,
      replies,
      contentId,
      contentType,
      subjectId
    }) {
      return dispatch({
        type: 'LOAD_MORE_SUBJECT_REPLIES',
        commentId,
        loadMoreButton,
        replies,
        contentId,
        contentType,
        subjectId
      });
    },
    onLoadMoreSubjects({ results, loadMoreButton, contentId, contentType }) {
      return dispatch({
        type: 'LOAD_MORE_SUBJECTS',
        results,
        loadMoreButton,
        contentId,
        contentType
      });
    },
    onLoadReplies({
      commentId,
      loadMoreButton,
      replies,
      contentType,
      contentId
    }) {
      return dispatch({
        type: 'LOAD_REPLIES',
        replies,
        commentId,
        loadMoreButton,
        contentType,
        contentId
      });
    },
    onLoadRepliesOfReply({
      replies,
      commentId,
      replyId,
      contentType,
      contentId
    }) {
      return dispatch({
        type: 'LOAD_REPLIES_OF_REPLY',
        replies,
        commentId,
        replyId,
        contentType,
        contentId
      });
    },
    onLoadSubjectRepliesOfReply({ replies, commentId, replyId, subjectId }) {
      return dispatch({
        type: 'LOAD_SUBJECT_REPLIES_OF_REPLY',
        replies,
        commentId,
        replyId,
        contentId: subjectId,
        contentType: 'subject'
      });
    },
    onLoadSubjects({ contentId, contentType, subjects, loadMoreButton }) {
      return dispatch({
        type: 'LOAD_SUBJECTS',
        contentId,
        contentType,
        subjects,
        loadMoreButton
      });
    },
    onLoadSubjectComments({
      comments,
      loadMoreButton,
      subjectId,
      contentType,
      contentId
    }) {
      return dispatch({
        type: 'LOAD_SUBJECT_COMMENTS',
        comments,
        loadMoreButton,
        subjectId,
        contentType,
        contentId
      });
    },
    onLoadTags({ contentType, contentId, tags }) {
      return dispatch({
        type: 'LOAD_TAGS',
        contentId,
        contentType,
        tags
      });
    },
    onRecommendContent({ recommendations, contentType, contentId }) {
      return dispatch({
        type: 'RECOMMEND_CONTENT',
        recommendations,
        contentType,
        contentId: Number(contentId)
      });
    },
    onReloadContent({ contentId, contentType }) {
      return dispatch({
        type: 'RELOAD_CONTENT',
        contentId,
        contentType
      });
    },
    onReloadComments({ contentId, contentType }) {
      return dispatch({
        type: 'RELOAD_COMMENTS',
        contentId,
        contentType
      });
    },
    onRemoveStatusMsg(userId) {
      return dispatch({
        type: 'DELETE_STATUS_MSG',
        contentId: userId,
        contentType: 'user'
      });
    },
    onRevokeReward({ contentType, contentId, rewardId }) {
      return dispatch({
        type: 'REVOKE_REWARD',
        contentId,
        contentType,
        rewardId
      });
    },
    onSetActualDescription({ contentId, contentType, description }) {
      return dispatch({
        type: 'SET_ACTUAL_URL_DESCRIPTION',
        contentId,
        contentType,
        description
      });
    },
    onSetActualTitle({ contentId, contentType, title }) {
      return dispatch({
        type: 'SET_ACTUAL_URL_TITLE',
        contentId,
        contentType,
        title
      });
    },
    onSetByUserStatus({ byUser, contentId, contentType }) {
      return dispatch({
        type: 'SET_BY_USER_STATUS',
        byUser,
        contentId,
        contentType
      });
    },
    onSetCommentFileUploadComplete({ contentId, contentType }) {
      return dispatch({
        type: 'SET_COMMENT_FILE_UPLOAD_COMPLETE',
        contentId,
        contentType
      });
    },
    onSetCommentsShown({ contentId, contentType }) {
      return dispatch({
        type: 'SET_COMMENTS_SHOWN',
        contentId,
        contentType
      });
    },
    onSetCommentUploadingFile({ contentId, contentType, uploading }) {
      return dispatch({
        type: 'SET_COMMENT_UPLOADING_FILE',
        contentId,
        contentType,
        uploading
      });
    },
    onSetEmbeddedUrl({ contentId, contentType, url }) {
      return dispatch({
        type: 'SET_EMBEDDED_URL',
        contentId,
        contentType,
        url
      });
    },
    onSetExistingContent({ contentId, contentType, content }) {
      return dispatch({
        type: 'SET_EXISTING_CONTENT',
        contentId,
        contentType,
        content
      });
    },
    onSetFullTextState({ contentId, contentType, section, fullTextShown }) {
      return dispatch({
        type: 'SET_FULL_TEXT_STATE',
        contentId,
        contentType,
        section,
        fullTextShown
      });
    },
    onSetIsEditing({ contentId, contentType, isEditing }) {
      return dispatch({
        type: 'SET_IS_EDITING',
        contentId,
        contentType,
        isEditing
      });
    },
    onSetCommentPlaceholderHeight({ commentId, height }) {
      return dispatch({
        type: 'SET_COMMENT_PLACEHOLDER_HEIGHT',
        commentId,
        height
      });
    },
    onSetPlaceholderHeight({ contentId, contentType, height }) {
      return dispatch({
        type: 'SET_PLACEHOLDER_HEIGHT',
        contentId,
        contentType,
        height
      });
    },
    onSetPrevUrl({ contentId, contentType, prevUrl }) {
      return dispatch({
        type: 'SET_PREV_URL',
        contentId,
        contentType,
        prevUrl
      });
    },
    onSetRewardLevel({ rewardLevel, contentType, contentId }) {
      return dispatch({
        type: 'SET_REWARD_LEVEL',
        rewardLevel,
        contentType,
        contentId
      });
    },
    onSetSiteUrl({ contentId, contentType, siteUrl }) {
      return dispatch({
        type: 'SET_SITE_URL',
        contentId,
        contentType,
        siteUrl
      });
    },
    onSetSubjectFormShown({ contentId, contentType, shown }) {
      return dispatch({
        type: 'SET_SUBJECT_FORM_SHOWN',
        contentId,
        contentType,
        shown
      });
    },
    onSetSubjectRewardLevel({ contentId, contentType, rewardLevel }) {
      return dispatch({
        type: 'SET_SUBJECT_REWARD_LEVEL',
        rewardLevel,
        contentId: Number(contentId),
        contentType
      });
    },
    onSetThumbUrl({ contentId, contentType, thumbUrl, isSecretAttachment }) {
      return dispatch({
        type: 'SET_THUMB_URL',
        contentId,
        contentType,
        thumbUrl,
        isSecretAttachment
      });
    },
    onSetVideoProgress({ videoId, progress }) {
      return dispatch({
        type: 'SET_VIDEO_PROGRESS',
        contentType: 'video',
        contentId: videoId,
        progress
      });
    },
    onSetVideoQuestions({ questions, contentType, contentId }) {
      return dispatch({
        type: 'SET_VIDEO_QUESTIONS',
        questions,
        contentType,
        contentId
      });
    },
    onSetMediaStarted({ contentType, contentId, started }) {
      return dispatch({
        type: 'SET_MEDIA_STARTED',
        contentType,
        contentId,
        started
      });
    },
    onSetTimeWatched({ videoId, timeWatched }) {
      return dispatch({
        type: 'SET_VIDEO_TIME_WATCHED',
        contentType: 'video',
        contentId: videoId,
        timeWatched
      });
    },
    onSetCommentVisible({ visible, commentId }) {
      return dispatch({
        type: 'SET_COMMENT_VISIBLE',
        commentId,
        visible
      });
    },
    onSetVideoCurrentTime({
      contentType,
      contentId,
      currentTime,
      secretAttachmentCurrentTime
    }) {
      return dispatch({
        type: 'SET_VIDEO_CURRENT_TIME',
        contentType,
        contentId,
        currentTime,
        secretAttachmentCurrentTime
      });
    },
    onSetVisible({ visible, contentId, contentType }) {
      return dispatch({
        type: 'SET_VISIBLE',
        contentType,
        contentId,
        visible
      });
    },
    onSetXpRewardInterfaceShown({ contentId, contentType, shown }) {
      return dispatch({
        type: 'SET_XP_REWARD_INTERFACE_SHOWN',
        contentId,
        contentType,
        shown
      });
    },
    onShowTCReplyInput({ contentId, contentType }) {
      return dispatch({
        type: 'SHOW_TC_REPLY_INPUT',
        contentId,
        contentType
      });
    },
    onUpdateBio({ bio, userId }) {
      return dispatch({
        type: 'UPDATE_USER_BIO',
        contentType: 'user',
        contentId: userId,
        bio
      });
    },
    onUpdateCommentFileUploadProgress({ contentType, contentId, progress }) {
      return dispatch({
        type: 'UPDATE_COMMENT_FILE_UPLOAD_PROGRESS',
        progress,
        contentType,
        contentId
      });
    },
    onUpdateCommentPinStatus({ contentType, contentId, commentId }) {
      return dispatch({
        type: 'UPDATE_COMMENT_PIN_STATUS',
        contentType,
        contentId,
        commentId
      });
    },
    onUpdateGreeting({ greeting, userId }) {
      return dispatch({
        type: 'UPDATE_USER_GREETING',
        contentId: userId,
        contentType: 'user',
        greeting
      });
    },
    onUpdateUserMissionState({ userId, missionType, newState }) {
      return dispatch({
        type: 'UPDATE_USER_MISSION_STATE',
        contentId: userId,
        contentType: 'user',
        missionType,
        newState
      });
    },
    onUpdateProfileInfo({ userId, ...data }) {
      return dispatch({
        type: 'UPDATE_PROFILE_INFO',
        data,
        contentId: userId,
        contentType: 'user'
      });
    },
    onUpdateStatusMsg({ statusColor, statusMsg, userId }) {
      return dispatch({
        type: 'UPDATE_STATUS_MSG',
        statusColor,
        statusMsg,
        contentType: 'user',
        contentId: userId
      });
    },
    onUpdateCurrentMission({ userId, missionId }) {
      return dispatch({
        type: 'UPDATE_CURRENT_MISSION',
        contentId: userId,
        contentType: 'user',
        missionId
      });
    },
    onUploadComment({ contentId, contentType, ...data }) {
      return dispatch({
        type: 'UPLOAD_COMMENT',
        data,
        contentId,
        contentType
      });
    },
    onUploadProfilePic({ userId, imageUrl }) {
      return dispatch({
        type: 'EDIT_PROFILE_PICTURE',
        contentId: userId,
        contentType: 'user',
        imageUrl
      });
    },
    onUploadReply({ contentId, contentType, ...data }) {
      return dispatch({
        type: 'UPLOAD_REPLY',
        data,
        contentId,
        contentType
      });
    },
    onUploadSubject({ contentType, contentId, ...subject }) {
      return dispatch({
        type: 'UPLOAD_SUBJECT',
        subject,
        contentId,
        contentType
      });
    },
    onUploadTargetComment({ contentType, contentId, ...data }) {
      return dispatch({
        type: 'UPLOAD_TARGET_COMMENT',
        data,
        contentType,
        contentId
      });
    }
  };
}
