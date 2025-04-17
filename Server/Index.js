import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "graphql-tools";
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema, uploads: false });

await server.start();

app.use(cors());
app.use(express.json());
app.use("/graphql", expressMiddleware(server));

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}/graphql`);
});
