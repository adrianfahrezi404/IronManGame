// ============================================================
// game.js — Main Game Loop, State, Collisions & HUD
// ============================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('ironman_highscore') || '0');
        this.combo = 0;
        this.comboTimer = 0;

        this.lastTime = 0;
        this.screenShake = 0;

        // Subsystems
        this.input = new InputManager(this.canvas);
        this.starfield = null;
        this.particles = new ParticleManager();
        this.player = null;
        this.enemyMgr = new EnemyManager();

        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Click/tap to start or restart
        this.canvas.addEventListener('click', () => this._onClick());
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.state !== GAME_STATES.PLAYING) this._onClick();
        });

        // Menu animation
        this.menuPulse = 0;

        // Start loop
        requestAnimationFrame((t) => this._loop(t));
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.W = w;
        this.H = h;
        window._canvasH = h;

        if (!this.starfield) {
            this.starfield = new Starfield(w, h);
        } else {
            this.starfield.resize(w, h);
        }
        if (!this.player) {
            this.player = new Player(w, h);
        }
    }

    _onClick() {
        if (this.state === GAME_STATES.MENU) {
            this._startGame();
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this._startGame();
        }
    }

    _startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.screenShake = 0;
        this.player.reset(this.W, this.H);
        this.player.laserCooldown = 0.5; // grace period — prevent accidental fire on start
        this.particles.clear();
        this.enemyMgr.reset();
        document.getElementById('hud').style.opacity = '1';
        this._updateHUD();
    }

    // ---- Main Loop ----
    _loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this._update(dt);
        this._render();

        requestAnimationFrame((t) => this._loop(t));
    }

    // ---- Update ----
    _update(dt) {
        this.menuPulse += dt;
        this.starfield.update(this.state === GAME_STATES.PLAYING && this.input.up);

        if (this.state === GAME_STATES.PLAYING) {
            this._updatePlaying(dt);
        }

        this.particles.update();
        if (this.screenShake > 0) this.screenShake -= dt;
    }

    _updatePlaying(dt) {
        const p = this.player;
        const isMoving = p.update(dt, this.input, this.W, this.H, true);

        // Thruster particles
        if (isMoving || true) { // always subtle thrusters
            const count = isMoving ? 2 : 1;
            for (let i = 0; i < count; i++) {
                this.particles.addThruster(p.x - 10 * 1.5, p.y + p.hoverOffset + 50);
                this.particles.addThruster(p.x + 10 * 1.5, p.y + p.hoverOffset + 50);
            }
        }

        // Enemies
        this.enemyMgr.update(dt, p.x, p.y, this.W, this.H);

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        // Collision: laser → enemies
        const laser = p.getLaserLine();
        if (laser) {
            for (const e of this.enemyMgr.enemies) {
                if (!e.alive) continue;
                if (lineCircleHit(laser.x1, laser.y1, laser.x2, laser.y2, e.x, e.y, e.radius)) {
                    e.takeDamage(1);
                    this.particles.addExplosion(e.x, e.y, 5, [0, 255, 255]);
                    if (!e.alive) {
                        this._onEnemyKilled(e);
                    }
                }
            }
        }

        // Collision: enemy bullets → player
        for (const b of this.enemyMgr.bullets) {
            if (!b.alive) continue;
            if (dist(b.x, b.y, p.x, p.y) < p.radius + b.radius) {
                b.alive = false;
                p.takeDamage(SETTINGS.ENEMY_BULLET_DAMAGE);
                this.particles.addExplosion(b.x, b.y, 6, [255, 80, 80]);
                this.screenShake = 0.15;
            }
        }

        // Collision: enemy body → player
        for (const e of this.enemyMgr.enemies) {
            if (!e.alive) continue;
            if (dist(e.x, e.y, p.x, p.y) < p.radius + e.radius) {
                e.alive = false;
                p.takeDamage(SETTINGS.ENEMY_COLLISION_DAMAGE);
                this.particles.addExplosion(e.x, e.y, 20, [255, 100, 50]);
                this.screenShake = 0.25;
            }
        }

        // Collision: health pickups → player
        for (const pk of this.particles.pickups) {
            if (!pk.alive) continue;
            if (dist(pk.x, pk.y, p.x, p.y) < p.radius + pk.radius) {
                pk.alive = false;
                p.heal(SETTINGS.HEALTH_PICKUP_HEAL);
                this.particles.addExplosion(pk.x, pk.y, 8, [0, 255, 136]);
            }
        }

        this._updateHUD();

        // Death check
        if (!p.alive) {
            this.state = GAME_STATES.GAME_OVER;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('ironman_highscore', this.highScore.toString());
            }
            this.particles.addExplosion(p.x, p.y, 40, [255, 200, 50]);
            this.screenShake = 0.5;
            document.getElementById('hud').style.opacity = '0.3';
        }
    }

    _onEnemyKilled(enemy) {
        // Score
        this.combo++;
        this.comboTimer = 2;
        const multiplier = 1 + (this.combo - 1) * 0.25;
        this.score += Math.floor(enemy.score * multiplier);

        // Explosion
        const colors = [[255, 165, 0], [255, 255, 0], [255, 80, 30]];
        this.particles.addExplosion(enemy.x, enemy.y, 18, colors[randomInt(0, 2)]);

        // Health pickup chance
        if (Math.random() < SETTINGS.HEALTH_PICKUP_CHANCE) {
            this.particles.addPickup(enemy.x, enemy.y);
        }

        this.screenShake = 0.12;
    }

    _updateHUD() {
        const scoreEl = document.getElementById('score-value');
        const waveEl = document.getElementById('wave-value');
        const highEl = document.getElementById('high-value');
        const hpFill = document.getElementById('hp-fill');
        const hpText = document.getElementById('hp-text');
        const comboEl = document.getElementById('combo-value');

        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
        if (waveEl) waveEl.textContent = this.enemyMgr.wave || '-';
        if (highEl) highEl.textContent = this.highScore.toLocaleString();
        if (hpFill) {
            const ratio = this.player.health / this.player.maxHealth;
            hpFill.style.width = (ratio * 100) + '%';
            hpFill.style.background = ratio > 0.5
                ? `linear-gradient(90deg, ${COLORS.HEALTH_GREEN}, #00cc66)`
                : ratio > 0.25
                    ? `linear-gradient(90deg, #ffaa00, #ff6600)`
                    : `linear-gradient(90deg, ${COLORS.HEALTH_RED}, #cc0022)`;
        }
        if (hpText) hpText.textContent = Math.ceil(this.player.health);
        if (comboEl) {
            if (this.combo > 1) {
                comboEl.textContent = `x${this.combo}`;
                comboEl.style.opacity = '1';
            } else {
                comboEl.style.opacity = '0';
            }
        }
    }

    // ---- Render ----
    _render() {
        const ctx = this.ctx;
        const W = this.W;
        const H = this.H;

        ctx.save();

        // Screen shake
        if (this.screenShake > 0) {
            const intensity = this.screenShake * 12;
            ctx.translate(randomRange(-intensity, intensity), randomRange(-intensity, intensity));
        }

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, COLORS.BG_GRADIENT_TOP);
        bgGrad.addColorStop(1, COLORS.BG_GRADIENT_BOT);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        this.starfield.draw(ctx);

        // Particles (behind player)
        this.particles.draw(ctx);

        if (this.state === GAME_STATES.MENU) {
            this._renderMenu(ctx, W, H);
        } else if (this.state === GAME_STATES.PLAYING) {
            this._renderPlaying(ctx, W, H);
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this._renderGameOver(ctx, W, H);
        }

        // Virtual joystick
        this.input.drawJoystick(ctx);

        ctx.restore();
    }

    _renderMenu(ctx, W, H) {
        // Draw idle Iron Man
        this.player.hoverAngle += 0.03;
        this.player.hoverOffset = Math.sin(this.player.hoverAngle) * 6;
        this.player.x = W / 2;
        this.player.y = H * 0.52;
        this.player.draw(ctx);

        // Subtle idle thrusters
        if (Math.random() < 0.4) {
            this.particles.addThruster(this.player.x - 15, this.player.y + this.player.hoverOffset + 50);
            this.particles.addThruster(this.player.x + 15, this.player.y + this.player.hoverOffset + 50);
        }

        // Title
        const pulse = 0.85 + Math.sin(this.menuPulse * 2) * 0.15;
        ctx.save();
        ctx.globalAlpha = pulse;
        drawGlowText(ctx, 'IRON MAN MK-II', W / 2, H * 0.15,
            'bold 42px Orbitron, sans-serif', COLORS.IRON_GOLD, COLORS.IRON_GOLD, 25);
        ctx.globalAlpha = 1;
        drawGlowText(ctx, 'FLIGHT SIMULATION', W / 2, H * 0.15 + 45,
            '18px Orbitron, sans-serif', COLORS.IRON_CYAN, COLORS.IRON_CYAN, 12);

        // Start prompt
        const blink = Math.sin(this.menuPulse * 3) > 0 ? 1 : 0.4;
        ctx.globalAlpha = blink;
        const startText = this.input.isTouchDevice ? 'TAP TO START' : 'CLICK OR PRESS SPACE TO START';
        drawGlowText(ctx, startText, W / 2, H * 0.82,
            'bold 20px Orbitron, sans-serif', COLORS.WHITE, COLORS.IRON_CYAN, 10);
        ctx.restore();

        // Controls guide
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.font = '13px Orbitron, sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'center';
        if (this.input.isTouchDevice) {
            ctx.fillText('Left side: Move  |  Right side: Aim & Fire', W / 2, H * 0.92);
        } else {
            ctx.fillText('W/A/S/D: Move  |  Mouse: Aim  |  Click: Fire', W / 2, H * 0.90);
            ctx.fillText('Destroy enemy drones to score points!', W / 2, H * 0.93);
        }
        ctx.restore();

        // High score
        if (this.highScore > 0) {
            drawGlowText(ctx, `HIGH SCORE: ${this.highScore.toLocaleString()}`, W / 2, H * 0.22 + 45,
                '14px Orbitron, sans-serif', 'rgba(255,215,0,0.6)', 'transparent', 0);
        }
    }

    _renderPlaying(ctx, W, H) {
        this.enemyMgr.draw(ctx);
        this.player.draw(ctx);
        this.enemyMgr.drawWaveAnnounce(ctx, W, H);

        // Combo display
        if (this.combo > 1) {
            const alpha = Math.min(this.comboTimer, 1);
            ctx.save();
            ctx.globalAlpha = alpha;
            drawGlowText(ctx, `${this.combo}x COMBO`, W / 2, H * 0.14,
                'bold 28px Orbitron, sans-serif', COLORS.IRON_GOLD, COLORS.IRON_GOLD, 15);
            ctx.restore();
        }

        // Laser cooldown indicator
        if (this.player.laserCooldown > 0) {
            const ratio = 1 - (this.player.laserCooldown / SETTINGS.LASER_COOLDOWN);
            const barW = 40;
            const barH = 4;
            const bx = this.player.x - barW / 2;
            const by = this.player.y + this.player.hoverOffset - 90;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = COLORS.IRON_CYAN;
            ctx.fillRect(bx, by, barW * ratio, barH);
        }
    }

    _renderGameOver(ctx, W, H) {
        // Keep showing last state dimmed
        this.player.draw(ctx);
        this.enemyMgr.draw(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        // Game Over text
        drawGlowText(ctx, 'MISSION FAILED', W / 2, H * 0.3,
            'bold 46px Orbitron, sans-serif', COLORS.HEALTH_RED, COLORS.HEALTH_RED, 25);

        drawGlowText(ctx, `FINAL SCORE`, W / 2, H * 0.42,
            '16px Orbitron, sans-serif', 'rgba(255,255,255,0.6)', 'transparent', 0);

        drawGlowText(ctx, this.score.toLocaleString(), W / 2, H * 0.48,
            'bold 40px Orbitron, sans-serif', COLORS.IRON_GOLD, COLORS.IRON_GOLD, 20);

        drawGlowText(ctx, `WAVE ${this.enemyMgr.wave}`, W / 2, H * 0.55,
            '18px Orbitron, sans-serif', COLORS.IRON_CYAN, COLORS.IRON_CYAN, 8);

        if (this.score >= this.highScore && this.score > 0) {
            const blink = Math.sin(this.menuPulse * 4) > 0 ? 1 : 0.5;
            ctx.save();
            ctx.globalAlpha = blink;
            drawGlowText(ctx, '★ NEW HIGH SCORE ★', W / 2, H * 0.62,
                'bold 20px Orbitron, sans-serif', COLORS.IRON_GOLD, COLORS.IRON_GOLD, 15);
            ctx.restore();
        }

        const blink = Math.sin(this.menuPulse * 3) > 0 ? 1 : 0.4;
        ctx.save();
        ctx.globalAlpha = blink;
        const retryText = this.input.isTouchDevice ? 'TAP TO RETRY' : 'CLICK OR PRESS SPACE TO RETRY';
        drawGlowText(ctx, retryText, W / 2, H * 0.75,
            'bold 18px Orbitron, sans-serif', COLORS.WHITE, COLORS.IRON_CYAN, 10);
        ctx.restore();
    }
}

// ---- Bootstrap ----
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
