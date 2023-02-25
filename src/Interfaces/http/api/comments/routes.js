const routes = (handler) => ([
    {
      method: 'POST',
      path: '/threads/{threadId}/comments',
      handler: handler.postCommentThreadHandler,
      options: {
        auth: 'forumapi_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/threads/{threadId}/comments/{commentId}',
      handler: handler.deleteCommentThreadHandler,
      options: {
        auth: 'forumapi_jwt',
      },
    },
  ]);
  
  module.exports = routes;