const {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const DocInputType = new GraphQLInputObjectType({
    name: 'DocInput',
    description: 'Input type for creating or updating a document',
    fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString }
    })
});

module.exports = DocInputType;
