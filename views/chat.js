const messagesContainer = document.querySelector('.chat-messages');
const chatInput = document.getElementById('chatSend');
const sendButton = document.querySelector('.btn.btn-primary');

window.addEventListener('load', renderElements);

setInterval(async () => {
    await renderElements();
}, 4000);


async function renderElements() {
    try {
        messagesContainer.innerHTML = ''; // Clear the chat messages container

        if (!localStorage.getItem('token')) {
            window.location = 'login.html'; // Redirect to login if token not found
        }

        const p1 = axios.get('http://localhost:4000/user/all-users', {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const p2 = axios.get('http://localhost:4000/message/get-messages', {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const [res, messages] = await Promise.all([p1, p2]);
        console.log(res);
        console.log(messages);

        // Display users
        res.data.users.forEach(user => {
            showUser(user);
        });

        const id = messages.data.id;

        // Display messages
        messages.data.messages.forEach(message => {
            showMessage(message, id === message.userId);
        });
    } catch (e) {
        console.log(e);
    }
}

function showUser(user) {
    const div = document.createElement('div');
    div.textContent = user.name + ' joined';
    div.className = 'u-joined bg-white p-2 rounded shadow-sm mb-2';
    messagesContainer.appendChild(div);
}

function showMessage(data, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    const messageContent = document.createElement('div');
    messageContent.classList.add('p-2', 'rounded', 'shadow-sm');

    if (isUser) {
        messageDiv.classList.add('sent');
        messageContent.classList.add('bg-dark', 'text-white' ,'p-2' ,'rounded', 'shadow-sm');
        messageContent.textContent = "You: " + data.message;
    } else {
        messageContent.classList.add('bg-white', 'text-dark','p-2' ,'rounded', 'shadow-sm' );
        messageContent.textContent = data.senderName + ": " + data.message;
    }

    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message handler
sendButton.addEventListener('click', sendMessage);

async function sendMessage(e) {
    try {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        const data = { message: messageText };

        const res = await axios.post('http://localhost:4000/message/add-message', data, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        console.log(res);
        showMessage({ message: messageText }, true);
        chatInput.value = ''; // Clear input field
    } catch (e) {
        console.log(e);
    }
}


/* document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('.btn-primary');
    const chatInput = document.querySelector('#chatSend');
    const chatMessages = document.querySelector('.chat-messages');

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
 */