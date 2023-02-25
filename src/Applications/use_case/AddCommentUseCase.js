const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    // eslint-disable-next-line no-unused-vars
    const { content, threadId, userId } = useCasePayload;
    const newComment = new NewComment({ content });
    // eslint-disable-next-line no-param-reassign
    useCasePayload.content = newComment.content;
    await this._threadRepository.verifyThreadAvailability(threadId);
    const result = await this._commentRepository.addComment(useCasePayload);
    return result;
  }
}

module.exports = AddCommentUseCase;