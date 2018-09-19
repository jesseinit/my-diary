import 'babel-polyfill';
import { pool } from '../helpers/connection';
import query from '../helpers/queries';

class Diary {
  /**
   * @description Fetches all the users diaries
   * @returns All user's diaries
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static async getAllEntries(req, res, next) {
    try {
      const { email } = req.authUser;
      if (typeof req.query.id === 'undefined') {
        const diaries = await pool.query(query.getAll, [email]);
        if (diaries.rowCount > 0) {
          res.status(200).json(diaries.rows);
        } else {
          res.status(200).json({ message: 'No diary to display' });
        }
        return;
      }
      if (req.query.id !== 'null') {
        const moreDiaries = await pool.query(query.getMore, [email, req.query.id]);
        if (moreDiaries.rowCount > 0) {
          res.status(200).json(moreDiaries.rows);
        } else {
          res.status(200).json({ message: 'You have reached the end' });
        }
        return;
      }
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
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
  static async getSelectedEntries(req, res, next) {
    try {
      const { email } = req.authUser;
      const { id } = req.params;
      const diary = await pool.query(query.getOne, [email, id]);
      if (diary.rowCount) {
        res.status(200).json(diary.rows[0]);
      } else {
        res.status(404).json({ message: 'No diary to display' });
      }
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
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

  /**
   * @description Deletes a specified dairy
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static deleteSelectedEntry(req, res) {
    const { id } = req.params;
    const { email } = req.authUser;
    db.query(query.deleteOne, [email, id])
      .then(result => {
        if (result.rowCount) {
          res.status(200).json({ message: 'Story has been deleted' });
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
