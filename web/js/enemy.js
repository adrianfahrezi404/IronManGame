// ============================================================
// enemy.js — Enemy Drones, Bullets & Wave Manager
// ============================================================

// ---- Enemy Bullet ----
class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * SETTINGS.ENEMY_BULLET_SPEED;
        this.vy = Math.sin(angle) * SETTINGS.ENEMY_BULLET_SPEED;
        this.radius = 3;
        this.alive = true;
    }

    update(canvasW, canvasH) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10 || this.x > canvasW + 10 || this.y < -10 || this.y > canvasH + 10) {
            this.alive = false;
        }
        return this.alive;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = COLORS.ENEMY_BULLET;
        ctx.fillStyle = COLORS.ENEMY_BULLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ---- Enemy Types ----
const ENEMY_TYPES = {
    DRONE: {
        hp: 2,
        speed: 1.5,
        radius: 16,
        shootInterval: 2.5,
        score: 100,
        color: COLORS.ENEMY_BODY,
    },
    FAST: {
        hp: 1,
        speed: 3,
        radius: 12,
        shootInterval: 3,
        score: 150,
        color: '#3FA06B',
    },
    HEAVY: {
        hp: 5,
        speed: 0.8,
        radius: 22,
        shootInterval: 1.5,
        score: 250,
        color: '#A03F3F',
    },
};

// ---- Enemy ----
class Enemy {
    constructor(x, y, type) {
        this.type = type;
        const cfg = ENEMY_TYPES[type];
        this.x = x;
        this.y = y;
        this.hp = cfg.hp;
        this.maxHp = cfg.hp;
        this.speed = cfg.speed;
        this.radius = cfg.radius;
        this.shootInterval = cfg.shootInterval;
        this.shootTimer = Math.random() * cfg.shootInterval;
        this.score = cfg.score;
        this.color = cfg.color;
        this.alive = true;
        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = randomRange(1.5, 3);
        this.wobbleAmp = randomRange(0.5, 1.5);
        this.pulseAngle = 0;
    }

    update(dt, playerX, playerY, canvasH) {
        // Move downward with wobble
        this.y += this.speed;
        this.wobbleAngle += dt * this.wobbleSpeed;
        this.x += Math.sin(this.wobbleAngle) * this.wobbleAmp;

        this.pulseAngle += 0.08;

        // Shoot timer
        this.shootTimer -= dt;

        // Off screen → dead
        if (this.y > canvasH + 40) {
            this.alive = false;
        }

        return this.alive;
    }

    shouldShoot() {
        if (this.shootTimer <= 0) {
            this.shootTimer = this.shootInterval + randomRange(-0.3, 0.3);
            return true;
        }
        return false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
        }
    }

    draw(ctx) {
        const pulse = 1 + Math.sin(this.pulseAngle) * 0.05;
        const r = this.radius * pulse;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Body hexagon
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Darker inner hexagon
        ctx.fillStyle = COLORS.ENEMY_DARK;
        ctx.beginPath();
        const inner = r * 0.6;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = Math.cos(angle) * inner;
            const py = Math.sin(angle) * inner;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.ENEMY_EYE;
        ctx.fillStyle = COLORS.ENEMY_EYE;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Wings / arms
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.lineTo(-r - 8, -5);
        ctx.moveTo(r, 0);
        ctx.lineTo(r + 8, -5);
        ctx.stroke();

        // HP bar (if damaged)
        if (this.hp < this.maxHp && this.maxHp > 1) {
            const bw = r * 1.6;
            const bh = 3;
            const ratio = this.hp / this.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(-bw / 2, -r - 8, bw, bh);
            ctx.fillStyle = ratio > 0.5 ? COLORS.HEALTH_GREEN : COLORS.HEALTH_RED;
            ctx.fillRect(-bw / 2, -r - 8, bw * ratio, bh);
        }

        ctx.restore();
    }
}

// ---- Wave / Enemy Manager ----
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.bullets = [];
        this.wave = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.spawnQueue = [];
        this.waveDelay = 0;
        this.waveAnnounce = 0;   // time to display wave text
        this.allWavesCleared = false;
    }

    reset() {
        this.enemies = [];
        this.bullets = [];
        this.wave = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.spawnQueue = [];
        this.waveDelay = 2;
        this.waveAnnounce = 0;
        this.allWavesCleared = false;
    }

    startNextWave(canvasW) {
        this.wave++;
        this.waveAnnounce = 2.5; // display "WAVE X" for 2.5s

        // Build spawn queue
        this.spawnQueue = [];
        const base = 3 + this.wave * 2;

        for (let i = 0; i < base; i++) {
            this.spawnQueue.push('DRONE');
        }
        if (this.wave >= 2) {
            const fastCount = Math.floor(this.wave * 0.8);
            for (let i = 0; i < fastCount; i++) {
                this.spawnQueue.push('FAST');
            }
        }
        if (this.wave >= 4) {
            const heavyCount = Math.floor((this.wave - 3) * 0.6);
            for (let i = 0; i < Math.min(heavyCount, 4); i++) {
                this.spawnQueue.push('HEAVY');
            }
        }

        // Shuffle
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }

        this.enemiesRemaining = this.spawnQueue.length;
        this.spawnTimer = 0;
    }

    update(dt, playerX, playerY, canvasW, canvasH) {
        // Wave delay
        if (this.waveDelay > 0) {
            this.waveDelay -= dt;
            if (this.waveDelay <= 0) {
                this.startNextWave(canvasW);
            }
            return;
        }

        // Wave announcement timer
        if (this.waveAnnounce > 0) this.waveAnnounce -= dt;

        // Spawn enemies from queue
        if (this.spawnQueue.length > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const type = this.spawnQueue.shift();
                const x = randomRange(50, canvasW - 50);
                const y = -30;
                this.enemies.push(new Enemy(x, y, type));
                this.spawnTimer = randomRange(0.5, 1.2);
            }
        }

        // Update enemies
        for (const e of this.enemies) {
            e.update(dt, playerX, playerY, canvasH);

            // Shoot
            if (e.alive && e.shouldShoot()) {
                const angle = Math.atan2(playerY - e.y, playerX - e.x);
                this.bullets.push(new EnemyBullet(e.x, e.y, angle));
            }
        }
        this.enemies = this.enemies.filter(e => e.alive);

        // Update bullets
        this.bullets = this.bullets.filter(b => b.update(canvasW, canvasH));

        // Check if wave complete
        if (this.spawnQueue.length === 0 && this.enemies.length === 0 && this.waveDelay <= 0) {
            this.waveDelay = 3; // pause before next wave
        }
    }

    draw(ctx) {
        for (const e of this.enemies) e.draw(ctx);
        for (const b of this.bullets) b.draw(ctx);
    }

    /** Draw wave announcement overlay */
    drawWaveAnnounce(ctx, canvasW, canvasH) {
        if (this.waveAnnounce <= 0) return;
        const alpha = Math.min(this.waveAnnounce, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        drawGlowText(ctx, `WAVE ${this.wave}`, canvasW / 2, canvasH * 0.3,
            'bold 48px Orbitron, sans-serif', COLORS.IRON_GOLD, COLORS.IRON_GOLD, 30);
        drawGlowText(ctx, 'DESTROY ALL ENEMIES', canvasW / 2, canvasH * 0.3 + 50,
            '16px Orbitron, sans-serif', 'rgba(255,255,255,0.7)', 'transparent', 0);
        ctx.restore();
    }
}
