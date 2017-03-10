var comment_onclick = function () {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                alert("Comment added successfully");
                listComments();
            }
            else if (request.status === 500) {
                alert("Something went wrong on the server");
            }
        }
    };

    const commentJSON = {
        article_id: document.getElementById("articleID_hdn").value,
        comment: document.getElementById("comment_txt").value
    };
    request.open("POST", "/submit-comment", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(commentJSON));
};

var onArticleLoad = function () {
    listComments();

    var sessionUserID = document.getElementById("userid_hdn").value;
    if (sessionUserID && sessionUserID != "") {
        document.getElementById("CommentInputArea").style.display = 'block';
    }
    else {
        document.getElementById("CommentInputArea").style.display = 'none';
    }
};


var listComments = function () {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {

                let comments = request.responseText;
                comments = JSON.parse(comments);

                var commentList = "";
                for (let i = 0; i < comments.length; i++) {
                    let comment_date = new Date(comments[i].timestamp);
                    commentList += `
                            <li>
                               ${comments[i].comment} (${comment_date.toDateString()})
                            </li>
                            `;
                }

                let ul = document.getElementById("comments_lst");
                ul.innerHTML = commentList;
            }

        }
    };

    request.open("GET", "/get-comments?article_id=" + document.getElementById("articleID_hdn").value, true);
    request.send(null);

};
