declare var require: any;
const { gql } = require('apollo-server-express');
const otherType = gql`
  scalar Upload

  type File {
    url: String
  }
`;

export default otherType;
