console.log('Loaded!');

var submit = document.getElementById("submit_btn");
submit.onclick = function () {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {

                let comments = request.responseText;
                comments = JSON.parse(comments);

                var commentList = "";
                for (let i = 0; i < comments.length; i++) {
                    commentList += `<li>${comments[i]}</li>`;
                }

                let ul = document.getElementById("comments_lst");
                ul.innerHTML = commentList;

            }

        }
    };

    var commentInput = document.getElementById("comment_txt");
    var comment = commentInput.value;
    request.open("GET","/submit-comment?comment="+comment,true);
    request.send(null);
   
};