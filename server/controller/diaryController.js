import db from '../helpers/connection';

const query = {
  getAll: 'SELECT * from diaries WHERE email = $1',
  saveDiary: 'INSERT INTO diaries (email,title,content) VALUES ($1, $2, $3) RETURNING *',
  getOne: 'SELECT * from diaries WHERE email = $1 AND id = $2',
  updateOne:
    'UPDATE diaries SET title = $1, content = $2, updated_on = $3 WHERE email = $4 AND id = $5 RETURNING updated_on'
};

class Diary {
  /**
   *@description Fetches all the users diaries
   * @returns All user's diaries
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static getAllEntries(req, res) {
    const { email } = req.authUser;

    db.query(query.getAll, [email])
      .then(results => {
        if (results.rowCount) {
          res.status(200).json(results.rows);
        } else {
          res.status(404).json({ message: 'No record found' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }

  /**
   * @description Creates a new diary post
   * @returns Created diary entry
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static createNewEntry(req, res) {
    const { title, content } = req.body;
    const { email } = req.authUser;

    db.query(query.saveDiary, [email, title, content])
      .then(result => {
        res.status(201).json({ message: 'Story Created', result: result.rows[0] });
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }

  /**
   * @description Gets a specific diary
   * @returns A single diary
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static getSelectedEntries(req, res) {
    const { email } = req.authUser;
    const { id } = req.params;

    db.query(query.getOne, [email, id])
      .then(result => {
        if (result.rowCount) {
          res.status(200).json(result.rows);
        } else {
          res.status(404).json({ message: 'No record found' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }

  /**
   * @description Updates user diary
   * @returns Updated diary
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static updateSelectedEntry(req, res) {
    const { email } = req.authUser;
    const { id } = req.params;
    const { title, content } = req.body;
    const updated = new Date();

    db.query(query.getOne, [email, id])
      .then(result => {
        if (result.rowCount) {
          const dateCreated = new Date(result.rows[0].created_on).getTime();
          const difference = (new Date().getTime() - dateCreated) / (1000 * 60 * 60);

          if (difference > 24) {
            res.status(403).json({ message: 'Story is too old' });
          } else {
            db.query(query.updateOne, [title, content, updated, email, id]).then(updateData => {
              res.status(200).json({ message: 'Story has been updated', updateData });
            });
          }
        } else {
          res.status(404).json({ message: 'Story not found' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }
}

export default Diary;
