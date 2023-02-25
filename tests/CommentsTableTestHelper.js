const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'ini komentar', threadId = 'thread-123', userId = 'user-123', isDeleted = false, createdAt = '2022-09-18T08:26:42.288Z',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, content, threadId, userId, isDeleted, createdAt],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteCommentsById({ id = 'comment-123', threadId = 'thread-123' }) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1 AND thread_id = $2',
      values: [id, threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async verifyOwnerComment({ id = 'comment-123', owner = 'user-123' }) {
    const query = {
      text: 'SELECT user_id FROM comments WHERE id = $1 AND user_id = $2 ',
      values: [id, owner],
    };

    const result = await pool.query(query);
    const { user_id } = result.rows[0];
    return user_id;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;