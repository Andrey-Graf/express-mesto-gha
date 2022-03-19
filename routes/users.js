const userRouter = require('express').Router();

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');
const {
  validateUserById,
  validateUpdateUser,
  validateUpdateAvatar,
} = require('../middlewares/validators');

userRouter.get('/users', getUsers);
userRouter.get('/users/me', getCurrentUser);
userRouter.get('/users/:userId', validateUserById, getUserById);
userRouter.patch('/users/me', validateUpdateUser, updateUser);
userRouter.patch('/users/me/avatar', validateUpdateAvatar, updateAvatar);

module.exports = userRouter;