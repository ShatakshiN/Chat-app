const messagesContainer = document.querySelector('.chat-messages');
const sendButton = document.querySelector('.btn.btn-primary');
const messageInput = document.getElementById('chatSend');

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

