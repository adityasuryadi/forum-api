const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const id = `thread-${this._idGenerator()}`;
    const { title, body, userId } = thread;
    // console.log(thread);
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5) RETURNING id,title,user_id AS owner',
      values: [id, title, body, userId, createdAt],
    };
    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id,threads.title,threads.body,threads.created_at AS date, users.username 
                 FROM threads JOIN users ON threads.user_id = users.id WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;