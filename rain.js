const CONSTANTS = {
    CANVAS_ID: "rain",
    LINE_SIZE: 30,
    NB_GEN_MAX: 20,
    NB_GEN_MIN: 1,
    MAX_WIDTH: 3,
    MOUSE_RADIUS: 45,
    RAINDROP_COLOR: "rgba(255, 255, 255, 0.3)",
};

const canvas = document.getElementById(CONSTANTS.CANVAS_ID);
const ctx = canvas.getContext("2d");
const images = document.getElementsByTagName("img");
const mouse = { x: 0, y: 0 };
let nbGen = 1;
let lastScrollTop = 0;
let falling_speed;
let windValue;
const raindrops = [];
const splashes = [];

function setWindValue(wind_speed) {
    windValue = wind_speed !== 0 ? 1 / wind_speed * 30 : 0;
    falling_speed = wind_speed * 1.5;
}

function generateArtifacts() {
    for (let i = 0; i < nbGen; i++) {
        let randomY = Math.random() * CONSTANTS.LINE_SIZE;
        let randomA = (Math.random() * (ctx.canvas.height + ctx.canvas.width)) - ctx.canvas.height;
        let randomB = -CONSTANTS.LINE_SIZE;
        let randomWidth = Math.random() * CONSTANTS.MAX_WIDTH;
        let angle = Math.atan2(2, windValue);

        raindrops.push(new Raindrop(randomY, randomA, randomB, randomWidth, angle));
    }
}

function generateSplash(x, y, size) {
    const numSplashes = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numSplashes; i++) {
        const splashSize = Math.random() * size;
        const splashSpeed = Math.random() * 1 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const splash = new Splash(x, y, splashSize, splashSpeed, angle);

        splashes.push(splash);
        // Remove splash from array after a certain duration
        setTimeout(() => {
            splashes.splice(splashes.indexOf(splash), 1);
        }, 500);
    }
}

function handleSplashCollision(drop) {
    const splashSize = drop.w;
    generateSplash(drop.a, drop.b + drop.y, splashSize);
}

function moveRaindrops() {
    for (const drop of raindrops) {
        drop.clearRaindrop();
        drop.move();

        if (drop.isOnCanvas() && !drop.isOverlappingImage(images)) {
            if (drop.isInMouseRadius()) {
                raindrops.splice(raindrops.indexOf(drop), 1);
            } else {
                drop.render();
            }
        } else {
            raindrops.splice(raindrops.indexOf(drop), 1);
            handleSplashCollision(drop);
        }
    }

    for (const splash of splashes) {
        splash.render();
        setTimeout(() => {
            splash.clearSplash();
        }, 100);
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function animate() {
    generateArtifacts();
    moveRaindrops();
    requestAnimationFrame(animate);
}

document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch wind data
    fetchWindData();
    // Set up initial canvas size
    resizeCanvas();
    // Generate raindrops
    animate();
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    // Handle scroll events
    window.addEventListener("scroll", handleScroll);
});

function fetchWindData() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.7326&longitude=-3.4566&hourly=wind_speed_10m&forecast_days=1')
        .then(response => response.json())
        .then(data => {
            let windSpeed = data['hourly']['wind_speed_10m'][new Date().getHours()];
            setWindValue(windSpeed);
        })
        .catch(error => {
            console.error("Error fetching wind data:", error);
        });
}

function handleScroll() {
    let st = window.scrollY || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
        if (nbGen < CONSTANTS.NB_GEN_MAX) {
            nbGen++;
        }
    } else if (st < lastScrollTop) {
        if (nbGen > CONSTANTS.NB_GEN_MIN) {
            nbGen--;
        }
    }
    lastScrollTop = st <= 0 ? 0 : st;
}

class Raindrop {
    constructor(y, a, b, w, angle) {
        this.y = y;
        this.a = a;
        this.b = b;
        this.w = w;
        this.angle = angle;
    }

    move() {
        this.b += falling_speed * Math.sin(this.angle);
        this.a += falling_speed * Math.cos(this.angle);
    }

    render() {
        ctx.lineWidth = this.w;
        ctx.strokeStyle = CONSTANTS.RAINDROP_COLOR;
        ctx.beginPath();
        ctx.moveTo(this.a, this.b);
        ctx.lineTo(
            this.a + Math.cos(this.angle) * this.y,
            this.b + Math.sin(this.angle) * this.y
        );
        ctx.closePath();
        ctx.stroke();
    }

    isOnCanvas() {
        return this.a <= ctx.canvas.width && this.b <= ctx.canvas.height - 50;
    }

    isInMouseRadius() {
        return (
            this.a <= mouse.x + CONSTANTS.MOUSE_RADIUS &&
            this.a >= mouse.x - CONSTANTS.MOUSE_RADIUS &&
            this.b <= mouse.y + CONSTANTS.MOUSE_RADIUS &&
            this.b >= mouse.y - CONSTANTS.MOUSE_RADIUS
        );
    }

    clearRaindrop() {
        ctx.clearRect(
            this.a - (this.w * 2),
            this.b - (this.w * 2),
            Math.cos(this.angle) * this.y + (this.w * 4),
            Math.sin(this.angle) * this.y + (this.w * 4)
        );
    }

    isOverlappingImage(images) {
        return Array.from(images).some(image => {
            let rect = image.getBoundingClientRect();
            return (
                this.a <= rect.right + 10 &&
                this.a >= rect.left - 10 &&
                this.b <= rect.bottom &&
                this.b >= rect.top - 10
            );
        });
    }
}

class Splash {
    constructor(x, y, size, speed, angle) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.angle = angle;
    }

    move() {
        // ... movement code ...
    }

    clearSplash() {
        ctx.clearRect(this.x - 5, this.y - 5, this.size + 10, this.size + 10);
    }

    render() {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = CONSTANTS.RAINDROP_COLOR;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
