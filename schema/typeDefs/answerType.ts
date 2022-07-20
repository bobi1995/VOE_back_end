const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const AnswerModel = require("../../mongoModels/answer");
const CaseModel = require("../../mongoModels/case");

export const answerType = gql`

  extend type Mutation {
    createAnswer(
      caseId: String!
      userId: String!
      description: String
      attachments: [String]
    ): Answer

    editAnswer(
      answerId: String!
      description: String
      attachments: [String]
    ): Answer
  }


  type Answer {
    _id: String
    date: String
    description: String
    attachments: [String]
    caseId: Case!
    userId: User!
    commentId: [Comment]
  }
`;

export const answerResolvers = {
  //Only mutations because you will fetch answers only with Case or User. You don't need answers without Case or User
  Mutation: {
    createAnswer: async (
      parentValue: any,
      args: {
        caseId: String;
        userId: String;
        description: String;
        attachments: [String];
      }
    ) => {
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exist");
      }
      const existingCase = await CaseModel.findById(args.caseId);
      if (!existingCase) {
        throw new Error("Case does not exist");
      }

      const newAnswer = new AnswerModel({
        description: args.description,
        date: new Date().toDateString(),
        attachments: args.attachments,
        caseId:args.caseId,
        userId:args.userId
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
      args: { answerId: String; description: String; attachments: [String] }
    ) => {
      const answer = await AnswerModel.findById(args.answerId);
      if (!answer) {
        throw new Error("Answer does not exist");
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
        throw new Error("Update failed");
      }
    },
  },
};
