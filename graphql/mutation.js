const { v4: uuid } = require("uuid");

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
const invites = require("../src/invite.js");

const emailService = require("../src/email/email.js");
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
                    const result = await documents.execute('share', username, [args.docId, args.shareWithUsername, false]);

                    return result;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        },
        sendEmailInvite: {
            type: APIResponseType,
            description: 'Share document access rights with another non registred user via email',
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                docId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                console.log("sendEmailInvite mutation");
                const inviteToken = uuid();

                try {
                    // Add invite log to db
                    let result = await invites.execute('add', [inviteToken, args.email, args.docId]);

                    if (!result.success) {
                        console.log("Failed to add invite to db");

                        return {
                            success: false,
                            message: result.message
                        }
                    }

                    console.log("invite log added");

                    result = await emailService.sendInvite(username, inviteToken, args.email);

                    return result;
                } catch (e) {
                    return {
                        success: false,
                        message: e.message
                    }
                }
            }
        },
        acceptEmailInvite: {
            type: new GraphQLObjectType({
                name: "AcceptInviteResponse",
                fields: {
                    success: { type: GraphQLBoolean },
                    doc: { type: DocumentType },
                    message: { type: GraphQLString }
                }
            }),
            description: 'Accept recieved email invite to share document rights',
            args: {
                token: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async function (parent, args, context) {
                const activeUser = await middleware.verifyToken(context.req);
                const username = activeUser.username;

                console.log(`mutation accept invite: logged in user verified: ${username} `);

                try {
                    console.log("mutation accept invite: running verifyInvite");
                    let verifyInviteRes = await invites.execute('verify', args.token);

                    if (!verifyInviteRes.success) {
                        console.log("mutation accept invite: verifyInvite fail ");
                        return verifyInviteRes;
                    }

                    console.log("mutation accept invite: running share doc");
                    let docRes = await documents.execute('share', "", [verifyInviteRes.docId, username, true]);

                    if (!docRes.success) {
                        console.log("mutation accept invite: share doc fail ");
                        return result;
                    }

                    console.log("mutation accept invite: running useInvite");
                    useInviteRes = await invites.execute('use', args.token);

                    if (!useInviteRes.success) {
                        console.log("mutation accept invite: useInvite fail ");
                        return useInviteRes;
                    }

                    return docRes;
                } catch (e) {
                    return {
                        success: false,
                        message: e.message
                    }
                }
            }
        }
    })
});

module.exports = RootMutationType;
