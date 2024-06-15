const msal = require('@azure/msal-node');

const msalConfig = {
    auth: {
        clientId: 'b63d7271-720c-4c55-bb1c-b8fdf2db8cc2',
        authority: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a',
        clientSecret: '-pV8Q~Qze2TdMYVwLRlmZ~kd4vxXyP6FWj8I1aDR',
        redirectUri: 'http://localhost:3000/auth/callback'
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

const getToken = async () => {
    const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
    };

    try {
        const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
        return response.accessToken;
    } catch (error) {
        console.error(error);
    }
};

module.exports = getToken;