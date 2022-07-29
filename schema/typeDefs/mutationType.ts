declare var require: any;
const { gql } = require('apollo-server-express');
const mutationType = gql`
  #Mutations
  type Mutation {
    _empty: String
  }
`;
export default mutationType;
