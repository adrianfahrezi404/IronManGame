// ============================================================
// player.js — Iron Man Character (ported from Form1.cs)
// ============================================================

class Player {
    constructor(canvasW, canvasH) {
        this.x = canvasW / 2;
        this.y = canvasH - 150;
        this.health = SETTINGS.PLAYER_MAX_HEALTH;
        this.maxHealth = SETTINGS.PLAYER_MAX_HEALTH;
        this.alive = true;

        // Animation
        this.hoverAngle = 0;
        this.hoverOffset = 0;
        this.armRotation = 90; // degrees, down

        // Laser
        this.laserCooldown = 0;
        this.laserActive = false;    // true while beam is visible
        this.laserCanDamage = false; // true on cooldown tick (for hit detection)
        this.laserAngleRad = 0;      // angle in radians for the active beam

        // Hit flash
        this.hitFlash = 0;

        // Dimensions (for collision)
        this.radius = 30;
    }

    reset(canvasW, canvasH) {
        this.x = canvasW / 2;
        this.y = canvasH - 150;
        this.health = this.maxHealth;
        this.alive = true;
        this.hoverAngle = 0;
        this.hoverOffset = 0;
        this.armRotation = 90;
        this.laserCooldown = 0;
        this.laserActive = false;
        this.laserCanDamage = false;
        this.hitFlash = 0;
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.health -= amount;
        this.hitFlash = 0.25;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    update(dt, input, canvasW, canvasH, isPlaying) {
        if (!this.alive) return;

        // Movement
        const spd = SETTINGS.PLAYER_SPEED;
        const joyDir = input.getJoystickDir();
        let dx = 0, dy = 0;

        if (input.left)  dx = -1;
        if (input.right) dx = 1;
        if (input.up)    dy = -1;
        if (input.down)  dy = 1;

        // Analog joystick override
        if (joyDir.x !== 0 || joyDir.y !== 0) {
            dx = joyDir.x;
            dy = joyDir.y;
        }

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
        }

        this.x += dx * spd;
        this.y += dy * spd;

        // Bounds
        this.x = clamp(this.x, 25, canvasW - 25);
        this.y = clamp(this.y, 60, canvasH - 50);

        // Hover animation
        this.hoverAngle += 0.08;
        this.hoverOffset = Math.sin(this.hoverAngle) * 4;

        // Arm rotation toward mouse
        const armWorldX = this.x + 15 * 1.5;
        const armWorldY = (this.y + this.hoverOffset) - 20 * 1.5;
        const deltaX = input.mouseX - armWorldX;
        const deltaY = input.mouseY - armWorldY;
        const rad = Math.atan2(deltaY, deltaX);
        this.armRotation = rad * (180 / Math.PI);

        // Laser cooldown
        if (this.laserCooldown > 0) this.laserCooldown -= dt;
        this.laserCanDamage = false;

        // Fire — laser stays ON while Space/Click is held
        if (isPlaying && input.firing) {
            this.laserActive = true;
            this.laserAngleRad = rad;
            // Damage tick on cooldown
            if (this.laserCooldown <= 0) {
                this.laserCooldown = SETTINGS.LASER_COOLDOWN;
                this.laserCanDamage = true;
            }
        } else {
            this.laserActive = false;
        }

        // Hit flash
        if (this.hitFlash > 0) this.hitFlash -= dt;

        // Thruster particles
        const isMoving = dx !== 0 || dy !== 0;
        return isMoving;
    }

    /** Get laser start & end points (world coords) for collision detection */
    getLaserLine() {
        if (!this.laserActive || !this.laserCanDamage) return null;
        const scale = 1.5;
        const originX = this.x + 15 * scale;
        const originY = (this.y + this.hoverOffset) - 20 * scale;
        // Tip of the arm in rotated space → world
        const armLen = 30 * scale; // end of the gold hand piece
        const cos = Math.cos(this.laserAngleRad);
        const sin = Math.sin(this.laserAngleRad);
        const startX = originX + cos * armLen;
        const startY = originY + sin * armLen;
        const beamLen = 3000;
        const endX = startX + cos * beamLen;
        const endY = startY + sin * beamLen;
        return { x1: startX, y1: startY, x2: endX, y2: endY, cos, sin };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.hoverOffset);
        ctx.scale(1.5, 1.5);

