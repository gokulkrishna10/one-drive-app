const oneDrive = require('../oneDrive')
const axios = require('axios')
const scopes = 'User.Read Files.ReadWrite';

exports.listFiles = async (req) => {
    const client = await oneDrive.getAuthenticatedClient();

    try {
        const response = await client.api(`/me/drive/root/children`).get();
        return response.value;
    } catch (error) {
        console.error(error);
        throw new Error('Error listing files');
    }
};

exports.redirect = async (req) => {
    const code = req.query.code;
    const tokenUrl = 'https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token';

    try {
        const tokenResponse = await axios.post(tokenUrl, querystring.stringify({
            client_id: 'b63d7271-720c-4c55-bb1c-b8fdf2db8cc2',
            scope: scopes,
            code: code,
            redirect_uri: 'http://localhost:8888/callback',
            grant_type: 'authorization_code',
            client_secret: '-pV8Q~Qze2TdMYVwLRlmZ~kd4vxXyP6FWj8I1aDR'
        }), {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });

        const accessToken = tokenResponse.data.access_token;

        // Step 3: Use the access token to call the Microsoft Graph API
        const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {'Authorization': `Bearer ${accessToken}`}
        });

        return graphResponse.data;

    } catch (error) {
        console.error(error);
        return error;
    }
}