import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import { merge } from "lodash";
import Auth from "./middlewares/auth";

//resolvers import
import { userResolvers } from "./schema/typeDefs/userType";
import { authResolvers } from "./schema/typeDefs/authType";
import { categoryResolvers } from "./schema/typeDefs/categoryType";
import { caseResolvers } from "./schema/typeDefs/caseType";
import { answerResolvers } from "./schema/typeDefs/answerType";

//typeDefsimport
import TypeDefs from "./schema/TypeDefs";

const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
const mongoose = require("mongoose");
const mongoUrl = require("./db/mongoDB");
const cors = require("cors");

async function startApolloServer(typeDefs: any, resolvers: any) {
  const app = express();
  app.use(cors());
  app.use(graphqlUploadExpress());
  app.use(Auth);

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>((resolve) =>
    mongoose
      .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        httpServer.listen({ port: 3001 }, resolve);
      })
  ).catch((err) => {
    console.log(err);
  });
  console.log(`🚀 Server ready at http://localhost:3001`);
}

startApolloServer(
  TypeDefs,
  merge(
    userResolvers,
    authResolvers,
    categoryResolvers,
    caseResolvers,
    answerResolvers
  )
);
