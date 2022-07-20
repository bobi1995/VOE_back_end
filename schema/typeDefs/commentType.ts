const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const AnswerModel = require("../../mongoModels/answer");
const CaseModel = require("../../mongoModels/case");
const CommentModel = require("../../mongoModels/comment");

export const commentType = gql`
extend type Mutation {
    createComment(
      caseId: String
      answerId:String
      userId: String!
      description: String
      attachments: [String]
    ): Comment
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
  // createComment:async()=>{

  // }
};
