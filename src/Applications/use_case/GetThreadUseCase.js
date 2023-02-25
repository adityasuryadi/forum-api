const { addTypeValue } = require("node-pg-migrate/dist/operations/types");

class GetThreadUseCase {
    constructor({ commentRepository, threadRepository }) {
      this._commentRepository = commentRepository;
      this._threadRepository = threadRepository;
    }
  
    async execute(params) {
      const threadId = params;
      await this._threadRepository.verifyThreadAvailability(threadId);
      const threadresult = await this._threadRepository.getThreadById(threadId);
      const commentsResult = await this._commentRepository.findCommentByThread(threadId);
      const comments = [];
      commentsResult.forEach(element => {
        comments.push({
            id:element.id,
            username:element.username,
            date:element.date,
            content:element.is_deleted === true ? "**komentar telah dihapus**" : element.content
          })
      });
      const thread = {
        ...threadresult,
        comments,
      };
      const data = { thread };
      return data;
    }
  }
  
  module.exports = GetThreadUseCase;