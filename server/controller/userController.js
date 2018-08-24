import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../helpers/connection';

const query = {
  find: 'SELECT * FROM users WHERE email = $1',
  regUser: 'INSERT INTO users (email,fullname,password) VALUES ( $1, $2, $3) RETURNING *'
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
            db.query(query.regUser, [email, fullname, hashedPassword]).then(userData => {
              const token = jwt.sign(
                { email, memberSince: userData.rows.created_on },
                process.env.JWT_KEY,
                { expiresIn: '1h' }
              );
              res.status(201).json({ message: 'Registration Successful', token });
            });
          });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
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
