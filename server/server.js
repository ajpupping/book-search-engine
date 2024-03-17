require('dotenv').config();

const express = require('express');
const path = require('path');

// Apollo set up
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');
// Import Graphql schema and resolvers
const { typeDefs, resolvers } = require('./schemas');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authData = authMiddleware({ req });
    return { authData };
  }
});

async function startApolloServer() {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Apollo middleware
  app.use('/graphql', expressMiddleware(server, {
    path: '/',
  }));

    // connect to the database
    await db.once('open', () => {
      console.log('connected to the database');
    });
  
  app.listen(PORT, () => {
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql}`);
      console.log(`🌍 Now listening on localhost:${PORT}`);
    });
}

  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }); 

startApolloServer().catch(error => {
  console.error('Failed to start the server' ,error);
});