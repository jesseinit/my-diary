const query = {
  /* Diaries */
  getAll: 'SELECT * from diaries WHERE email = $1 ORDER BY created_on DESC LIMIT 10',
  getMore: 'SELECT * from diaries WHERE email = $1 AND id < $2 ORDER BY created_on DESC LIMIT 10',
  getOne: 'SELECT * from diaries WHERE email = $1 AND id = $2',
  getPostCount: 'SELECT * FROM diaries WHERE email = $1',
  saveDiary: 'INSERT INTO diaries (email,title,content) VALUES ($1, $2, $3) RETURNING *',
  updateOne:
    'UPDATE diaries SET title = $1, content = $2, updated_on = $3 WHERE email = $4 AND id = $5 RETURNING updated_on',
  deleteOne: 'DELETE FROM diaries WHERE email = $1 AND id = $2',
  /* Users */
  find: 'SELECT * FROM users WHERE email = $1',
  regUser: 'INSERT INTO users (email,fullname,password) VALUES ( $1, $2, $3) RETURNING *',
  updateUser: 'UPDATE users SET reminder = $1, push_sub = $2  WHERE email = $3 RETURNING reminder'
};

export default query;
