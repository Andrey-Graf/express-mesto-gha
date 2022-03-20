const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` }));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(res.status(400).send({ message: `Ошибка авторизации: ${err}` }));
      } else if (err.message === 'NotFound') {
        next(res.status(404).send({ message: `Пользователь c таким "id" несуществует: ${err}` }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Поиск пользоателя по Id
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(res.status(400).send({ message: `Пользователь c не корректным "id": ${err}` }));
      } else if (err.message === 'NotFound') {
        next(res.status(404).send({ message: `Пользователь c таким "id" несуществует: ${err}` }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Создать пользователя.
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((userEmail) => {
      if (userEmail) {
        next(res.status(409).send({ message: 'Пользователь с таким email уже существует' }));
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
              next(res.status(400).send({ message: `Ошибка валидации: ${err}` }));
            } else if (err.name === 'MongoError' && err.code === 11000) {
              next(res.status(409).send({ message: `Пользователь с таким email уже существует: ${err}` }));
            }
            res.status(500).send({ message: `Ошибка сервера: ${err}` });
          });
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
        next(res.status(400).send({ message: `Переданы некорректные данные при обновлении профиля: ${err}` }));
      } else if (err.message === 'NotFound') {
        next(res.status(404).send({ message: `Пользователя несуществует: ${err}` }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Обновить аватар пользователя.
module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
      }).send({ token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(401).send({ message: `Необходимо авторизоваться: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};