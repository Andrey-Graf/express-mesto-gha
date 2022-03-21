const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadReqError = require('../errors/BadReqError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Ошибка авторизации'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь c таким "id" несуществует'));
      }
    })
    .catch(next);
};
// Поиск пользоателя по Id
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Пользователь c не корректным "id"'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь c таким "id" несуществует'));
      }
    })
    .catch(next);
};
// Создать пользователя.
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((userEmail) => {
      if (userEmail) {
        next(new ConflictError(`Пользователь с таким ${email} уже существует`));
      } else {
        bcrypt.hash(password, 10)
          .then((hash) => User.create({
            name,
            about,
            avatar,
            email,
            password: hash,
          }))
          .then((user) => res.status(200).send(user.toJSON()))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadReqError('Ошибка валидации'));
            } else if (err.name === 'MongoError' && err.code === 11000) {
              next(new ConflictError('Пользователь с таким email уже существует'));
            }
          })
          .catch(next);
      }
    });
};
// Обновить информацию создоного пользователя.
module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Переданы некорректные данные при обновлении профиля'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователя несуществует'));
      }
    })
    .catch(next);
};
// Обновить аватар пользователя.
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Переданы некорректные данные'));
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
      }).send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Необходимо авторизоваться');
    })
    .catch(next);
};