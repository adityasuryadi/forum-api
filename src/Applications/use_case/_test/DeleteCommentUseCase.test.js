const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // mockCommentRepository.addComment = jest.fn()
    // .mockImplementation(() => Promise.resolve('comment-123'));

    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve('comment-123'));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    await deleteCommentUseCase.execute({ threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' });

    expect(mockCommentRepository.verifyOwner)
      .toBeCalledWith({ id: 'comment-123', owner: 'user-123' });
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.deleteComment)
      .toBeCalledWith({ id: 'comment-123', threadId: 'thread-123' });
  });
});