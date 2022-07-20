const { gql } = require("apollo-server-express");
const UserModel = require("../../mongoModels/user");
const AnswerModel = require("../../mongoModels/answer");
const CaseModel = require("../../mongoModels/case");
const CommentModel = require('../../mongoModels/comment')

export const answerType = gql`

  extend type Mutation {
    createAnswer(
      caseId: String!
      userId: String!
      description: String
      attachments: [String]
    ): Answer

#You can change only description and attachments on comment. CaseId/Comments/UserId not changable 
    editAnswer(
      answerId: String!
      description: String 
      attachments: [String]
    ): Answer

    deleteAnswer(answerId:String!):Answer
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

    //TO_ADD_LATER: 1. Authentication; 2. Only Answer's creator can edit his answer
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


    deleteAnswer: async (
      parentValue: any,
      args: { answerId: String; description: String; attachments: [String] }
    ) => {
      const answer = await AnswerModel.findById(args.answerId);
      if (!answer) {
        throw new Error("Answer does not exist");
      }
      
      //Checking if Answer have comments on it
      if(answer.commentId && answer.commentId.length>0){
        //If there are comments we loop through all of them
        answer.commentId.map(async (comment: String) => {
          // Finding Answer's Comment
         const answerComment = await CommentModel.findById(comment)
         if(answerComment){
          //Finding Comment's owner and extracting the comment from his Records
          const commentUser = await UserModel.findById(answerComment.userId)
          if(commentUser){
            await UserModel.updateOne(
              { _id: commentUser.userId },
              { $pull: { commentId: { $in: comment} } }
            );
          }  
         }
         //Deleting the comment
        await CommentModel.deleteOne({
          _id:comment
         })
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
