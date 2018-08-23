import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyAuthToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'undefined') {
    res.status(403).json('Forbidden - Authentication Failed');
    return;
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
    if (err) {
      res
        .status(401)
        .json({ error: 'Unauthorised - Invalid Authencation Token', err });
      return;
    }
    req.authUser = decodedToken;
    next();
  });
  jwt.decode();
};

export default verifyAuthToken;
