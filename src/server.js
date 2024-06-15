const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 3000;

const clientId = 'b63d7271-720c-4c55-bb1c-b8fdf2db8cc2';
const clientSecret = '-pV8Q~Qze2TdMYVwLRlmZ~kd4vxXyP6FWj8I1aDR';
const tenant = '1609a215-5dce-457c-8351-08717e87f27d'; // or your tenant ID
const scopes = 'User.Read Files.Read Files.Read.All Files.ReadWrite.All';
const webhookNotificationUrl = `http://yourserver.com/webhook`;

// Function to get device code
async function getDeviceCode() {
    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/devicecode`;
    const params = querystring.stringify({
        client_id: clientId,
        scope: scopes
    });

    const response = await axios.post(url, params, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

    return response.data;
}

// Function to poll for token
async function pollForToken(deviceCode, interval) {
    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const params = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode
    };

    while (true) {
        try {
            const response = await axios.post(url, params, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            if (response.data.access_token) {
                return response.data.access_token;
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error === 'authorization_pending') {
                // Authorization is still pending, continue polling
            } else {
                throw error;
            }
        }

        await new Promise(resolve => setTimeout(resolve, interval * 1000)); // Poll every interval seconds
    }
}

// Function to get OneDrive files
async function getOneDriveFiles(accessToken) {
    const url = 'https://graph.microsoft.com/v1.0/me/drive/root/children';
    const response = await axios.get(url, {
        headers: {'Authorization': `Bearer ${accessToken}`}
    });

    return response.data;
}

// Function to get a download link for a file
async function getDownloadLink(accessToken, itemId) {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}`;
    const response = await axios.get(url, {
        headers: {'Authorization': `Bearer ${accessToken}`}
    });

    return response.data['@microsoft.graph.downloadUrl'];
}

// Function to get users who have access to a file
async function getFilePermissions(accessToken, itemId) {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/permissions`;
    const response = await axios.get(url, {
        headers: {'Authorization': `Bearer ${accessToken}`}
    });

    return response.data.value.map(permission => permission.grantedTo && permission.grantedTo.user && permission.grantedTo.user.displayName).filter(Boolean);
}

// Function to subscribe to changes in file permissions
async function subscribeToChanges(accessToken, itemId) {
    const url = 'https://graph.microsoft.com/v1.0/subscriptions';
    const subscription = {
        changeType: 'updated',
        notificationUrl: webhookNotificationUrl,
        resource: `/me/drive/items/${itemId}`,
        expirationDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        clientState: 'secretClientValue'
    };

    const response = await axios.post(url, subscription, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
}


app.get('/start', async (req, res) => {
    try {
        // Step 1: Get device code
        const deviceCodeResponse = await getDeviceCode();
        console.log(`Please go to ${deviceCodeResponse.verification_uri}and enter the code ${deviceCodeResponse.user_code}`);

        // Dynamically import the open module and use it
        const open = (await import('open')).default;

        // Open the verification URL in the default browser
        await open(deviceCodeResponse.verification_uri);

        // Step 2: Poll for access token
        const accessToken = await pollForToken(deviceCodeResponse.device_code, deviceCodeResponse.interval);

        // Step 3: Get OneDrive files
        const files = await getOneDriveFiles(accessToken);

        res.json(files);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error during authentication');
    }
});

app.get('/download/:itemId', async (req, res) => {
    try {
        const {itemId} = req.params;

        // You may want to cache the accessToken instead of obtaining it for every request
        const deviceCodeResponse = await getDeviceCode();
        const accessToken = await pollForToken(deviceCodeResponse.device_code, deviceCodeResponse.interval);

        const downloadLink = await getDownloadLink(accessToken, itemId);

        res.redirect(downloadLink);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting download link');
    }
});

app.get('/permissions/:itemId', async (req, res) => {
    try {
        const {itemId} = req.params;

        // You may want to cache the accessToken instead of obtaining it for every request
        const deviceCodeResponse = await getDeviceCode();
        const accessToken = await pollForToken(deviceCodeResponse.device_code, deviceCodeResponse.interval);

        const users = await getFilePermissions(accessToken, itemId);

        // Subscribe to changes in file permissions
        await subscribeToChanges(accessToken, itemId);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting file permissions');
    }
});

// Endpoint to handle webhook notifications
app.post('/webhook', async (req, res) => {
    try {
        const {value} = req.body;

        for (const notification of value) {
            if (notification.clientState !== 'secretClientValue') {
                // Invalid client state, ignore the notification
                continue;
            }

            // Get the access token (you may want to cache it instead of obtaining it for every request)
            const deviceCodeResponse = await getDeviceCode();
            const accessToken = await pollForToken(deviceCodeResponse.device_code, deviceCodeResponse.interval);

            // Fetch the updated list of users who have access to the file
            const users = await getFilePermissions(accessToken, notification.resource);

            // Log or process the updated list of users
            console.log(`Updated list of users for file ${notification.resource}:`, users);
        }

        res.status(202).send('Accepted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error handling webhook notification');
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});