const {Client} = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const getToken = require('./auth');

const getAuthenticatedClient = async () => {
    const token = await getToken();

    const client = Client.init({
        authProvider: (done) => {
            done(null, token);
        }
    });

    return client;
};


module.exports = {
    getAuthenticatedClient
};


// const downloadFile = async (itemId) => {
//     const client = await getAuthenticatedClient();
//
//     try {
//         const response = await client.api(`/me/drive/items/${itemId}/content`).get();
//         return response;
//     } catch (error) {
//         console.error(error);
//     }
// };
//
// const listUsersWithAccess = async (itemId) => {
//     const client = await getAuthenticatedClient();
//
//     try {
//         const response = await client.api(`/me/drive/items/${itemId}/permissions`).get();
//         return response.value;
//     } catch (error) {
//         console.error(error);
//     }
// };