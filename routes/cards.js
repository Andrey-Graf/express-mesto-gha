const cardRouter = require('express').Router();

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const {
  validateCreateCard,
  validateCardId,
} = require('../middlewares/validators');

cardRouter.get('/cards', getCards);
cardRouter.post('/cards', validateCreateCard, createCard);
cardRouter.delete('/cards/:cardId', validateCardId, deleteCard);
cardRouter.put('/cards/:cardId/likes', validateCardId, likeCard);
cardRouter.delete('/cards/:cardId/likes', validateCardId, dislikeCard);

module.exports = cardRouter;