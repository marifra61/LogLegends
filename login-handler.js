function handleCredentialResponse(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('user_id', payload.sub);
    localStorage.setItem('user_name', payload.name);
    localStorage.setItem('user_pic', payload.picture);
    location.reload(); 
}

function checkLogin() {
    const name = localStorage.getItem('user_name');
    if (name) {
        document.getElementById('google-btn').style.display = 'none';
        document.getElementById('user-display').style.display = 'block';
        document.getElementById('user-name').textContent = name;
        document.getElementById('user-pic').src = localStorage.getItem('user_pic');
    }
}

window.onload = checkLogin;
