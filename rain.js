const CONSTANTS = {
    CANVAS_ID: "rain",
    LINE_SIZE: 30,
    NB_GEN_MAX: 20,
    NB_GEN_MIN: 1,
    MAX_WIDTH: 3,
    MOUSE_RADIUS: 45,
    RAINDROP_COLOR: "rgba(255, 255, 255, 0.3)",
    SPLASH_DURATION: 100
};

const canvas = document.getElementById(CONSTANTS.CANVAS_ID);
const ctx = canvas.getContext("2d");
const images = document.getElementsByClassName('deco');
const mouse = { x: 0, y: 0 };
const raindrops = [];
const splashes = [];

let nbGen = 1;
let lastScrollTop = 0;
let groundLevel;
let angle;
let angleSplash;
let falling_speed;
let windSpeed;
let maxDistance;
let lightSource;

function generateArtifacts() {
    for (let i = 0; i < nbGen; i++) {
        let randomY = Math.random() * CONSTANTS.LINE_SIZE;
        let aLocation = (Math.random() * (ctx.canvas.height + ctx.canvas.width)) - ctx.canvas.height;
        let bLocation = -CONSTANTS.LINE_SIZE;
        let randomWidth = Math.random() * CONSTANTS.MAX_WIDTH;

        raindrops.push(new Raindrop(randomY, aLocation, bLocation, randomWidth));
    }
}

function generateSplash(x, y, size) {
    const numSplashes = Math.floor(Math.random()) + 1;

    for (let i = 0; i < numSplashes; i++) {
        const splashSize = Math.random() * size;
        const splashSpeed = Math.random() * 2;

        splashes.push(new Splash(x, y, splashSize, splashSpeed));
    }
}

function handleSplashCollision(drop) {
    const splashSize = drop.w;
    generateSplash(drop.a, drop.b, splashSize);
}

function moveRaindrops() {
    for (const drop of raindrops) {
        drop.update();
    }
}

function moveSplashes() {
    for (const splash of splashes) {
        splash.update();
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    groundLevel = ctx.canvas.height - 50;
}

function animate() {
    clearCanvas(0, 0, ctx.canvas.width, ctx.canvas.height);

    generateArtifacts();
    lightSource.render();
    moveRaindrops();
    moveSplashes();
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

    lightSource = new LightSource(ctx.canvas.width - 158, groundLevel + 148, ctx.canvas.width * 0.2);
    // Generate raindrops
    animate();
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    // Handle scroll events
    window.addEventListener("scroll", handleScroll);
});

function setWindSpeed(windSpeed) {
    angle = Math.PI / 2 - Math.atan(windSpeed / 100);
    falling_speed = windSpeed;
    angleSplash = 2 * Math.PI - angle;
}

function fetchWindData() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.7326&longitude=-3.4566&hourly=wind_speed_10m&forecast_days=1')
        .then(response => response.json())
        .then(data => {
            windSpeed = data['hourly']['wind_speed_10m'][new Date().getHours()];
            setWindSpeed(windSpeed);
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

class LightSource {
    constructor(x, y, brightness) {
        this.x = x;
        this.y = y;
        this.brightness = brightness;
    }

    render() {
        ctx.beginPath();
        ctx.rect(this.x, this.y - this.brightness, 3, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Code to move the light source
        // This will depend on how you want the light source to move
    }
}

class Raindrop {
    constructor(y, a, b, w) {
        this.y = y;
        this.a = a;
        this.b = b;
        this.w = w;
        this.speed = (Math.random() * falling_speed - 2) + 8;
    }

    move() {
        this.b += this.speed * Math.sin(angle);
        this.a += this.speed * Math.cos(angle);
    }

    render() {
        let dx = this.a - lightSource.x;
        let dy = this.b - lightSource.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= lightSource.brightness && angle > -Math.PI / 2 && angle < Math.PI / 2) {
            let alpha = 1 - distance / lightSource.brightness;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = this.w;
            ctx.beginPath();
            ctx.moveTo(this.a, this.b);
            ctx.lineTo(
                this.a + Math.cos(angle) * this.y,
                this.b + Math.sin(angle) * this.y
            );
            ctx.closePath();
            ctx.stroke();
        }
    }

    update() {
        this.move();

        if (this.isOnCanvas() && !this.isOverlappingImage(images)) {
            if (this.isInMouseRadius()) {
                raindrops.splice(raindrops.indexOf(this), 1);
            } else {
                this.render();
            }
        } else {
            handleSplashCollision(this);
            raindrops.splice(raindrops.indexOf(this), 1);
        }
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
        clearCanvas(this.a - (this.w * 2), this.b - (this.w * 2), Math.cos(angle) * this.y + (this.w * 4), Math.sin(angle) * this.y + (this.w * 4));
    }

    isOverlappingImage(images) {
        const raindropRect = {
            left: this.a - (this.w * 2),
            right: this.a + Math.cos(angle) * this.y + (this.w * 2),
            top: this.b - (this.w * 2),
            bottom: this.b + Math.sin(angle) * this.y + (this.w * 2)
        };

        return Array.from(images).some(image => {
            let rect = image.getBoundingClientRect();
            return (
                raindropRect.left <= rect.right + 10 &&
                raindropRect.right >= rect.left - 10 &&
                raindropRect.top <= rect.bottom &&
                raindropRect.bottom >= rect.top - 10
            );
        });
    }
}

class Splash {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.startTime = performance.now();
    }

    move() {
        this.y += this.speed * Math.sin(angleSplash);
        this.x += this.speed * Math.cos(angleSplash);
    }

    update() {
        const currentTime = performance.now();
        this.move();
        this.render();
        
        if (this.y > ctx.canvas.height || this.x > ctx.canvas.width || (currentTime - this.startTime) > CONSTANTS.SPLASH_DURATION) {
            splashes.splice(splashes.indexOf(this), 1);
        }
    }

    render() {
        // Calculate distance to light source
        let dx = this.x - lightSource.x;
        let dy = this.y - lightSource.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // If distance is within range
        if (distance <= lightSource.brightness) {
            let alpha = 1 - (distance / lightSource.brightness) * (this.y / ctx.canvas.height);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fill();
            ctx.closePath();
        }
    }
}

function clearCanvas(x, y, width, height) {
    ctx.clearRect(x, y, width, height);
}
