const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList
} = require('graphql');

const DocumentType = new GraphQLObjectType({
    name: 'Document',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString },
        owner: { type: GraphQLNonNull(GraphQLString) },
        sharedWith: { type: GraphQLList(GraphQLString) }
    })
})

module.exports = DocumentType;