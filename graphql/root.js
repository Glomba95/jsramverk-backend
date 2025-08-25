const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLBoolean
} = require('graphql');

const UserType = require("./types/user.js");
const DocumentType = require("./types/document.js");

const auth = require("../src/auth.js");
const documents = require("../src/docs.js");

const middleware = require("../middleware/index.js");


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        verifyUser: {
            type: GraphQLBoolean,
            description: 'Checks for username in db',
            args: {
                username: { type: GraphQLString }
            },
            resolve: async function (parent, args) {
                const username = args.username;

                try {
                    const exists = await auth.execute('verify', username);

                    return exists;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        users: {
            type: GraphQLList(UserType),
            description: 'List of all users',
            resolve: async function (parent, args) {
                try {
                    const result = await auth.execute('list');

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }

            }
        },
        documents: {
            type: GraphQLList(DocumentType),
            description: 'List of documents this user can access',
            resolve: async function (parent, args, context) {
                // Verify token
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                try {
                    const result = await documents.execute('read', username, null);

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        }
    })
});

module.exports = RootQueryType;

