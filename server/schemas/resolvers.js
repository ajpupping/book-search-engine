// resolvers.js
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (_, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Please log in to continue.');
            }
            return User.findById(context.user._id);
        },
    },
    Mutation: {
        addUser: async (_, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect username or password');
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect username or password');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_, { bookInput }, context) => {
            if (!context.user) {
                throw new AuthenticationError('Please log in and try again.');
            }

            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookInput } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },
        removeBook: async (_, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('Please log in and try again.');
            }

            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        },
    },
};

module.exports = resolvers;
