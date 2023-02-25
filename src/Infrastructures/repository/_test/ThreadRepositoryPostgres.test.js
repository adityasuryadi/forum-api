const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread to database and return thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!

      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');

      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const newThread = new NewThread({ title: 'ini title', body: 'ini body' });

      // Action
      await threadRepository.addThread({ ...newThread, userId });

      const result = await ThreadsTableTestHelper.findThreadsById('thread-123');

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!

      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');

      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const newThread = new NewThread({ title: 'ini title', body: 'ini body' });

      // Action
      const result = await threadRepository.addThread({ ...newThread, userId });

      // Assert
      const addedThread = result;
      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: 'ini title',
        owner: userId,
      });
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw not NotFoundError when thread found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread data correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      // Action & Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'ini title',
        body: 'ini body',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
      });
    });
  });
});