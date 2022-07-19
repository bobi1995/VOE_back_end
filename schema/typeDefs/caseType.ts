const { gql } = require("apollo-server-express");
const CaseModel = require("../../mongoModels/case");
const UserModel = require("../../mongoModels/user");
const CategoryModel = require("../../mongoModels/category");

import { CaseInterface } from "../interfaces/allInterfaces";

export const caseType = gql`
  extend type Query {
    getAllCases: [Case]
    getSingleCase(caseId: String): Case
  }

  extend type Mutation {
    createCase(input: CreateCase!): Case
  }

  type Case {
    _id: String!
    description: String!
    date: String
    signature: String
    attachments: [String]
    priority: Int
    status: Int
    categoryId: [Category!]! #All categories case belongs to
    senderId: User!
    answerId: [Answer] #All answers given to case
    commentId: [Comment] #All comments given to case
  }

  #Inputs
  input CreateCase {
    description: String!
    date: String
    signature: String
    attachments: [String] #Pass Array of File Names
    priority: Int
    status: Int
    categoryId: [String!]! #Pass Array of Category Ids
    senderId: String! #Pass User Id
  }
`;

export const caseResolvers = {
  Query: {
    getAllCases: async () => {
      return await CaseModel.find().populate(
        "categoryId senderId answerId commentId"
      );
    },
    getSingleCase: async (parentValue: any, args: { caseId: String }) => {
      return await CaseModel.findById(args.caseId).populate(
        "categoryId senderId answerId commentId"
      );
    },
  },
  Mutation: {
    createCase: async (
      parentValue: any,
      { input }: { input: CaseInterface }
    ) => {
      const user = await UserModel.findById(input.senderId);
      if (!user) {
        throw new Error("User does not exist");
      }
      const category = await CategoryModel.find({
        _id: { $in: input.categoryId },
      });
      if (!category && category.length === 0) {
        throw new Error("Categories do not exist");
      }

      const newCase = new CaseModel({
        description: input.description,
        date: new Date().toDateString(),
        priority: input.priority,
        status: 0,
        categoryId: input.categoryId,
        signature: input.signature,
        attachments: input.attachments,
        senderId: input.senderId,
        answerId: [],
        commentId: [],
      });

      return newCase
        .save()
        .then((res: any) => {
          return res;
        })
        .then((res: any) => {
          console.log(user);
          user.regCaseIds.push(res._id);
          user.save();
          return res;
        })
        .then((res: any) => {
          category.map(async (el: any) => {
            el.caseIds.push(res._id);
            await el.save();
          });
          return res;
        })
        .catch((err: any) => {
          throw err;
        });
    },
  },
};
