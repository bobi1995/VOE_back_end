declare var require: any;

const { gql } = require('apollo-server-express');
const UserModel = require('../../mongoModels/user');
const AnswerModel = require('../../mongoModels/answer');
const CaseModel = require('../../mongoModels/case');
const CommentModel = require('../../mongoModels/comment');

export const answerType = gql`
  extend type Mutation {
    createAnswer(
      caseId: String!
      description: String
      attachments: [String]
    ): Answer

    #You can change only description and attachments on comment. CaseId/Comments/UserId not changable
    editAnswer(
      answerId: String!
      description: String
      attachments: [String]
    ): Answer

    deleteAnswer(answerId: String!): Answer
  }

  type Answer {
    _id: String
    date: String
    description: String
    attachments: [String]
    caseId: Case! #For which case Answer is
    userId: User! #Sender ID
    commentId: [Comment] #Possible comments on Answer
  }
`;

export const answerResolvers = {
  //Only mutations because you will fetch answers only with Case or User. You don't need answers without Case or User
  Mutation: {
    //Creating answer and adding it to User's answers and Case's answers (documentation - Answer Page, Method 1)
    createAnswer: async (
      parentValue: any,
      args: {
        caseId: String;
        description: String;
        attachments: [String];
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
      const existingCase = await CaseModel.findById(args.caseId);
      if (!existingCase) {
        throw new Error('Case does not exist');
      }

      const newAnswer = new AnswerModel({
        description: args.description,
        date: new Date().toDateString(),
        attachments: args.attachments,
        caseId: args.caseId,
        userId: context.userId,
      });

      return newAnswer
        .save()
        .then((res: any) => {
          return res;
        })
        .then((res: any) => {
          user.answerId.push(res._id);
          user.save();
          return res;
        })
        .then((res: any) => {
          existingCase.answerId.push(res._id);
          existingCase.save();
          return res;
        })
        .catch((err: any) => {
          throw err;
        });
    },

    editAnswer: async (
      parentValue: any,
      args: { answerId: String; description: String; attachments: [String] },
      context: any
    ) => {
      if (!context.isAuth) {
        throw new Error('You must authenticate!');
      }
      const answer = await AnswerModel.findById(args.answerId);
      if (!answer) {
        throw new Error('Answer does not exist');
      }

      //checking if logged user is owner of the answer
      if (answer.userId !== context.userId) {
        throw new Error('You are not owner of the answer');
      }

      try {
        await AnswerModel.findOneAndUpdate(
          {
            _id: args.answerId,
          },
          {
            $set: {
              description: args.description,
              attachments: args.attachments,
            },
          }
        );
        return answer._id;
      } catch (error) {
        throw new Error('Update failed');
      }
    },

    deleteAnswer: async (
      parentValue: any,
      args: { answerId: String; description: String; attachments: [String] }
    ) => {
      const answer = await AnswerModel.findById(args.answerId);
      if (!answer) {
        throw new Error('Answer does not exist');
      }

      //Checking if Answer have comments on it
      if (answer.commentId && answer.commentId.length > 0) {
        //If there are comments we loop through all of them
        answer.commentId.map(async (comment: String) => {
          // Finding Answer's Comments
          const answerComment = await CommentModel.findById(comment);
          if (answerComment) {
            //Finding Comment's owner and extracting the comment from his Records
            const commentUser = await UserModel.findById(answerComment.userId);
            if (commentUser) {
              await UserModel.updateOne(
                { _id: commentUser.userId },
                { $pull: { commentId: { $in: comment } } }
              );
            }
          }
          //Deleting the comment
          await CommentModel.deleteOne({
            _id: comment,
          });
        });
      }

      // Deleting the answer
      await AnswerModel.deleteOne({
        _id: args.answerId,
      });

      return answer._id;
    },
  },
};
