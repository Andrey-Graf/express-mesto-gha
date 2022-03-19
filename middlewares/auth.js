const jwt = require('jsonwebtoken');

module.exports.auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    next(res.status(401).send({ message: 'Необходима авторизация' }));
  }
  const token = !req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(res.status(401).send({ message: 'Необходима авторизация' }));
  }
  req.user = payload;
  next();
};