const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (_, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Not logged in');
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
        loginUser: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },

    },

        me: async (_, args, context) => {
            if (!context.authData) {
                throw new Error('Not authenticated');
            }
        },
};
