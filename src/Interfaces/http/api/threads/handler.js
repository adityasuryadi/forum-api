const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id } = request.auth.credentials;
    const useCasePayload = request.payload;
    const addedThread = await addThreadUseCase.execute({ useCasePayload, id });
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(GetThreadUseCase.name);
    const { threadId } = request.params;
    const thread = await getThreadDetailUseCase.execute(threadId);
    const response = h.response({
      status: 'success',
      data: thread,
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;