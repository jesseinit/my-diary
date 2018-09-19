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
   * @param {*} next
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
   * @description Loging users after they have provided correct credntials
   * @returns A token that signs/encodes the user's email
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof User
   */
  static async logIn(req, res, next) {
    try {
      const email = req.body.email.toLowerCase();
      const { password } = req.body;
      const usersFound = await pool.query(query.find, [email]);
      if (usersFound.rows.length < 1) {
        res.status(404).send({ message: 'No associated account with that email. 😩' });
        return;
      }
      const isPasswordValid = await bcrypt.compare(password, usersFound.rows[0].password);
      if (isPasswordValid) {
        const token = jwt.sign({ email: usersFound.rows[0].email }, SECRET_KEY, {
          expiresIn: '1h'
        });
        res.status(200).json({ message: 'Logged in successfuly', token });
      } else {
        res.status(401).send({ message: 'Email or Password is not correct 😕' });
      }
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
  }
}

export default User;
