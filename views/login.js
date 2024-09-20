document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = sendData;

    async function sendData(event) {
        event.preventDefault();
        console.log('Form submitted'); // Check if this gets logged

        const email = event.target.email.value;
        const password = event.target.password.value;
        console.log('Email:', email); // Check if email is correct
        console.log('Password:', password); // Check if password is correct

        const obj = {
            email,
            password
        };

        try {
            const response = await axios.post('http://localhost:4000/login', obj);
            console.log('Response:', response); // Check the response
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                window.location.href = 'chat.html';
            }    
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data.msg : error.message);
            showAlert(error.response ? error.response.data.msg : 'An error occurred');
        }
    }

    function showAlert(str) {
        const parentElem = document.getElementById('loginForm');
        const childElem = document.createElement('div');
        childElem.className = 'alert alert-danger';
        childElem.role = 'alert';
        childElem.textContent = str;
        const okButton = document.createElement('button');
        okButton.className = 'btn btn-dark';
        okButton.textContent = 'OK';
        okButton.addEventListener('click', () => {
            parentElem.removeChild(childElem);
        });
        childElem.appendChild(okButton);
        parentElem.insertBefore(childElem, parentElem.firstChild);
    }
});