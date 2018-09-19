import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../helpers/connection';
import query from '../helpers/queries';

const SECRET_KEY = process.env.JWT_KEY;
class User {
  /**
   * @description Creates a user for the application
   * @returns Token
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof User
   */
  static async signUp(req, res, next) {
    try {
      const { email, fullname, password } = req.body;
      const usersFound = await pool.query(query.find, [email]);
      if (usersFound.rowCount > 0) {
        res.status(409).json({ message: 'Email address already taken' });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(query.regUser, [email, fullname, hashedPassword]);
      const token = jwt.sign({ email: newUser.rows[0].email }, SECRET_KEY, { expiresIn: '1h' });
      res.status(201).json({ message: 'Registration Successful', token });
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
  }

  /**
   * Login a user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof User
   */
  static logIn(req, res) {
    const email = req.body.email.toLowerCase();
    const { password } = req.body;
    db.query(query.find, [email])
      .then(userData => {
        if (userData.rowCount) {
          bcrypt.compare(password, userData.rows[0].password).then(result => {
            if (result) {
              // Password is Correct
              const token = jwt.sign(
                { email, memberSince: userData.rows[0].created_on },
                process.env.JWT_KEY,
                { expiresIn: '1h' }
              );
              res.status(200).json({ message: 'Logged in successfuly', token });
            } else {
              // Password is Incorrect
              res.status(401).send({ message: 'Email or Password is not correct 😕' });
            }
          });
        } else {
          res.status(404).send({ message: 'Email or Password is not correct 😩' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }
}

export default User;
