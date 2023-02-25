const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'ini title',
      body: 'ini body',
    };

    const expectedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'ini title',
        owner: 'user-123',
      }));

    /** creating use case instance */
    const getAddThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
    const actualAddThread = await getAddThreadUseCase.execute({ useCasePayload });

    expect(actualAddThread).toEqual(expectedThread);
    expect(mockThreadRepository.addThread)
      .toBeCalledWith(new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }));
  });
});