console.log('Loaded!');

var marginLeft = 0;
var madi_img = document.getElementById("madi");

function moveRight() {
    marginLeft += 10;
    madi_img.style.marginLeft = marginLeft + "px";
};
    
function moveImage() {
    madi_img.onclick = function () {
        var interval = setInterval(moveRight, 50);
    };
};

moveImage();