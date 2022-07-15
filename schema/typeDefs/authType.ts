const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const authType = gql`
  extend type Query {
    login(username: String, password: String): Auth
  }
  type Auth {
    userId: String!
    token: String!
    tokenExpiration: Int!
  }
`;

export const authResolvers = {
  Query: {
    login: async (
      parentValue: any,
      args: { username: String; password: String }
    ) => {
      const user = await UserModel.findOne({ username: args.username });
      if (!user) {
        throw new Error("User does not exists");
      }
      const isEqual = await bcrypt.compare(args.password, user.password);
      if (!isEqual) {
        throw new Error("Wrong password");
      }
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
        },
        "supersecterkey123!",
        {
          expiresIn: "1h",
        }
      );
      return {
        userId: user._id,
        token,
        tokenExpiration: 8,
      };
    },
  },
};
