const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads (add and delete comments) endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  let token = '';
  beforeEach(async () => {
    // Arrange
    const requestAuthPayload = {
      username: 'dicoding',
      password: 'secret',
    };
      // add user
    const server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    const tesAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestAuthPayload,
    });

    token = tesAuth.result.data.accessToken;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when no authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadId = 'thread-123';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when payload invalid', async () => {
      // Arrange
      const requestPayload = {};
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadId = 'thread-123';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat melakukan komentar karena properti yang dibutuhkan tidak ada');
    });

    it('should response 201 when added comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadId = 'thread-123';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 when get thread', async () => {
      // arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when no authentication', async () => {
      // arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 403 when wrong owner', async () => {
      // arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'lingjul' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 404 when comment not found', async () => {
      // arrange
      // await UsersTableTestHelper.addUser({ id:'user-123',username:'lingjul' });
      const decodedToken = await container.getInstance(AuthenticationTokenManager.name)
        .decodePayload(token);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', userId: decodedToken.id });
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: 'comment-123', userId: decodedToken.id, threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-1234`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response 200 when delete thread', async () => {
      // arrange
      const decodedToken = await container.getInstance(AuthenticationTokenManager.name)
        .decodePayload(token);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', userId: decodedToken.id });
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: 'comment-123', userId: decodedToken.id, threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});