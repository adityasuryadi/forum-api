const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(payload) {
    const id = `comment-${this._idGenerator()}`;
    const { content, threadId, userId } = payload;
    const isDeleted = false;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6) RETURNING id,content,user_id AS owner',
      values: [id, content, threadId, userId, isDeleted, createdAt],
    };
    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async findCommentByThread(threadId) {
    const query = {
      text: `SELECT comments.id,users.username,comments.content,comments.created_at as date,is_deleted FROM comments JOIN users ON comments.user_id = users.id WHERE comments.thread_id = $1 ORDER BY date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteComment(params) {
    const { id, threadId } = params;
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 AND thread_id = $2 RETURNING id',
      values: [id, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal hapus. Komentar tidak ditemukan');
    }
    return result.rows[0].id;
  }

  async verifyOwner(params) {
    const { id, owner } = params;
    const query = {
      text: 'SELECT user_id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal hapus. Komentar tidak ditemukan');
    }
    const { user_id } = result.rows[0];
    if (owner !== user_id) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
    return user_id;
  }
}

module.exports = CommentRepositoryPostgres;