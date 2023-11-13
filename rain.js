const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const lineSize = 30;
const nbGenMax = 20;
const nbGenMin = 1;
const maxWidth = 3;
const mouseRadius = 45;
const raindrops = [];
const splashes = [];
const raindrop_color = "rgba(255, 255, 255, 0.3)";
const mouse = { x: 0, y: 0 };
const images = document.getElementsByTagName("img");
let nbGen = 1;
let lastScrollTop = 0;
let falling_speed;
let windValue;

function set_wind_value(wind_speed) {
    windValue = wind_speed !== 0 ? 1 / wind_speed * 30 : 0;
    falling_speed = wind_speed * 1.5;
}

function generate_artifacts() {
    let randomY = Math.random() * lineSize;
    let randomA = (Math.random() * (ctx.canvas.height + ctx.canvas.width)) - ctx.canvas.height;
    let randomB = -lineSize;
    let randomWidth = Math.random() * maxWidth;
    let angle = Math.atan2(2, windValue);

    raindrops.push({
        "y": randomY,
        "a": randomA,
        "b": randomB,
        "w": randomWidth,
        "angle": angle,
    });

    ctx.lineWidth = randomWidth;
    ctx.beginPath();
    ctx.strokeStyle = raindrop_color;
    ctx.moveTo(randomA, randomB);
    ctx.lineTo(randomA + Math.cos(angle) * randomY, randomB + Math.sin(angle) * randomY);
    ctx.stroke();
}

function clear_artifacts(position) {
    ctx.clearRect(
        position.a - (position.w * 2),
        position.b - (position.w * 2),
        Math.cos(position.angle) * position.y + (position.w * 4),
        Math.sin(position.angle) * position.y + (position.w * 4)
    );
}

function generateSplash(x, y, size) {
    const numSplashes = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numSplashes; i++) {
        const splashSize = Math.random() * size;
        const splashSpeed = Math.random() * 1 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const splash = {
            x: x + Math.cos(angle) * splashSize,
            y: y + Math.sin(angle) * splashSize,
            size: splashSize,
            speed: splashSpeed,
            angle: angle,
        };

        splashes.push(splash);
        // Remove splash from array after a certain duration
        setTimeout(() => {
            splashes.splice(splashes.indexOf(splash), 1);
            clear_artifacts(splash);
        }, 500);
    }
}

function handleSplashCollision(drop) {
    const splashSize = drop.w ;
    generateSplash(drop.a, drop.b + drop.y, splashSize);
}


function move_raindrops() {
    for (const drop of raindrops) {
        clear_artifacts(drop);
        drop.b += falling_speed * Math.sin(drop.angle);
        drop.a += falling_speed * Math.cos(drop.angle);

        // if the drop is still on the canvas
        // don't touch any image of the page
        if (
            drop.a <= ctx.canvas.width &&
            drop.b <= ctx.canvas.height - 50 &&
            !Array.from(images).some(image => {
                let rect = image.getBoundingClientRect();
                return (
                    drop.a <= rect.right + 10 &&
                    drop.a >= rect.left - 10 &&
                    drop.b <= rect.bottom &&
                    drop.b >= rect.top - 10
                )
            })
            )
        {
            // if the drop is not in the mouse radius
            if (
                drop.a <= mouse.x - mouseRadius ||
                drop.a >= mouse.x + mouseRadius ||
                drop.b <= mouse.y - mouseRadius ||
                drop.b >= mouse.y + mouseRadius
            ) {
                ctx.lineWidth = drop.w;
                ctx.strokeStyle = raindrop_color;
                ctx.beginPath();
                ctx.moveTo(drop.a, drop.b);
                ctx.lineTo(
                    drop.a + Math.cos(drop.angle) * drop.y,
                    drop.b + Math.sin(drop.angle) * drop.y
                );
                ctx.closePath();
                ctx.stroke();
            } else {
                raindrops.splice(raindrops.indexOf(drop), 1);
            }
        } else {
            raindrops.splice(raindrops.indexOf(drop), 1);
            handleSplashCollision(drop);
        }
    }

    // Render splashes
    for (const splash of splashes) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(splash.x, splash.y, splash.size, splash.size);
        ctx.fillStyle = raindrop_color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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

document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

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
    animate();

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
