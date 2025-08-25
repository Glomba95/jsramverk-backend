const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLID,
    GraphQLBoolean
} = require('graphql');

const UserType = require("./types/user.js");
const UserInputType = require("./types/userinput.js");
const DocumentType = require("./types/document.js");
const DocInputType = require("./types/docinput.js");
const APIResponseType = require("./types/apiresponse.js")

const auth = require("../src/auth.js");
const documents = require("../src/docs.js");

const middleware = require("../middleware/index.js");

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        loginUser: {
            type: APIResponseType,
            description: 'Login user',
            args: {
                user: { type: new GraphQLNonNull(UserInputType) }
            },
            resolve: async function (parent, args) {
                try {
                    const result = await auth.execute('login', args.user);

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        registerUser: {
            type: APIResponseType,
            description: 'Register user',
            args: {
                user: { type: new GraphQLNonNull(UserInputType) }
            },
            resolve: async function (parent, args) {
                try {
                    const result = await auth.execute('register', args.user);

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        createDoc: {
            type: DocumentType,
            description: 'Create a new document',
            args: {
                document: { type: new GraphQLNonNull(DocInputType) }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);

                const doc = {
                    ...args.document,
                    owner: activeUser.username,
                    sharedWith: []
                };

                try {
                    const result = await documents.execute('create', null, doc);
                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        updateDoc: {
            type: GraphQLBoolean,
            description: 'Update an existing document',
            args: {
                docId: { type: new GraphQLNonNull(GraphQLID) },
                doc: { type: DocInputType }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                try {
                    await documents.execute('update', username, [args.docId, args.doc]);
                    return true;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        deleteDoc: {
            type: GraphQLBoolean,
            description: 'Delete an existing document',
            args: {
                docId: { type: new GraphQLNonNull(GraphQLID) },
                doc: { type: DocInputType }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                try {
                    await documents.execute('delete', username, args.docId);
                    return true;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        shareDoc: {
            type: APIResponseType,
            description: 'Share document access rights with another user',
            args: {
                docId: { type: new GraphQLNonNull(GraphQLID) },
                shareWithUsername: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                try {
                    const result = await documents.execute('share', username, [args.docId, args.shareWithUsername]);

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        }
    })
});

module.exports = RootMutationType;
