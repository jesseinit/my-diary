const query = {
  /* Diaries */
  getAll: email => ({
    text: `SELECT d.* FROM diaries d 
          JOIN users u ON u.email = d.email 
          WHERE u.email = $1 ORDER BY d.created_on DESC LIMIT 10`,
    values: [email]
  }),
  getMore: (email, id) => ({
    text: `SELECT d.* FROM diaries d 
          JOIN users u ON u.email = d.email 
          WHERE u.email = $1 AND d.id < $2 ORDER BY d.created_on DESC LIMIT 10`,
    values: [email, id]
  }),

  getOne: (email, id) => ({
    text: `SELECT d.* from diaries d 
          JOIN users u ON u.email = d.email
          WHERE u.email = $1 AND d.id = $2`,
    values: [email, id]
  }),

  saveDiary: (email, title, content) => ({
    text: 'INSERT INTO diaries (email,title,content) VALUES ($1, $2, $3) RETURNING *',
    values: [email, title, content]
  }),
  updateDairy: (title, content, updatedOn, email, id) => ({
    text: `UPDATE diaries SET title = $1, content = $2, updated_on = $3 WHERE email = $4 AND id = $5 RETURNING updated_on`,
    values: [title, content, updatedOn, email, id]
  }),
  deleteDiary: (email, id) => ({
    text: `DELETE FROM diaries d WHERE d.email = $1 AND d.id = $2`,
    values: [email, id]
  }),

  /* Users */
  findUser: email => ({
    text: `SELECT * FROM users WHERE email = $1`,
    values: [email]
  }),
  regUser: (email, fullname, password) => ({
    text: `INSERT INTO users (email,fullname,password) VALUES ( $1, $2, $3) RETURNING *`,
    values: [email, fullname, password]
  }),
  getPostCount: email => ({
    text: `SELECT d.* FROM diaries d JOIN users u ON u.email = d.email WHERE u.email = $1`,
    values: [email]
  }),
  updateUser: (reminder, pushSub, email) => ({
    text: `UPDATE users SET reminder = $1, push_sub = $2  WHERE email = $3 RETURNING reminder`,
    values: [reminder, pushSub, email]
  })
};

export default query;
