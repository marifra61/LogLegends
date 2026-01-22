// 1. JWT Decoder (Needed to read user name/photo)
function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// 2. The Global Callback Handler
window.handleCredentialResponse = function(response) {
    console.log("Google Auth Success - Callback Received");
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Update the Profile UI
    const statusEl = document.getElementById('user-status');
    if (statusEl) {
        statusEl.innerHTML = `
            <div style="text-align: center;">
                <img src="${responsePayload.picture}" style="border-radius:50%; width:60px; border: 3px solid #00e5ff; margin-bottom:10px;">
                <h3 style="color: white; margin: 0;">Welcome, ${responsePayload.name}</h3>
                <p style="color: #888; font-size: 0.8rem;">${responsePayload.email}</p>
                <button onclick="location.reload()" class="back-btn" style="margin-top:15px;">Sign Out</button>
            </div>
        `;
    }

    // Mark user as logged in (for future features)
    localStorage.setItem('loglegends_user', JSON.stringify({
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    }));
};
