import { GraphQLScalarType } from "graphql";
import { v4 as uuidv4 } from "uuid";
import s3 from "../config/aws.js";
import db from "../config/knex.js";

const Upload = new GraphQLScalarType({
  name: "Upload",
  description: "The `Upload` scalar type represents a file upload.",
});

const resolvers = {
  Upload,
  Mutation: {
    uploadFile: async (_, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;
      const stream = createReadStream();
      const s3Key = `${uuidv4()}-${filename}`;

      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: stream,
        ContentType: mimetype,
      };

      const uploadResult = await s3.upload(uploadParams).promise();

      const fileRecord = {
        id: uuidv4(),
        filename,
        mimetype,
        encoding,
        s3_key: s3Key,
        s3_url: uploadResult.Location,
      };

      await db("uploaded_files").insert(fileRecord);
      return fileRecord;
    },
  },
};

export default resolvers;
