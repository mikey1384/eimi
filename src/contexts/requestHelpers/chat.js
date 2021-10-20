import request from 'axios';
import URL from 'constants/URL';

export default function chatRequestHelpers({ auth, handleError }) {
  return {
    async acceptInvitation(channelId) {
      try {
        const { data } = await request.post(
          `${URL}/chat/invitation/accept`,
          { channelId },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async buyChatSubject(channelId) {
      try {
        const { data } = await request.put(
          `${URL}/chat/chatSubject/buy`,
          {
            channelId
          },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async buyChatTheme({ channelId, theme }) {
      try {
        const { data } = await request.put(
          `${URL}/chat/theme/buy`,
          {
            channelId,
            theme
          },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async changeChannelOwner({ channelId, newOwner }) {
      try {
        const {
          data: { notificationMsg }
        } = await request.put(
          `${URL}/chat/owner`,
          { channelId, newOwner },
          auth()
        );
        return Promise.resolve(notificationMsg);
      } catch (error) {
        return handleError(error);
      }
    },
    async checkChatAccessible(pathId) {
      try {
        const {
          data: { isAccessible, generalChatPathId }
        } = await request.get(
          `${URL}/chat/check/accessible?pathId=${pathId}`,
          auth()
        );
        return Promise.resolve({ isAccessible, generalChatPathId });
      } catch (error) {
        return handleError(error);
      }
    },
    async createNewChat({
      channelName,
      isClass,
      isClosed,
      selectedUsers = []
    }) {
      try {
        const { data } = await request.post(
          `${URL}/chat/channel`,
          { channelName, isClass, isClosed, selectedUsers },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async deleteChatSubject(subjectId) {
      try {
        await request.delete(
          `${URL}/chat/chatSubject?subjectId=${subjectId}`,
          auth()
        );
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async deleteChatMessage({ fileName = '', filePath = '', messageId }) {
      try {
        await request.delete(
          `${URL}/chat/message?messageId=${messageId}&filePath=${filePath}&fileName=${fileName}`,
          auth()
        );
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async editChannelSettings(params) {
      try {
        await request.put(`${URL}/chat/settings`, params, auth());
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async editChatMessage({ editedMessage, messageId, isSubject, subjectId }) {
      try {
        const {
          data: { subjectChanged }
        } = await request.put(
          `${URL}/chat/message`,
          { editedMessage, messageId, isSubject, subjectId },
          auth()
        );
        return Promise.resolve(subjectChanged);
      } catch (error) {
        return handleError(error);
      }
    },
    async editWord({
      deletedDefIds,
      editedDefinitionOrder,
      partOfSpeeches,
      word
    }) {
      try {
        const data = await request.put(
          `${URL}/chat/word`,
          { deletedDefIds, editedDefinitionOrder, partOfSpeeches, word },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async fetchCurrentChessState({ channelId, recentChessMessage }) {
      try {
        const { data } = await request.put(
          `${URL}/chat/chess`,
          {
            channelId,
            recentChessMessage
          },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async getNumberOfUnreadMessages() {
      if (auth() === null) return;
      try {
        const {
          data: { numUnreads }
        } = await request.get(`${URL}/chat/numUnreads`, auth());
        return Promise.resolve(Number(numUnreads));
      } catch (error) {
        return handleError(error);
      }
    },
    async hideChatAttachment(messageId) {
      try {
        await request.put(`${URL}/chat/hide/attachment`, { messageId }, auth());
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async hideChat(channelId) {
      try {
        await request.put(`${URL}/chat/hide/chat`, { channelId }, auth());
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async inviteUsersToChannel(params) {
      try {
        const {
          data: { message }
        } = await request.post(`${URL}/chat/invite`, params, auth());
        return Promise.resolve({ ...params, message });
      } catch (error) {
        return handleError(error);
      }
    },
    async leaveChannel(channelId) {
      try {
        await request.delete(
          `${URL}/chat/channel?channelId=${channelId}`,
          auth()
        );
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChat(channelId) {
      try {
        const { data } = await request.get(
          `${URL}/chat?channelId=${channelId}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadGeneralChatPathId() {
      try {
        const {
          data: { pathId }
        } = await request.get(`${URL}/chat/pathId/general`, auth());
        return Promise.resolve(pathId);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChatChannel({ channelId, isForInvitation, skipUpdateChannelId }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/channel?channelId=${channelId}${
            skipUpdateChannelId ? '&skipUpdateChannelId=1' : ''
          }${isForInvitation ? '&isForInvitation=1' : ''}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChatSubject(channelId) {
      try {
        const { data } = await request.get(
          `${URL}/chat/chatSubject?channelId=${channelId}`
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadDMChannel({ recepient }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/channel/check?partnerId=${recepient.id}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadMoreChannels({ currentChannelId, lastId, lastUpdated, type }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/more/channels?type=${type}&currentChannelId=${currentChannelId}&lastUpdated=${lastUpdated}&lastId=${lastId}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadMoreChatMessages({ userId, messageId, channelId }) {
      try {
        const {
          data: { messageIds, messagesObj, loadedChannelId }
        } = await request.get(
          `${URL}/chat/more/messages?userId=${userId}&messageId=${messageId}&channelId=${channelId}`,
          auth()
        );
        return Promise.resolve({ messageIds, messagesObj, loadedChannelId });
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChatSubjects({ channelId }) {
      try {
        const {
          data: { mySubjects, allSubjects }
        } = await request.get(
          `${URL}/chat/chatSubject/modal?channelId=${channelId}`,
          auth()
        );
        return Promise.resolve({ mySubjects, allSubjects });
      } catch (error) {
        console.error(error.response || error);
      }
    },
    async loadMoreChatSubjects({ channelId, mineOnly, lastSubject }) {
      try {
        const {
          data: { subjects, loadMoreButton }
        } = await request.get(
          `${URL}/chat/chatSubject/modal/more?channelId=${channelId}&lastTimeStamp=${
            lastSubject.reloadTimeStamp || lastSubject.timeStamp
          }&lastId=${lastSubject.id}${mineOnly ? `&mineOnly=1` : ''}`,
          auth()
        );
        return Promise.resolve({ subjects, loadMoreButton });
      } catch (error) {
        console.error(error.response || error);
      }
    },
    async loadVocabulary(lastWordId) {
      try {
        const { data } = await request.get(
          `${URL}/chat/vocabulary${
            lastWordId ? `?lastWordId=${lastWordId}` : ''
          }`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async reloadChatSubject({ subjectId, channelId }) {
      try {
        const {
          data: { subject, message }
        } = await request.put(
          `${URL}/chat/chatSubject/reload`,
          { channelId, subjectId },
          auth()
        );
        return Promise.resolve({ subject, message });
      } catch (error) {
        return handleError(error);
      }
    },
    async lookUpWord(word) {
      try {
        const { data } = await request.get(
          `${URL}/chat/word?word=${word}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async parseChannelPath(pathId) {
      try {
        const {
          data: { channelId }
        } = await request.get(`${URL}/chat/parse?pathId=${pathId}`, auth());
        return Promise.resolve(channelId);
      } catch (error) {
        return handleError(error);
      }
    },
    async putFavoriteChannel(channelId) {
      try {
        const {
          data: { favorited }
        } = await request.put(
          `${URL}/chat/channel/favorite`,
          { channelId },
          auth()
        );
        return Promise.resolve(favorited);
      } catch (error) {
        return handleError(error);
      }
    },
    async registerWord(definitions) {
      try {
        const { data } = await request.post(
          `${URL}/chat/word`,
          { definitions },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async saveChatMessage({ message, targetMessageId, targetSubject }) {
      try {
        const {
          data: { messageId }
        } = await request.post(
          `${URL}/chat`,
          { message, targetMessageId, targetSubject },
          auth()
        );
        return Promise.resolve(messageId);
      } catch (error) {
        return handleError(error);
      }
    },
    async searchChat(text) {
      try {
        const { data } = await request.get(
          `${URL}/chat/search/chat?text=${text}`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async searchChatSubject({ text, channelId }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/search/subject?text=${text}&channelId=${channelId}`
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async searchUserToInvite(text) {
      try {
        const { data } = await request.get(
          `${URL}/chat/search/users?text=${text}`
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async sendInvitationMessage({ origin, recepients }) {
      try {
        const {
          data: { invitationMessage, channels, messages }
        } = await request.post(
          `${URL}/chat/invitation`,
          { origin, recepients },
          auth()
        );
        return Promise.resolve({ invitationMessage, channels, messages });
      } catch (error) {
        return handleError(error);
      }
    },
    async setChessMoveViewTimeStamp({ channelId, message }) {
      try {
        await request.put(
          `${URL}/chat/chess/timeStamp`,
          { channelId, message },
          auth()
        );
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async startNewDMChannel(params) {
      try {
        const { data } = await request.post(
          `${URL}/chat/channel/twoPeople`,
          params,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async updateLastChannelId(channelId) {
      try {
        await request.put(`${URL}/chat/lastChannelId`, { channelId }, auth());
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async updateChatLastRead(channelId) {
      try {
        await request.post(`${URL}/chat/lastRead`, { channelId }, auth());
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async uploadChatSubject({ channelId, content }) {
      try {
        const { data } = await request.post(
          `${URL}/chat/chatSubject`,
          { channelId, content },
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async uploadFileOnChat({
      channelId,
      content,
      selectedFile,
      onUploadProgress,
      path,
      recepientId,
      targetMessageId,
      subjectId
    }) {
      try {
        const { data: url } = await request.get(
          `${URL}/content/sign-s3?fileSize=${
            selectedFile.size
          }&fileName=${encodeURIComponent(
            selectedFile.name
          )}&path=${path}&context=chat`,
          auth()
        );
        await request.put(url.signedRequest, selectedFile, {
          onUploadProgress
        });
        const {
          data: { channel, message, messageId }
        } = await request.post(
          `${URL}/chat/file`,
          {
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            path,
            channelId,
            content,
            recepientId,
            targetMessageId,
            subjectId
          },
          auth()
        );
        return Promise.resolve({ channel, message, messageId });
      } catch (error) {
        return handleError(error);
      }
    }
  };
}
