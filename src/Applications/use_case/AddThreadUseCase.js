const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload.useCasePayload);
    const userId = useCasePayload.id;
    const result = await this._threadRepository.addThread({ ...newThread, userId });
    return result;
  }
}

module.exports = AddThreadUseCase;