// exports.getUserId = async (client) => {
//     try {
//         const response = await client.api('/users').get();
//         console.log('Users response:', response);
//
//         if (response && response.value && response.value.length > 0) {
//             const userId = response.value[0].id; // Get the first user's ID
//             console.log('User ID:', userId);
//             return userId;
//         } else {
//             throw new Error('No users found');
//         }
//     } catch (error) {
//         console.error('Error getting user ID:', error);
//         throw new Error('Error getting user ID');
//     }
// };
