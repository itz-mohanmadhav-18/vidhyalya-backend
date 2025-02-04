import {gql} from "apollo-server";
import principleDef from "./principleSchema.js";
import teacherDef from "./teacherSchema.js";

const typeDefs = [principleDef,teacherDef];

export default typeDefs;