// Function to copy shortened URL to clipboard
function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl');
    shortUrl.select();
    navigator.clipboard.writeText(shortUrl.value)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

document.addEventListener('DOMContentLoaded', function () {

    // Add event listener to the form submission
    document.getElementById('urlForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const longUrl = document.getElementById('longUrl').value;
        fetch('https://tinyurl-fok9.onrender.com/shorten-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url: longUrl})
        })
            .then(response => response.json())
            .then(data => {
                // Show the result section with the shortened URL
                document.getElementById('shortUrl').value = data.shortUrl;
                // Set the href and text content for the original URL link
                const originalUrlLink = document.getElementById('originalUrl');
                originalUrlLink.href = longUrl;
                originalUrlLink.textContent = longUrl;
                document.getElementById('result').style.display = 'block';
                // Show the "Shorten another URL" button
                document.getElementById('shortenAnother').style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                // Optionally, handle the error by showing a message to the user
            });
    });

    // Add event listener to the "Shorten another URL" button
    document.getElementById('shortenAnother').addEventListener('click', function () {
        // Clear the long URL input field
        document.getElementById('longUrl').value = '';
        // Hide the result section and the button itself
        document.getElementById('result').style.display = 'none';
        this.style.display = 'none';
    });
});
