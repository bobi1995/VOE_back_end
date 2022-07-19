const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const AnswerModel = require("../../mongoModels/answer");
const CaseModel = require("../../mongoModels/case");
const CommentModel = require("../../mongoModels/comment");

export const commentType = gql`
  extend type Query {
    getCaseAnswers(caseId: String): [Answer]
  }
  type Comment {
    _id: String
    date: String
    description: String
  }
`;

export const commentResolvers = {
  //Only mutations
};
