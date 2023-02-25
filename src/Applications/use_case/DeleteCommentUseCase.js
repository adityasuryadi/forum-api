class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
      this._commentRepository = commentRepository;
      this._threadRepository = threadRepository;
    }
  
    async execute(params) {
      const { commentId, threadId, userId } = params;
      await this._commentRepository.verifyOwner({ id: commentId, owner: userId });
      await this._threadRepository.verifyThreadAvailability(threadId);
      await this._commentRepository.deleteComment({ id: commentId, threadId });
    }
  }
  
  module.exports = DeleteCommentUseCase;