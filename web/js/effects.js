// ============================================================
// effects.js — Particle System, Starfield & Explosions
// ============================================================

// ---- Thruster / Fire Particle ----
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = randomRange(3, 8);
        this.speedY = randomRange(2, 8);
        this.speedX = (Math.random() - 0.5) * 2;
        this.life = 255;
        this.baseColor = Math.random() < 0.5 ? [255, 165, 0] : [255, 255, 0]; // orange / yellow
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.life -= SETTINGS.PARTICLE_FADE_STEP;
        return this.life > 0;
    }

    draw(ctx) {
        const [r, g, b] = this.baseColor;
        ctx.fillStyle = `rgba(${r},${g},${b},${this.life / 255})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ---- Explosion Particle ----
class ExplosionParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(1, 6);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = randomRange(2, 6);
        this.life = 1.0;
        this.decay = randomRange(0.02, 0.06);
        this.color = color || [255, 165, 0];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        const [r, g, b] = this.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${this.life.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ---- Health Pickup ----
class HealthPickup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.speed = 1.5;
        this.pulseAngle = 0;
        this.alive = true;
    }

    update() {
        this.y += this.speed;
        this.pulseAngle += 0.12;
        return this.alive && this.y < (window._canvasH || 800) + 20;
    }

    draw(ctx) {
        const pulse = 1 + Math.sin(this.pulseAngle) * 0.2;
        const r = this.radius * pulse;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.HEALTH_GREEN;
        ctx.fillStyle = COLORS.HEALTH_GREEN;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        // Cross
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x - 2, this.y - 6, 4, 12);
        ctx.fillRect(this.x - 6, this.y - 2, 12, 4);
        ctx.restore();
    }
}

// ---- Particle Manager ----
class ParticleManager {
    constructor() {
        this.thrusters = [];
        this.explosions = [];
        this.pickups = [];
    }

    addThruster(x, y) {
        this.thrusters.push(new Particle(x, y));
    }

    addExplosion(x, y, count, color) {
        for (let i = 0; i < (count || 15); i++) {
            this.explosions.push(new ExplosionParticle(x, y, color));
        }
    }

    addPickup(x, y) {
        this.pickups.push(new HealthPickup(x, y));
    }

    update() {
        this.thrusters = this.thrusters.filter(p => p.update());
        this.explosions = this.explosions.filter(p => p.update());
        this.pickups = this.pickups.filter(p => p.update());
    }

    draw(ctx) {
        for (const p of this.thrusters) p.draw(ctx);
        for (const p of this.explosions) p.draw(ctx);
        for (const p of this.pickups) p.draw(ctx);
    }

    clear() {
        this.thrusters = [];
        this.explosions = [];
        this.pickups = [];
    }
}

// ---- Starfield ----
class Starfield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        for (let i = 0; i < SETTINGS.STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                brightness: randomInt(100, 255),
                size: Math.random() < 0.15 ? 2 : 1,
            });
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    update(flyMode) {
        const speed = flyMode ? SETTINGS.STAR_FLY_SPEED : SETTINGS.STAR_NORMAL_SPEED;
        for (const s of this.stars) {
            s.y += speed * (s.size === 2 ? 1.5 : 1);
            if (s.y > this.height) {
                s.y = 0;
                s.x = Math.random() * this.width;
                s.brightness = randomInt(100, 255);
            }
        }
    }

    draw(ctx) {
        for (const s of this.stars) {
            const b = clamp(s.brightness + randomInt(-30, 30), 80, 255);
            ctx.fillStyle = `rgba(255,255,255,${b / 255})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        }
    }
}
