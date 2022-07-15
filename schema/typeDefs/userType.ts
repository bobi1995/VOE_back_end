const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
import { UserInterface } from "../interfaces/allInterfaces";

export const userType = gql`
  extend type Query {
    getAllUsers: [User]
    getSingleUser(id: String!): User
  }
  extend type Mutation {
    createUser(input: CreateUser!): User
    uploadAvatar(file: Upload, userId: String): File
    updateUser(input: UpdateUser, userId: String!): User
    deleteUser(userId: String): User
    changePassword(userId: String, newPassword: String): User
  }
  type User {
    _id: String!
    username: String!
    password: String!
    name: String!
    email: String
    position: String
    admin: Boolean!
    avatar: String
    regCaseIds: [Case] #Registrated Cases
    categoryId: [Category]
  }
  #Inputs
  input CreateUser {
    username: String!
    name: String!
    email: String
    admin: Boolean!
    position: String
    password: String!
  }
  input UpdateUser {
    username: String
    name: String
    email: String
    admin: Boolean
    position: String
  }
`;

export const userResolvers = {
  Query: {
    getAllUsers: async () => {
      return await UserModel.find().populate("categoryId regCaseIds");
    },
    getSingleUser: async (parentValue: any, args: { id: String }) => {
      return await UserModel.findById(args.id);
    },
  },
  Mutation: {
    createUser: async (
      parentValue: any,
      { input }: { input: UserInterface }
    ) => {
      const exist = await UserModel.findOne({ username: input.username });
      if (exist) {
        throw new Error("User already exists");
      } else {
        const hashedPassword = await bcrypt.hash(input.password, 12);

        const user = new UserModel({
          name: input.name,
          username: input.username,
          password: hashedPassword,
          email: input.email,
          position: input.position,
          admin: input.admin,
          regCaseIds: [],
          categoryId: [],
        });
        return user
          .save()
          .then((res: any) => {
            console.log(res);
            return res;
          })
          .catch((err: any) => {
            throw err;
          });
      }
    },

    uploadAvatar: async (parent: any, args: any) => {
      const { createReadStream, filename, mimetype, endcoding } = await args
        .file.file;
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exist");
      }

      const stream = createReadStream();
      const pathName = path.join(__dirname, `../../public/images`);

      //Check if there is already uploaded avatar and if there is deletes the directory avatar + file
      if (fs.existsSync(`${pathName}/${args.userId}/avatar`)) {
        fs.rmSync(`${pathName}/${args.userId}/avatar`, {
          recursive: true,
          force: true,
        });
      }

      //Creates new directory avatar
      fs.mkdirSync(`${pathName}/${args.userId}/avatar`, { recursive: true });

      //Saves file in the new directory avatar
      await stream.pipe(
        fs.createWriteStream(`${pathName}/${args.userId}/avatar/${filename}`)
      );

      //Saves avatar name in user.avatar field
      user.avatar = filename;
      await user.save();

      return {
        url: `${filename}`,
      };
    },

    updateUser: async (
      parentValue: any,
      { input, userId }: { input: UserInterface; userId: String }
    ) => {
      const exist = await UserModel.findById(userId);
      if (!exist) {
        throw new Error("User does not exists");
      }
      try {
        await UserModel.findOneAndUpdate(
          {
            _id: userId,
          },
          {
            $set: {
              name: input.name,
              username: input.username,
              email: input.email,
              position: input.position,
              admin: input.admin,
            },
          }
        );
        return exist._id;
      } catch (error) {
        throw new Error("Update failed");
      }
    },

    changePassword: async (
      parentValue: any,
      args: { userId: String; newPassword: String }
    ) => {
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exists");
      }
      try {
        const hashedPassword = await bcrypt.hash(args.newPassword, 12);

        await UserModel.findOneAndUpdate(
          {
            _id: args.userId,
          },
          {
            $set: {
              password: hashedPassword,
            },
          }
        );
        return user._id;
      } catch (error) {
        throw new Error("Password update failed");
      }
    },

    deleteUser: async (parentValue: any, args: { userId: String }) => {
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exists");
      }
      const pathName = path.join(__dirname, `../../public/images`);
      const filePath = `${pathName}\\${args.userId}`;
      fs.rmSync(filePath, { recursive: true, force: true });
      await UserModel.deleteOne({
        _id: args.userId,
      });

      return user._id;
    },
  },
};
