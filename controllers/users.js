const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      if (users.length === 0) {
        res.status(404).send({ message: 'Пользователь не найден' });
        return;
      }
      res.status(200).send(users);
    })
    .catch((err) => res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` }))
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then(user => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Пользователь c не корректным "id": ${err}` });
        return;
      } else if (err.message === 'NotFound') {
        res.status(404).send({ message: `Пользователь c таким "id" несуществует: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then(user => res.status(200).send({ data: user.toJSON() }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Ошибка валидации: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
  )
    .orFail(new Error('NotFound'))
    .then(user => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные при обновлении профиля: ${err}` });
        return;
      } else if (err.message === 'NotFound') {
        res.status(404).send({ message: `Пользователя несуществует: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true }
  )
    .then(user => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
};