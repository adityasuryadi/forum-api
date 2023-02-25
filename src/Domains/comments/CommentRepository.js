class CommentRepository {
    async verifyOwner(owner) {
      throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async addComment(comment) {
      throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async findCommentByThread(threadId) {
      throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async deleteComment(params) {
      throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  }
  
  module.exports = CommentRepository;