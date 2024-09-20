document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('.btn-primary');
    const chatInput = document.querySelector('#chatSend');
    
    sendButton.addEventListener('click', sendData);

    async function sendData(event) {
        event.preventDefault();  // Prevent form submission behavior
        
        const msg = chatInput.value;  // Get the message value from the input

        if (!msg.trim()) return;  // Avoid sending empty messages

        const token = localStorage.getItem('token');  // Get token from local storage
        if (!token) {
            console.log('Token missing');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/chat', { msg }, {
                headers: { 'Authorization': token }
            });
            console.log(response.data.msgg);  // Response from the server
            
            chatInput.value = '';  // Clear input after sending message
        } catch (error) {
            console.error('Error sending message', error);
        }
    }
});
