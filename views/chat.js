const messagesContainer = document.querySelector('.chat-messages');
const sendButton = document.querySelector('.btn.btn-primary');
const messageInput = document.getElementById('chatSend');
let selectedGroupId = null;  // This will store the currently selected group ID

/* window.addEventListener('load', renderElements);

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
 */
/* function showMessage(data, isCurrentUser, users) {
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


sendButton.addEventListener('click', sendMessage); */

/* async function sendMessage(e) {
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
} */
sendButton.addEventListener('click', async () => {
    const messageContent = messageInput.value;
    //if (!messageContent) return;
    if (!messageContent || !selectedGroupId) return;  // Ensure a group is selected

    //const groupId = /* the selected group's ID */;
    const localStorageKey = `group_${selectedGroupId}_messages`;

    try {
        // Step 1: Send the message to the backend
        const response = await axios.post(`http://localhost:4000/groups/${selectedGroupId}/send-message`, {
            content: messageContent
        }, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const newMessage = response.data.message;

        // Step 2: Save the new message to local storage
        let storedMessages = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        storedMessages.push(newMessage);

        // Keep only the most recent 10 messages
        if (storedMessages.length > 10) {
            storedMessages = storedMessages.slice(-10);
        }

        localStorage.setItem(localStorageKey, JSON.stringify(storedMessages));

        // Step 3: Display the new message in the chat window
        displayMessages(storedMessages);

        // Clear the input field
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
});


const createGroupForm = document.getElementById('createGroupForm');
const membersList = document.getElementById('membersList');
const adminList = document.getElementById('adminList');

// Fetch and display users for selection as members/admins
async function populateGroupForm() {
    try {
        const res = await axios.get('http://localhost:4000/user/all-users', {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const users = res.data.users;

        // Clear existing members and admins checkboxes
        membersList.innerHTML = '';
        adminList.innerHTML = '';

        // Create checkboxes for each user
        users.forEach(user => {
            // Member checkbox
            const memberCheckbox = document.createElement('input');
            memberCheckbox.type = 'checkbox';
            memberCheckbox.value = user.id;
            memberCheckbox.id = `member-${user.id}`;
            memberCheckbox.className = 'form-check-input';

            const memberLabel = document.createElement('label');
            memberLabel.className = 'form-check-label';
            memberLabel.setAttribute('for', `member-${user.id}`);
            memberLabel.textContent = user.name;

            const memberDiv = document.createElement('div');
            memberDiv.className = 'form-check';
            memberDiv.appendChild(memberCheckbox);
            memberDiv.appendChild(memberLabel);

            membersList.appendChild(memberDiv);

            // Admin checkbox
            const adminCheckbox = document.createElement('input');
            adminCheckbox.type = 'checkbox';
            adminCheckbox.value = user.id;
            adminCheckbox.id = `admin-${user.id}`;
            adminCheckbox.className = 'form-check-input';

            const adminLabel = document.createElement('label');
            adminLabel.className = 'form-check-label';
            adminLabel.setAttribute('for', `admin-${user.id}`);
            adminLabel.textContent = user.name;

            const adminDiv = document.createElement('div');
            adminDiv.className = 'form-check';
            adminDiv.appendChild(adminCheckbox);
            adminDiv.appendChild(adminLabel);

            adminList.appendChild(adminDiv);
        });

    } catch (error) {
        console.error('Error fetching users for group creation:', error);
    }
}

// Trigger population of members and admins list when the modal is shown
document.querySelector('[data-bs-target="#createGroupModal"]').addEventListener('click', populateGroupForm);

// Handle group creation form submission
createGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const groupName = document.getElementById('groupName').value;
    
    // Get selected members and admins
    const selectedMembers = [...document.querySelectorAll('#membersList input:checked')].map(checkbox => checkbox.value);
    const selectedAdmins = [...document.querySelectorAll('#adminList input:checked')].map(checkbox => checkbox.value);

    try {
        const response = await axios.post('http://localhost:4000/createGroup', {
            groupName,
            members: selectedMembers,
            admins: selectedAdmins
        }, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        // Handle success (you might want to display a success message or close the modal)
        console.log('Group created successfully:', response.data);
        alert('Group created successfully!');

        // Optionally, reset the form after submission
        createGroupForm.reset();

    } catch (error) {
        console.error('Error creating group:', error);
        alert('Failed to create group. Please try again.');
    }
});

async function loadSidebar() {
    try {
        const res = await axios.get('http://localhost:4000/groups', {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const groups = res.data.groups;
        const chatList = document.querySelector('.list-group');
        chatList.innerHTML = '';  // Clear previous list

        // Append groups to the sidebar
        groups.forEach(group => {
            const groupItem = document.createElement('a');
            groupItem.href = '#';  // Link to the group chat (we'll implement it next)
            groupItem.className = 'list-group-item list-group-item-action';
            groupItem.textContent = group.name;

            groupItem.addEventListener('click', () => loadGroupChat(group.id));

            chatList.appendChild(groupItem);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

window.addEventListener('load', loadSidebar);

async function loadGroupChat(groupId) {
    selectedGroupId = groupId;
    const localStorageKey = `group_${groupId}_messages`;

    // Step 1: Load last 10 messages from local storage
    let storedMessages = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    displayMessages(storedMessages);

    try {
        // Step 2: Fetch new messages from backend
        const res = await axios.get(`http://localhost:4000/groups/${groupId}/recent-messages`, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        });

        const newMessages = res.data.messages;
        console.log(newMessages)

        // Combine stored messages and new messages (without duplicates)
        storedMessages = mergeMessages(storedMessages, newMessages);

        // Step 3: Save only the recent 10 messages to local storage
        const recentMessages = storedMessages.slice(-10);
        localStorage.setItem(localStorageKey, JSON.stringify(recentMessages));

        // Step 4: Display the combined messages
        displayMessages(recentMessages);
        console.log(recentMessages)
    } catch (error) {
        console.error('Error loading group messages:', error);
    }
}

function mergeMessages(storedMessages, newMessages) {
    const allMessages = [...storedMessages];

    newMessages.forEach(newMessage => {
        if (!storedMessages.some(storedMsg => storedMsg.id === newMessage.id)) {
            allMessages.push(newMessage);
        }
    });

    return allMessages;
}

function displayMessages(messages) {
    const messagesContainer = document.querySelector('.chat-messages');
    messagesContainer.innerHTML = ''; // Clear existing messages

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = message.senderId === 'self' ? 'message sent' : 'message received';
        messageDiv.innerHTML = `<div class="bg-white p-2 rounded shadow-sm"><strong>${message.senderName}:</strong> ${message.message}</div>`;
        messagesContainer.appendChild(messageDiv);
    });
}
