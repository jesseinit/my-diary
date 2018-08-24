import db from '../helpers/connection';

const query = {
  getAll: 'SELECT * from diaries WHERE email = $1'
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
}

export default Diary;
