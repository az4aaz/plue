const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const lineSize = 30;
var nbGen = 1
var lastScrollTop = 0;
var positions = []

ctx.canvas.width = document.body.clientWidth;
ctx.canvas.height = document.body.clientHeight;

addEventListener("scroll", function() {
    var st = window.scrollY || document.documentElement.scrollTop
    if (st > lastScrollTop) {
        nbGen++;
    } else if (st < lastScrollTop) {
        nbGen--;
    }
    lastScrollTop = st <= 0 ? 0 : st;

    if (window.scrollY < 10) {
        clear_artifacts()
    }
}, false);

function generate_artifacts() {
    if ( !!!canvas.getContext ) {
        return false;
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 0.5
    ctx.strokeStyle = "white";
    
    let randomX = Math.random() * lineSize;
    let randomY = Math.random() * lineSize;
    let randomA = Math.random() * ctx.canvas.width;
    let randomB = Math.random() * ctx.canvas.height;
    positions.push([randomX, randomY, randomA, randomB])
    
    ctx.moveTo(randomA, randomB);
    ctx.lineTo(randomA, randomB + randomY);
    ctx.stroke();
}

function clear_artifacts() {
    if (positions.length > 0) {
        positions.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < positions.length; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = "white";
            ctx.moveTo(positions[i][2], positions[i][3]);
            ctx.lineTo(positions[i][2], positions[i][3] + positions[i][1]);
            ctx.stroke();
            ctx.restore();
        }
    }
}

setInterval(function() {
    for (var i = 0; i < (nbGen+1)*0.3; i++) {
        generate_artifacts();
    }
}, 50);

setInterval(function() {
    for (var i = 0; i < (nbGen+1); i++) {
        clear_artifacts();
    }
}, 80);
