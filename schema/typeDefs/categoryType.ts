const { gql } = require("apollo-server-express");
const CategoryModel = require("../../mongoModels/category");
const UserModel = require("../../mongoModels/user");

export const categoryType = gql`
  extend type Query {
    getAllCategories: [Category]
  }
  extend type Mutation {
    addCategory(name: String!, description: String): Category
    updateCategory(
      categoryId: String!
      name: String
      description: String
    ): Category
    deleteCategory(categoryId: String!): Category
    addExperts(userId: String!, categoryId: String!): Category
    removeExperts(userId: String!, categoryId: String!): Category
  }
  type Category {
    _id: String!
    name: String!
    description: String
    expertUserIds: [User]
    caseIds: [Case]
  }
`;

export const categoryResolvers = {
  Query: {
    getAllCategories: async () => {
      return await CategoryModel.find().populate("expertUserIds caseIds");
    },
  },
  Mutation: {
    addCategory: async (
      parentValue: any,
      args: { name: String; description: String }
    ) => {
      const category = await CategoryModel.findOne({ name: args.name });
      if (category) {
        throw new Error("Category already exists");
      }

      const newCategory = new CategoryModel({
        name: args.name,
        description: args.description,
        caseIds: [],
        expertUserIds: [],
      });
      return newCategory
        .save()
        .then((res: any) => {
          return res;
        })
        .catch((err: any) => {
          throw err;
        });
    },

    updateCategory: async (
      parentValue: any,
      {
        categoryId,
        name,
        description,
      }: { categoryId: String; name: String; description: String }
    ) => {
      const exist = await CategoryModel.findById(categoryId);
      if (!exist) {
        throw new Error("Category does not exists");
      }
      try {
        await CategoryModel.findOneAndUpdate(
          {
            _id: categoryId,
          },
          {
            $set: {
              name,
              description,
            },
          }
        );
        return exist._id;
      } catch (error) {
        throw new Error("Update failed");
      }
    },

    //Add Expert User to specific category. Also you record Category to the User's expertise.
    addExperts: async (
      parentValue: any,
      args: { categoryId: String; userId: String }
    ) => {
      const category = await CategoryModel.findById(args.categoryId);
      if (!category) {
        throw new Error("Category does not exists");
      }
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exists");
      }
      if (category.expertUserIds && category.expertUserIds.includes(user._id)) {
        throw new Error("Category already added");
      }
      category.expertUserIds.push(user);
      await category.save();
      user.categoryId.push(category);
      await user.save();

      return category;
    },

    //Remove Expert User from specific category. Also you remove Category from the User's expertise.
    removeExperts: async (
      parentValue: any,
      args: { categoryId: String; userId: String }
    ) => {
      const category = await CategoryModel.findById(args.categoryId);
      if (!category) {
        throw new Error("Category does not exists");
      }
      const user = await UserModel.findById(args.userId);
      if (!user) {
        throw new Error("User does not exists");
      }

      await CategoryModel.updateOne(
        { _id: category._id },
        { $pull: { expertUserIds: { $in: user._id } } }
      );
      await UserModel.updateOne(
        { _id: user._id },
        { $pull: { categoryId: { $in: category._id } } }
      );

      return category;
    },
    deleteCategory: async (parentValue: any, args: { categoryId: String }) => {
      const category = await CategoryModel.findById(args.categoryId);
      if (!category) {
        throw new Error("Category does not exists");
      }
      if (category.expertUserIds && category.expertUserIds.length > 0) {
        category.expertUserIds.map(async (userId: String) => {
          await UserModel.updateOne(
            { _id: userId },
            { $pull: { categoryId: { $in: category._id } } }
          );
        });
      }
      await CategoryModel.deleteOne({
        _id: args.categoryId,
      });

      return category._id;
    },
  },
};
