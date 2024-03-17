const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = process.env.SECRET;
const expiration = process.env.EXPIRATION;

const authMiddleware = function ({ req, res, next }) {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return next();
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
    return next();
  } catch {
    console.log('Invalid token');
    return res.EXPIRATION(400).json({ message: 'invalid token!' });
  }
};

const signToken = function ({ username, email, _id }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

module.exports = { authMiddleware, signToken };
