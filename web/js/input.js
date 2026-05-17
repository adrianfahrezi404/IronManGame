// ============================================================
// input.js — Keyboard, Mouse & Virtual Joystick
// ============================================================

class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height / 2;
        this.mouseDown = false;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Virtual joystick
        this.joystick = {
            active: false,
            baseX: 0, baseY: 0,
            stickX: 0, stickY: 0,
            dx: 0, dy: 0,
            touchId: null,
        };

        // Fire touch
        this.fireTouch = { active: false, touchId: null };

        // Aim touch (right side)
        this.aimTouch = { touchId: null };

        this._setupKeyboard();
        this._setupMouse();
        if (this.isTouchDevice) this._setupTouch();
    }

    // ---- Keyboard ----
    _setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // ---- Mouse ----
    _setupMouse() {
        this.canvas.addEventListener('mousemove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - r.left;
            this.mouseY = e.clientY - r.top;
        });
        this.canvas.addEventListener('mousedown', () => { this.mouseDown = true; });
        this.canvas.addEventListener('mouseup', () => { this.mouseDown = false; });
    }

    // ---- Touch / Virtual Joystick ----
    _setupTouch() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                const pos = this._touchPos(t);
                if (pos.x < this.canvas.width * 0.4) {
                    // Left side → joystick
                    this.joystick.active = true;
                    this.joystick.baseX = pos.x;
                    this.joystick.baseY = pos.y;
                    this.joystick.stickX = pos.x;
                    this.joystick.stickY = pos.y;
                    this.joystick.dx = 0;
                    this.joystick.dy = 0;
                    this.joystick.touchId = t.identifier;
                } else {
                    // Right side → aim + fire
                    this.mouseX = pos.x;
                    this.mouseY = pos.y;
                    this.fireTouch.active = true;
                    this.fireTouch.touchId = t.identifier;
                    this.aimTouch.touchId = t.identifier;
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                const pos = this._touchPos(t);
                if (t.identifier === this.joystick.touchId) {
                    const maxR = SETTINGS.JOYSTICK_RADIUS;
                    let dx = pos.x - this.joystick.baseX;
                    let dy = pos.y - this.joystick.baseY;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d > maxR) { dx = dx / d * maxR; dy = dy / d * maxR; }
                    this.joystick.stickX = this.joystick.baseX + dx;
                    this.joystick.stickY = this.joystick.baseY + dy;
                    this.joystick.dx = dx / maxR;
                    this.joystick.dy = dy / maxR;
                }
                if (t.identifier === this.aimTouch.touchId) {
                    this.mouseX = pos.x;
                    this.mouseY = pos.y;
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === this.joystick.touchId) {
                    this.joystick.active = false;
                    this.joystick.dx = 0;
                    this.joystick.dy = 0;
                    this.joystick.touchId = null;
                }
                if (t.identifier === this.fireTouch.touchId) {
                    this.fireTouch.active = false;
                    this.fireTouch.touchId = null;
                    this.aimTouch.touchId = null;
                }
            }
        };
        this.canvas.addEventListener('touchend', endTouch);
        this.canvas.addEventListener('touchcancel', endTouch);
    }

    _touchPos(touch) {
        const r = this.canvas.getBoundingClientRect();
        return {
            x: touch.clientX - r.left,
            y: touch.clientY - r.top,
        };
    }

    // ---- Queries ----
    get up()    { return this.keys['KeyW'] || this.keys['ArrowUp']    || this.joystick.dy < -SETTINGS.JOYSTICK_DEAD_ZONE; }
    get down()  { return this.keys['KeyS'] || this.keys['ArrowDown']  || this.joystick.dy >  SETTINGS.JOYSTICK_DEAD_ZONE; }
    get left()  { return this.keys['KeyA'] || this.keys['ArrowLeft']  || this.joystick.dx < -SETTINGS.JOYSTICK_DEAD_ZONE; }
    get right() { return this.keys['KeyD'] || this.keys['ArrowRight'] || this.joystick.dx >  SETTINGS.JOYSTICK_DEAD_ZONE; }
    get firing(){ return this.mouseDown || this.fireTouch.active || this.keys['Space']; }

    /** Get joystick normalized direction for analog movement */
    getJoystickDir() {
        if (!this.joystick.active) return { x: 0, y: 0 };
        const deadzone = SETTINGS.JOYSTICK_DEAD_ZONE;
        let dx = Math.abs(this.joystick.dx) > deadzone ? this.joystick.dx : 0;
        let dy = Math.abs(this.joystick.dy) > deadzone ? this.joystick.dy : 0;
        return { x: dx, y: dy };
    }

    // ---- Draw virtual joystick (called from game render) ----
    drawJoystick(ctx) {
        if (!this.isTouchDevice) return;
        if (!this.joystick.active) return;

        const { baseX, baseY, stickX, stickY } = this.joystick;
        const R = SETTINGS.JOYSTICK_RADIUS;

        // Base
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(baseX, baseY, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stick
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(stickX, stickY, R * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,255,0.45)';
        ctx.fill();
        ctx.restore();
    }
}
