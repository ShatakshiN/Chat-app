const messagesContainer = document.querySelector('.chat-messages');
const sendButton = document.querySelector('.btn.btn-primary');
const messageInput = document.getElementById('chatSend');
window.addEventListener('load', renderElements);

setInterval(async () => {
    await renderElements();
}, 4000);

async function renderElements() {
    try {
        let messages = [];
        if (localStorage.getItem('messages')) {
            messages = JSON.parse(localStorage.getItem('messages'));
        }

        if (!localStorage.getItem('token')) {
            window.location = 'login.html';
        }

        const p1 = axios.get('http://localhost:4000/user/all-users', {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const last = messages.length === 0 ? 0 : messages[messages.length - 1].id;
        const p2 = axios.get(`http://localhost:4000/message/get-messages?id=${last}`, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const [res, res2] = await Promise.all([p1, p2]);

        // Clear previous messages and add "You joined" message
        messagesContainer.innerHTML = '';
        const joinDiv = document.createElement('div');
        joinDiv.textContent = 'You joined';
        joinDiv.className = 'u-joined';
        messagesContainer.appendChild(joinDiv);

        // Show users who are logged in
        const users = res.data.users;
        users.forEach(user => {
            showUser(user);
        });

        // Update messages with new ones from the backend
        messages = [...messages, ...res2.data.messages];
        localStorage.setItem('messages', JSON.stringify(messages));

        const currentUserId = res2.data.id;
        messages.forEach(message => {
            showMessage(message, currentUserId === message.SignUpId, users);
        });

        // Scroll to the bottom of the chat
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (e) {
        console.error(e);
    }
}

function showUser(user) {
    const userDiv = document.createElement('div');
    userDiv.textContent = user.name + ' joined';
    userDiv.className = 'u-joined bg-white p-2 rounded shadow-sm';
    messagesContainer.appendChild(userDiv);
}

function showMessage(data, isCurrentUser, users) {
    const messageDiv = document.createElement('div');
    if (isCurrentUser) {
        messageDiv.className = 'u-msg bg-white p-2 rounded shadow-sm';
        messageDiv.textContent = "You: " + data.message;
    } else {
        messageDiv.className = 'bg-dark text-white p-2 rounded shadow-sm';
        const user = users.find(user => user.id === data.SignUpId);
        
        if (user) {
            messageDiv.textContent = user.name + ": " + data.message;
        } else {
            console.warn(`User not found for message: ${data.message}`);
            messageDiv.textContent = "Unknown user: " + data.message; // Fallback
        }
    }
    messagesContainer.appendChild(messageDiv);
}


sendButton.addEventListener('click', sendMessage);

async function sendMessage(e) {
    try {
        e.preventDefault();
        const data = { message: messageInput.value };
        const res = await axios.post('http://localhost:4000/message/add-message', data, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        // Display the sent message
        showMessage(data, true);
        //e.target.msgData.value = '';
        message: messageInput.value = "";
    } catch (e) {
        console.error(e);
    }
}
