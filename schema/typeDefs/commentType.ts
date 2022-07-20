const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const AnswerModel = require("../../mongoModels/answer");
const CaseModel = require("../../mongoModels/case");
const CommentModel = require("../../mongoModels/comment");

export const commentType = gql`
extend type Mutation {
    creatComment(
      caseId: String
      answerId:String
      userId: String!
      description: String
      attachments: [String]
    ): Comment

    editAnswer(
      answerId: String!
      description: String
      attachments: [String]
    ): Answer
  }
  type Comment {
    _id: String
    date: String
    description: String
    caseId: Case
    userId: User!
    answerId: Comment
  }
`;

export const commentResolvers = {
  //Only mutations
};
