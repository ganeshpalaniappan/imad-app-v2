console.log('Loaded!');

var login = document.getElementById("login");
login.onclick = function () {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {
                alert("Logged in successfully");
                document.getElementById("login-detail").style.display = 'none';
                document.getElementById("User-Detail").style.display = 'block';
                document.getElementById("displayName").innerHTML = loginJSON.username;
            }
            else if (request.status === 403) {
                alert("Username/password is incorrect");
            }
            else if (request.status === 500) {
                alert("Something went wrong on the server");
            }

        }
    };

    const loginJSON = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
    request.open("POST", "/login", true);
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify(loginJSON));
   
};

var logout = document.getElementById("logout");
logout.onclick = function () {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                alert("Logged out successfully");
                document.getElementById("login-detail").style.display = 'block';
                document.getElementById("User-Detail").style.display = 'none';
            }
            else if (request.status === 500) {
                alert("Something went wrong on the server.");
            }
        }
    }

    request.open("GET", "/logout", true);
    request.send(null);
};

var register = document.getElementById("register");
register.onclick = function () {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {
                alert("User created successfully");
            }
            else if (request.status === 500) {
                const responseText = (request.responseText) ? request.responseText : "";
                alert("Something went wrong on the server. " + responseText);
            }
        }
    };

    const loginJSON = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    request.open("POST", "/create-user", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(loginJSON));
};

var listArticles = function () {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {

                const articles = JSON.parse(request.responseText);
                let articleList = "";

                for (let i = 0; i < articles.length; i++) {
                    let modified_date = new Date(articles[i].modified_date);
                    let articleViewURL = "/articles/" + articles[i].title;
                    articleList += `
                            <li>
                                <a href="${articleViewURL}">${articles[i].title}</a> (${modified_date.toDateString()})
                            </li>
                            `;
                }

                let ul = document.getElementById("articleList");
                ul.innerHTML = articleList;
            }
        }
    };

    request.open("GET", "/get-articles", true);
    request.send(null);
};

