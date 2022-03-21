const Card = require('../models/card');
const BadReqError = require('../errors/BadReqError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      next(err);
    });
};
// Создать карточку.
module.exports.createCard = (req, res, next) => {
  Card.create({
    name: req.body.name,
    link: req.body.link,
    owner: req.user._id,
  })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Ошибка при валидации'));
      }
    })
    .catch((err) => {
      next(err);
    });
};
// Удолить карточку( пользователь может удолить карточку только ту которую создал ).
module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        next(new ForbiddenError('Нельзя удалить чужую карточку'));
      } else {
        Card.deleteOne(card)
          .then((deletedCard) => res.status(200).send({ message: `Карточка ${deletedCard.id} успешно удалена` }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Передан некоректный "id"'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Карточка с данным "id" не существует'));
      }
    })
    .catch((err) => {
      next(err);
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
        next(new BadReqError('Передан некоректный "id"'));
      } else if (err.message === 'Error') {
        next(new NotFoundError('Карточка не найдена'));
      }
    })
    .catch((err) => {
      next(err);
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
        next(new BadReqError('Передан некоректный "id"'));
      } else if (err.message === 'Error') {
        next(new NotFoundError('Карточка не найдена'));
      }
    })
    .catch((err) => {
      next(err);
    });
};