var comment_onclick = function () {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                alert("Comment added successfully");
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
