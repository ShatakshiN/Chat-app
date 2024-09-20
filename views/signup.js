document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signUpForm');
    signUpForm.onsubmit = sendUserData;

    async function sendUserData(event) {
        event.preventDefault();
        const name = event.target.name.value;
        const email = event.target.mail.value; 
        const password = event.target.password.value;
        const contactNo = event.target.contact.value;

        console.log('frontend', { name, email, password });

        const obj = {
            name,
            email,
            password,
            contactNo
        };

        try {
            const response = await axios.post('http://localhost:4000/signUp', obj);
            if (response.data.message === 'user already exists') {
                alert("User already exists!");
            } else {
                alert('Successfully signed in!');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.log(error);
        }
    }
});