import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../helpers/connection';

const query = {
  find: 'SELECT * FROM users WHERE email = $1'
};

class User {
  /**
   * @description Creates a user for the application
   * @returns Token
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof User
   */
  static signUp(req, res) {
    const { email, fullname, password } = req.body;

    // Checks to see if the user has been registered
    db.query(query.find, [email])
      .then(result => {
        if (result.rowCount) {
          // Return if the email has been used
          res.status(409).json({ message: 'Email address already taken' });
        } else {
          bcrypt.hash(password, 10).then(hashedPassword => {
            db.query(query.regUser, [email, fullname, hashedPassword]).then(
              userData => {
                const token = jwt.sign(
                  { email, memberSince: userData.rows.created_on },
                  process.env.JWT_KEY,
                  { expiresIn: '1h' }
                );
                res
                  .status(201)
                  .json({ message: 'Registration Successful', token });
              }
            );
          });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  }
}
