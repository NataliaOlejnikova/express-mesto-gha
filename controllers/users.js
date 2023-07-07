const mongoose = require('mongoose');

const { ValidationError, CastError } = mongoose.Error;

const User = require('../models/user');

const {
  ERROR_BAD_REQUEST,
  ERROR_NOT_FOUND,
  ERROR_SERVER,
  SUCCESS_CREATED,
} = require('../utils/response-status');

const getUserList = (req, res) => {
  User.find({})
    .then((userList) => res.send({ data: userList }))
    .catch((error) => res.status(ERROR_SERVER).send(`Произошла ошибка на сервере: ${error}`));
};

const getUserId = (req, res) => {
  User.findById(req.params.userId)
    .then((selectedUser) => {
      if (selectedUser) {
        res.send({ data: selectedUser });
      } else {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Пользователь с указанным _id не найден' });
      }
    })
    .catch((error) => {
      if (error instanceof CastError) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Некорректный _id пользователя' });
      } else {
        res.status(ERROR_SERVER).send(`Произошла ошибка на сервере: ${error}`);
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((userObject) => res.status(SUCCESS_CREATED).send({ data: userObject }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      } else {
        res.status(ERROR_SERVER).send(`Произошла ошибка на сервере: ${error}`);
      }
    });
};

const updateUserData = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => res.send({ data: updatedData }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении профиля',
        });
      } else {
        res.status(ERROR_SERVER).send(`Произошла ошибка на сервере: ${error}`);
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedAvatar) => res.send({ data: updatedAvatar }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        res.status(ERROR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении аватара',
        });
      } else {
        res.status(ERROR_SERVER).send(`Произошла ошибка на сервере: ${error}`);
      }
    });
};

module.exports = {
  getUserList,
  getUserId,
  createUser,
  updateUserData,
  updateUserAvatar,
};
