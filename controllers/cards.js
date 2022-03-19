const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Создать карточку.
module.exports.createCard = (req, res) => {
  Card.create({
    name: req.body.name,
    link: req.body.link,
    owner: req.user._id,
  })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Ошибка при валидации: ${err}` });
        return;
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Удолить карточку( пользователь может удолить карточку только ту которую создал ).
module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        next(res.status(403).send({ message: 'Нельзя удалить чужую карточку' }));
      } else {
        Card.deleteOne(card)
          .then((deletedCard) => res.status(200).send({ message: `Карточка ${deletedCard.id} успешно удалена` }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(res.status(400).send({ message: `Передан некоректный "id": ${err}` }));
      } else if (err.message === 'NotFound') {
        next(res.status(404).send({ message: `Карточка с данным "id" не существует: ${err}` }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Поставить like понравившейся карточке.
module.exports.likeCard = (req, res, next) => {
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
        next(res.status(400).send({ message: `Передан некоректный id: ${err}` }));
      } else if (err.message === 'Error') {
        next(res.status(404).send({ message: `Карточка не найдена: ${err}` }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};
// Отменить like понравившейся карточке.
module.exports.dislikeCard = (req, res, next) => {
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
        next(res.status(400).send({ message: `Передан некоректный id: ${err}` }));
      } else if (err.message === 'Error') {
        next(res.status(404).send({ message: 'Карточка не найдена' }));
      }
      res.status(500).send({ message: `Ошибка сервера: ${err}` });
    });
};