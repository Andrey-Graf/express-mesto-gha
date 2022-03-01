const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.status(200).send(cards))
    .catch((err) => {
      res.status(500).send({ message: `Ошибка сервера: ${err}` })
    })
}

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const  owner = req.user._id;
  Card.create({ name, link, owner })
    .then(card => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Ошибка при валидации: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
}

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        res.status(404).send({ message: 'Нельзя удалить чужую карточку' });
        return;
      } else {
        Card.deleteOne(card)
        .then((card) => res.status(200).send({ message: `Карточка ${card.id} успешно удалена` }))
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Передан некоректный "id": ${err}` });
        return;
      } else if (err.message === 'NotFound') {
        res.status(404).send({ message: `Карточка с данным "id" не существует: ${err}` })
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
}

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new Error('Error'))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Передан некоректный id: ${err}` });
        return;
      } else if (err.message === 'Error') {
        res.status(404).send({ message: `Карточка не найдена: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
}

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new Error('Error'))
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Передан некоректный id: ${err}` });
        return;
      } else if (err.message === 'Error') {
        res.status(404).send({ message: 'Карточка не найдена' });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    })
}