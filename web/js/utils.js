// ============================================================
// utils.js — Constants & Utility Functions
// ============================================================

const COLORS = {
    IRON_RED: '#DC143C',
    IRON_DARK_RED: '#8B0000',
    IRON_GOLD: '#FFD700',
    IRON_CYAN: '#00FFFF',
    BG_DARK: '#14141E',
    BG_GRADIENT_TOP: '#0a0a14',
    BG_GRADIENT_BOT: '#1a1a2e',
    ENEMY_BODY: '#6B3FA0',
    ENEMY_DARK: '#4a2a70',
    ENEMY_EYE: '#FF3333',
    ENEMY_BULLET: '#FF5555',
    HEALTH_GREEN: '#00FF88',
    HEALTH_RED: '#FF3344',
    HEALTH_BG: 'rgba(255,255,255,0.1)',
    SCORE_GOLD: '#FFD700',
    UI_GLASS: 'rgba(255, 255, 255, 0.08)',
    UI_GLASS_BORDER: 'rgba(255, 255, 255, 0.15)',
    WHITE: '#FFFFFF',
};

const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
};

const SETTINGS = {
    PLAYER_SPEED: 5,
    PLAYER_MAX_HEALTH: 100,
    LASER_COOLDOWN: 0.35,
    LASER_DURATION: 0.15,
    ENEMY_BULLET_SPEED: 4,
    ENEMY_BULLET_DAMAGE: 8,
    ENEMY_COLLISION_DAMAGE: 15,
    ENEMY_BASE_SCORE: 100,
    HEALTH_PICKUP_HEAL: 20,
    HEALTH_PICKUP_CHANCE: 0.25,
    PARTICLE_FADE_STEP: 15,
    STAR_COUNT: 60,
    STAR_NORMAL_SPEED: 1,
    STAR_FLY_SPEED: 12,
    JOYSTICK_RADIUS: 55,
    JOYSTICK_DEAD_ZONE: 0.2,
};

// ---- Utility Functions ----

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if a line segment intersects a circle.
 * Returns true if the line from (x1,y1)→(x2,y2) passes within radius r of (cx,cy).
 */
function lineCircleHit(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;
    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;
    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

/** Draw text with a glow/shadow effect */
function drawGlowText(ctx, text, x, y, font, color, glowColor, blur) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = blur || 15;
    ctx.shadowColor = glowColor || color;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.restore();
}
