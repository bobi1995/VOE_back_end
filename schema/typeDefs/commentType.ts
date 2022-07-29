declare var require: any;
const { gql } = require('apollo-server-express');
const UserModel = require('../../mongoModels/user');
const AnswerModel = require('../../mongoModels/answer');
const CaseModel = require('../../mongoModels/case');
const CommentModel = require('../../mongoModels/comment');

export const commentType = gql`
  extend type Mutation {
    createComment(
      caseId: String
      answerId: String
      description: String
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
  Mutation: {
    createComment: async (
      parentValue: any,
      args: {
        caseId: String;
        description: String;
        answerId: String;
      },
      context: any
    ) => {
      if (!context.isAuth) {
        throw new Error('You must authenticate!');
      }
      const user = await UserModel.findById(context.userId);
      if (!user) {
        throw new Error('User does not exist');
      }

      let newComment: any;
      let existingCase: any;
      let existingAnswer: any;

      // Scenario 1: If it it comment for case
      if (args.caseId) {
        existingCase = await CaseModel.findById(args.caseId);
        if (!existingCase) {
          throw new Error('Case does not exist');
        }
        newComment = new CommentModel({
          description: args.description,
          date: new Date().toDateString(),
          caseId: args.caseId,
          userId: context.userId,
        });
      }
      // Scenario 2: If it it comment for Answer
      else if (args.answerId) {
        existingAnswer = await AnswerModel.findById(args.answerId);
        if (!existingAnswer) {
          throw new Error('Answer does not exist');
        }
        newComment = new CommentModel({
          description: args.description,
          date: new Date().toDateString(),
          caseId: args.caseId,
          userId: context.userId,
        });
      }

      return newComment
        .save()
        .then((res: any) => {
          return res;
        })
        .then((res: any) => {
          user.commentId.push(res._id);
          user.save();
          return res;
        })
        .then((res: any) => {
          if (args.caseId) {
            existingCase.commentId.push(res._id);
            existingCase.save();
          } else if (args.answerId) {
            existingAnswer.commentId.push(res._id);
            existingAnswer.save();
          }
          return res;
        })
        .catch((err: any) => {
          throw err;
        });
    },
  },
};
