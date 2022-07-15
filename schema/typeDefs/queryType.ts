const { gql } = require("apollo-server-express");
const queryType = gql`
  #Queries
  type Query {
    _empty: String
  }
`;
export default queryType;
