const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const pool = require('../../database/postgres/pool');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should return comment data after add', async () => {
      // Arrange
      // tambah user
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const fakeIdGenerator = () => '123'; // stub!

      // tambah thread
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');
      const newThread = new NewThread({ title: 'ini title', body: 'ini body' });
      const thread = await threadRepository.addThread({ ...newThread, userId });
      const threadId = thread.id;
      // arrange komentar
      const newComment = new NewComment({ content: 'ini komentar' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres
        .addComment({ ...newComment, threadId, userId });
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');

      // Assert
      expect(comment).toHaveLength(1);
    });
    it('should return comment data correctly', async () => {
      // Arrange
      // tambah user
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      const fakeIdGenerator = () => '123'; // stub!

      // tambah thread
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');
      const newThread = new NewThread({ title: 'ini title', body: 'ini body' });
      const thread = await threadRepository.addThread({ ...newThread, userId });
      const threadId = thread.id;
      // arrange komentar
      const newComment = new NewComment({ content: 'ini komentar' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comment = await commentRepositoryPostgres
        .addComment({ ...newComment, threadId, userId });

      // Assert
      await expect(comment).toStrictEqual({
        id: 'comment-123',
        content: 'ini komentar',
        owner: userId,
      });
    });
  });

  describe('findCommentByThread function', () => {
    it('should return comment data by thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', createdAt: '2022-09-18T08:26:43.288Z' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.findCommentByThread('thread-123');
      // Assert
      expect(comments).toHaveLength(2);
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2022-09-18T08:26:42.288Z',
          content: 'ini komentar',
          is_deleted:false,
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2022-09-18T08:26:43.288Z',
          content: 'ini komentar',
          is_deleted:false,
        },
      ]);
    });
  });

  describe('delete comment function', () => {
    it('should return not found when comment invalid', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-1234', threadId: 'thread-123' };

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteComment(params))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return unauthorized when user is not owner comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-123', owner: 'user-1234' };

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyOwner(params))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should doing soft delete correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-123', threadId: 'thread-123' };

      // Action
      const commentId = await commentRepositoryPostgres.deleteComment(params);
      const comment = await CommentsTableTestHelper.findCommentById(params.id);
      // Assert
      expect(commentId).toEqual('comment-123');
      expect(comment[0].is_deleted).toEqual(true);
    });
  });

  describe('verify owner function',()=>{
    it('should return not found when user not have comment',async()=>{
      // Arrange
      
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-1234', owner: 'user-123' };

      // Action && asserts
      return expect(commentRepositoryPostgres.verifyOwner(params.owner))
      .rejects
      .toThrowError(NotFoundError);
    })

    it('should return unauthorized when user is not has authorize',async()=>{
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-123', owner: 'user-1234' };

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyOwner(params))
        .rejects
        .toThrowError(AuthorizationError);
    })

    it('should return user id when user have comment and has authorize',async()=>{
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const params = { id: 'comment-123', owner: 'user-123' };
      const userId = await commentRepositoryPostgres.verifyOwner(params);
      // Action & Assert
      return expect(userId)
        .toEqual(params.owner);
    })
  })
});