const {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const UserInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    description: 'Userdata as input',
    fields: () => ({
        username: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) }
    })
})

module.exports = UserInputType;