        // Hit flash overlay
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.6 + Math.sin(this.hitFlash * 40) * 0.4;
        }

        this._drawLegs(ctx);
        this._drawBody(ctx);
        this._drawHead(ctx);
        this._drawArms(ctx);

        ctx.restore();
    }

    _drawHead(ctx) {
        // Helm
        ctx.fillStyle = COLORS.IRON_RED;
        ctx.fillRect(-10, -50, 20, 25);

        // Mask
        ctx.fillStyle = COLORS.IRON_GOLD;
        ctx.beginPath();
        ctx.moveTo(-8, -45);
        ctx.lineTo(8, -45);
        ctx.lineTo(8, -30);
        ctx.lineTo(0, -25);
        ctx.lineTo(-8, -30);
        ctx.closePath();
        ctx.fill();

        // Eyes (with glow)
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.IRON_CYAN;
        ctx.fillStyle = COLORS.IRON_CYAN;
        ctx.fillRect(-6, -40, 4, 2);
        ctx.fillRect(2, -40, 4, 2);
        ctx.restore();
    }

    _drawBody(ctx) {
        // Trapezoid torso
        ctx.fillStyle = COLORS.IRON_DARK_RED;
        ctx.beginPath();
        ctx.moveTo(-15, -25);
        ctx.lineTo(15, -25);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        // Arc Reactor glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.IRON_CYAN;
        ctx.fillStyle = COLORS.IRON_CYAN;
        ctx.beginPath();
        ctx.arc(0, -14, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = COLORS.WHITE;
        ctx.beginPath();
        ctx.arc(0, -14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _drawLegs(ctx) {
        // Left leg
        ctx.fillStyle = COLORS.IRON_DARK_RED;
        ctx.fillRect(-12, 10, 8, 30);
        ctx.fillStyle = COLORS.IRON_GOLD;
        ctx.fillRect(-12, 35, 8, 10);

        // Right leg
        ctx.fillStyle = COLORS.IRON_DARK_RED;
        ctx.fillRect(4, 10, 8, 30);
        ctx.fillStyle = COLORS.IRON_GOLD;
        ctx.fillRect(4, 35, 8, 10);
    }

    _drawArms(ctx) {
        // Left arm (static)
        ctx.fillStyle = COLORS.IRON_RED;
        ctx.fillRect(-22, -25, 8, 25);
        ctx.fillStyle = COLORS.IRON_GOLD;
        ctx.fillRect(-22, -5, 8, 8);

        // Right arm (rotated toward mouse)
        ctx.save();
        ctx.translate(15, -20);
        ctx.rotate(this.armRotation * Math.PI / 180);

        ctx.fillStyle = COLORS.IRON_RED;
        ctx.fillRect(0, -4, 25, 8);
        ctx.fillStyle = COLORS.IRON_GOLD;
        ctx.fillRect(20, -5, 10, 10);

        // Laser beam — visible while Space/Click is held
        if (this.laserActive) {
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = COLORS.IRON_CYAN;
            const grad = ctx.createLinearGradient(30, 0, 1500, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0.95)');
            grad.addColorStop(0.3, COLORS.IRON_CYAN);
            grad.addColorStop(1, 'rgba(0,255,255,0.1)');
            ctx.fillStyle = grad;
            ctx.fillRect(30, -2, 3000, 4);

            // Muzzle flash
            ctx.fillStyle = COLORS.WHITE;
            ctx.beginPath();
            ctx.arc(30, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }
}
