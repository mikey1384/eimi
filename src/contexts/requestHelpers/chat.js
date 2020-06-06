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
    async createNewChat({ channelName, selectedUsers, isClass, isClosed }) {
      try {
        const { data } = await request.post(
          `${URL}/chat/channel`,
          { channelName, selectedUsers, isClass, isClosed },
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
    async deleteMessage({ fileName = '', filePath = '', messageId }) {
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
    async editMessage({ editedMessage, messageId, isSubject, subjectId }) {
      try {
        await request.put(
          `${URL}/chat/message`,
          { editedMessage, messageId, isSubject, subjectId },
          auth()
        );
        return Promise.resolve();
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
    async hideAttachment(messageId) {
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
      const timeStamp = Math.floor(Date.now() / 1000);
      try {
        await request.delete(
          `${URL}/chat/channel?channelId=${channelId}&timeStamp=${timeStamp}`,
          auth()
        );
        return Promise.resolve();
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChat({ channelId, testAuth } = {}) {
      try {
        const { data } = await request.get(
          `${URL}/chat?channelId=${channelId}`,
          testAuth || auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChatChannel({ channelId, skipUpdateChannelId }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/channel?channelId=${channelId}${
            skipUpdateChannelId ? '&skipUpdateChannelId=1' : ''
          }`,
          auth()
        );
        return Promise.resolve(data);
      } catch (error) {
        return handleError(error);
      }
    },
    async loadChatSubject() {
      try {
        const { data } = await request.get(`${URL}/chat/chatSubject`);
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
    async loadMoreChannels({ currentChannelId, shownIds, type }) {
      try {
        const { data } = await request.get(
          `${URL}/chat/more/channels?type=${type}&currentChannelId=${currentChannelId}&${shownIds
            .map((shownId) => `shownIds[]=${shownId}`)
            .join('&')}`,
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
          data: { messages, loadedChannelId }
        } = await request.get(
          `${URL}/chat/more/messages?userId=${userId}&messageId=${messageId}&channelId=${channelId}`,
          auth()
        );
        return Promise.resolve({ messages, loadedChannelId });
      } catch (error) {
        return handleError(error);
      }
    },
    async loadMoreSubjects({ mineOnly, lastSubject }) {
      try {
        const {
          data: { subjects, loadMoreButton }
        } = await request.get(
          `${URL}/chat/chatSubject/modal/more?lastTimeStamp=${
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
    async reloadChatSubject(subjectId) {
      try {
        const {
          data: { subject, message }
        } = await request.put(
          `${URL}/chat/chatSubject/reload`,
          { subjectId },
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
    async saveMessage({ message, targetMessageId }) {
      try {
        const {
          data: { messageId }
        } = await request.post(
          `${URL}/chat`,
          { message, targetMessageId },
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
    async searchChatSubject(text) {
      try {
        const { data } = await request.get(
          `${URL}/chat/search/subject?text=${text}`
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
          data: { invitationMessage, channels }
        } = await request.post(
          `${URL}/chat/invitation`,
          { origin, recepients },
          auth()
        );
        return Promise.resolve({ invitationMessage, channels });
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
