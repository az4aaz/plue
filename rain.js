const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const lineSize = 30;
const nbGenMax = 10;
const nbGenMin = 1;
const maxWidth = 3;
const raindrops = [];
const raindrop_color = "rgba(255, 255, 255, 0.3)";
let animationCount = 0;
let nbGen = 0;
let falling_speed;
let windValue;
let lastScrollTop = 0;

function set_wind_value(wind_speed) {
    windValue = wind_speed !== 0 ? 1 / wind_speed * 30 : 0;
    falling_speed = wind_speed*1.5;
}

function generate_artifacts() {
    let positions = {};
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = raindrop_color;

    let randomY = Math.random() * lineSize;
    let randomA = (Math.random() * (2 * ctx.canvas.width)) - ctx.canvas.width;
    let randomB = -lineSize;
    let randomWidth = Math.random() * maxWidth;

    let angle = Math.atan2(2, windValue);

    positions = {
        "y": randomY,
        "a": randomA,
        "b": randomB,
        "w": randomWidth,
        "angle": angle,
    };

    ctx.lineWidth = randomWidth;
    ctx.moveTo(randomA, randomB);
    ctx.lineTo(randomA + Math.cos(angle) * randomY, randomB + Math.sin(angle) * randomY);
    ctx.stroke();
    
    raindrops.push(positions);
}

function clear_artifacts(position) {
    ctx.clearRect(
        position.a - (position.w * 2),
        position.b - (position.w * 2),
        Math.cos(position.angle) * position.y + (position.w * 4),
        Math.sin(position.angle) * position.y + (position.w * 4)
    );
}

function move_raindrops() {
    for (const drop of raindrops) {
        clear_artifacts(drop);
        drop.b += falling_speed * Math.sin(drop.angle);
        drop.a += falling_speed * Math.cos(drop.angle);

        if (drop.a <= ctx.canvas.width && drop.b <= ctx.canvas.height) {
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = drop.w;
            ctx.strokeStyle = raindrop_color;
            ctx.moveTo(drop.a, drop.b);
            ctx.lineTo(drop.a + Math.cos(drop.angle) * drop.y, drop.b + Math.sin(drop.angle) * drop.y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else {
            raindrops.splice(raindrops.indexOf(drop), 1);
        }
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function animate() {
    for (let i = 0; i < nbGen; i++) {
        generate_artifacts();
    }
    move_raindrops();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', function () {
    // Fetch wind data
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.7326&longitude=-3.4566&hourly=wind_speed_10m&forecast_days=1')
        .then(response => response.json())
        .then(data => {
            let windSpeed = data['hourly']['wind_speed_10m'][new Date().getHours()];
            set_wind_value(windSpeed);
        })
        .catch(error => {
            console.error("Error fetching wind data:", error);
        });

    // Set up initial canvas size
    resizeCanvas();

    // Generate rain artifacts after a delay
    setTimeout(function () {
        animate();
    }, 75);

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Handle scroll events
    window.addEventListener("scroll", function () {
        let st = window.scrollY || document.documentElement.scrollTop;
        if (st > lastScrollTop) {
            if (nbGen < nbGenMax) {
                nbGen++;
            }
        } else if (st < lastScrollTop) {
            if (nbGen > nbGenMin) {
                nbGen--;
            }
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });
});
