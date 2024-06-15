# Microsoft OneDrive File Access Monitoring

This Node.js application allows you to monitor and manage file access permissions on Microsoft OneDrive. It provides functionality to:

1. Authenticate with Microsoft Graph API using device code flow.
2. Poll for access token to maintain authenticated session.
3. List files in the root directory of the OneDrive.
4. Download a file by providing its item ID.
5. List users who have access to a specific file.
6. Subscribe to changes in file permissions and receive real-time notifications.

## How to Execute

1. Install Node.js (https://nodejs.org) if not already installed.
2. Clone this repository or download the source code.
3. Install dependencies by running `npm install` in the project directory.
4. Update the `clientId`, `clientSecret`, `tenant`, and `scopes` variables in `server.js` with your own Microsoft application credentials and permissions. Use a valid SPO license for tenants to test the functionality.
5. Run the application using `npm start`.
6. Navigate to the provided verification URL in your browser and enter the code displayed on the console.
7. The application will start polling for access token and list files in the OneDrive root directory.
8. Use the provided APIs (`/download/:itemId` and `/permissions/:itemId`) to download files and list users with access to a file, respectively.
