import { gql } from "graphql-tag";

const typeDefs = gql`
  scalar Upload

  type UploadFile {
    id: ID!
    filename: String!
    mimetype: String!
    encoding: String!
    s3_url: String!
  }

  type Mutation {
    uploadFile(file: Upload!): UploadFile
  }

  type Query {
    _empty: String
  }
`;

export default typeDefs;
