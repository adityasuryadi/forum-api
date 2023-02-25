const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentThreadHandler = this.postCommentThreadHandler.bind(this);
    this.deleteCommentThreadHandler = this.deleteCommentThreadHandler.bind(this);
  }

  async postCommentThreadHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id } = request.auth.credentials;
    const { threadId } = request.params;
    const useCasePayload = request.payload;
    useCasePayload.threadId = threadId;
    useCasePayload.userId = id;
    const addedComment = await addCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentThreadHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { id } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const params = { };
    params.commentId = commentId;
    params.threadId = threadId;
    params.userId = id;
    await deleteCommentUseCase.execute(params);
    const response = h.response({
      status: 'success',
      message: 'berhasil menghapus komentar',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;