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
      if (req.query.id) {
        const moreDiaries = await pool.query(query.getMore, [email, req.query.id]);
        if (moreDiaries.rowCount > 0) {
          res.status(200).json(moreDiaries.rows);
          return;
        }
        res.status(200).json({ message: 'You have reached the end' });
      }
      const diaries = await pool.query(query.getAll, [email]);
      if (diaries.rowCount > 0) {
        res.status(200).json(diaries.rows);
        return;
      }
      res.status(200).json({ message: 'No diary to display' });
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
  static async createNewEntry(req, res, next) {
    try {
      const { email } = req.authUser;
      const title = req.body.title || 'Untitled Diary';
      const content = req.body.content || 'Empty content';
      const result = await pool.query(query.saveDiary, [email, title, content]);
      res.status(201).json({ message: 'Story Created', result: result.rows[0] });
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
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
  static async updateSelectedEntry(req, res, next) {
    try {
      const { email } = req.authUser;
      const { id } = req.params;
      const { title, content } = req.body;
      const updated = new Date();
      const result = await pool.query(query.getOne, [email, id]);
      if (!result.rowCount) {
        res.status(404).json({ message: 'Story not found' });
        return;
      }
      const dateCreated = new Date(result.rows[0].created_on).getTime();
      const difference = (new Date().getTime() - dateCreated) / (1000 * 60 * 60);
      if (difference > 24) {
        res.status(403).json({ message: 'Story is too old' });
        return;
      }
      const updateData = await pool.query(query.updateOne, [title, content, updated, email, id]);
      res.status(200).json({ message: 'Story has been updated', data: updateData.rows[0] });
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
  }

  /**
   * @description Deletes a specified dairy
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof Diary
   */
  static async deleteSelectedEntry(req, res, next) {
    try {
      const { id } = req.params;
      const { email } = req.authUser;
      const result = await pool.query(query.deleteOne, [email, id]);
      if (result.rowCount) {
        res.status(200).json({ message: 'Story has been deleted' });
      } else {
        res.status(404).json({ message: 'Story not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
  }
}

export default Diary;
