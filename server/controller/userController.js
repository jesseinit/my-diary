import 'babel-polyfill';
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

  /**
   * @description Gets the user profile information when they navigate to their profile page
   * @returns User Fullname,Reminder preference, PostCount and Date of Registration
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof User
   */
  static async getProfile(req, res, next) {
    try {
      const { email } = req.authUser;
      const usersDetails = await pool.query(query.find, [email]);
      const postCount = await pool.query(query.getPostCount, [email]);
      const { fullname, reminder } = usersDetails.rows[0];
      res.status(200).json({
        fullname,
        reminder,
        postCount: postCount.rowCount,
        memberSince: usersDetails.rows[0].created_on
      });
    } catch (error) {
      res.status(500).json({ message: error });
      next(error);
    }
  }

  /**
   * @description Updates the user profile information when they navigate to their profile page
   * @returns Reminder State and PushSubscription Object (Stored in JSON format)
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof User
   */
  static async updateProfile(req, res, next) {
    try {
      const { email } = req.authUser;
      const { reminder, pushSubscription } = req.body;
      const user = await pool.query(query.updateUser, [reminder, pushSubscription, email]);
      res
        .status(200)
        .json({ reminder: user.rows[0].reminder, subscription: user.rows[0].push_sub });
    } catch (error) {
      res.status(500).json({ message: error });
      next();
    }
  }
}

export default User;
