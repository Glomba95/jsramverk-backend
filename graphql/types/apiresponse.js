// ./graphql/types/response.js
const {
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLString
} = require('graphql');

const APIResponseType = new GraphQLObjectType({
    name: 'APIResponse',
    description: 'Standard API response',
    fields: () => ({
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        errorType: { type: GraphQLString },
        token: { type: GraphQLString }
    })
});

module.exports = APIResponseType;
