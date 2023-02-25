const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'ini komentar',
      userId: 'user-123',
    };

    const expectedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'comment-123',
        content: 'ini komentar',
        owner: 'user-123',
      }));

    const getAddCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    const actualAddComment = await getAddCommentUseCase.execute(useCasePayload);

    expect(actualAddComment).toEqual(expectedComment);
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment)
      .toBeCalledWith({
        threadId: useCasePayload.threadId,
        content: useCasePayload.content,
        userId: useCasePayload.userId,
      });
  });
});