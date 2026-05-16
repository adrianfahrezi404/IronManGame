using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace IronManGame
{
    public partial class Form1 : Form
    {
        // Timer sistem
        private Timer gameTimer;

        // Tombol & Label UI
        private Button btnAction;
        private Label lblInfo;

        // Variabel Kontrol (WASD)
        private bool goUp, goDown, goLeft, goRight;
        private float speed = 8f;

        // Variabel Player
        private IronManState currentState = IronManState.Idle;
        private float playerX, playerY;
        private float hoverOffset = 0;
        private float hoverAngle = 0;
        private float armRotation = 0;

        // Variabel Lingkungan
        private List<Particle> thrusters = new List<Particle>();
        private List<Point> stars = new List<Point>();
        private Random rnd = new Random();
        private Point mousePos;

        public Form1()
        {
            InitializeComponent();
            SetupWorld();
        }

        private void SetupWorld()
        {
            this.Text = "Iron Man MK-II: Flight Simulation";
            this.Size = new Size(900, 600);
            this.BackColor = Color.FromArgb(20, 20, 30);
            this.DoubleBuffered = true;
            this.StartPosition = FormStartPosition.CenterScreen;

            this.KeyPreview = true;

            this.KeyDown += new KeyEventHandler(Form1_KeyDown);
            this.KeyUp += new KeyEventHandler(Form1_KeyUp);
            this.MouseMove += (s, e) => { mousePos = e.Location; };

            playerX = this.ClientSize.Width / 2;
            playerY = this.ClientSize.Height - 150;

            btnAction = new Button();
            btnAction.Text = "Next Phase >>";
            btnAction.Location = new Point(20, 20);
            btnAction.Size = new Size(120, 40);
            btnAction.BackColor = Color.White;
            btnAction.Click += (s, e) => ChangeState();
            btnAction.TabStop = false;
            this.Controls.Add(btnAction);

            lblInfo = new Label();
            lblInfo.Text = "State: IDLE (Use W-A-S-D to Move!)";
            lblInfo.ForeColor = Color.Cyan;
            lblInfo.Location = new Point(150, 30);
            lblInfo.AutoSize = true;
            lblInfo.Font = new Font("Arial", 12, FontStyle.Bold);
            this.Controls.Add(lblInfo);

            for (int i = 0; i < 50; i++) stars.Add(new Point(rnd.Next(Width), rnd.Next(Height)));

            gameTimer = new Timer();
            gameTimer.Interval = 20;
            gameTimer.Tick += GameUpdate;
            gameTimer.Start();
        }

        private void Form1_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.W) goUp = true;
            if (e.KeyCode == Keys.S) goDown = true;
            if (e.KeyCode == Keys.A) goLeft = true;
            if (e.KeyCode == Keys.D) goRight = true;
        }

        private void Form1_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.W) goUp = false;
            if (e.KeyCode == Keys.S) goDown = false;
            if (e.KeyCode == Keys.A) goLeft = false;
            if (e.KeyCode == Keys.D) goRight = false;
        }

        private void ChangeState()
        {
            switch (currentState)
            {
                case IronManState.Idle: currentState = IronManState.Aim; break;
                case IronManState.Aim: currentState = IronManState.Fire; break;
                case IronManState.Fire: currentState = IronManState.Fly; break;
                case IronManState.Fly:
                    currentState = IronManState.Idle;
                    playerX = this.ClientSize.Width / 2;
                    playerY = this.ClientSize.Height - 150;
                    break;
            }
            lblInfo.Text = "State: " + currentState;
            this.Focus();
        }

        private void GameUpdate(object sender, EventArgs e)
        {
            if (goUp && playerY > 50) playerY -= speed;
            if (goDown && playerY < this.ClientSize.Height - 50) playerY += speed;
            if (goLeft && playerX > 20) playerX -= speed;
            if (goRight && playerX < this.ClientSize.Width - 20) playerX += speed;

            if (currentState != IronManState.Fly)
            {
                hoverAngle += 0.1f;
                hoverOffset = (float)Math.Sin(hoverAngle) * 5;
            }

            if (currentState == IronManState.Fly || goUp || goDown || goLeft || goRight)
            {
                int jumlah = (currentState == IronManState.Fly) ? 5 : 2;
                for (int i = 0; i < jumlah; i++)
                {
                    thrusters.Add(new Particle(playerX - 10, playerY + 80, rnd));
                    thrusters.Add(new Particle(playerX + 10, playerY + 80, rnd));
                }
            }
            for (int i = thrusters.Count - 1; i >= 0; i--)
            {
                if (!thrusters[i].Update()) thrusters.RemoveAt(i);
            }

            if (currentState == IronManState.Fly)
            {
                for (int i = 0; i < stars.Count; i++)
                {
                    stars[i] = new Point(stars[i].X, stars[i].Y + 15);
                    if (stars[i].Y > Height) stars[i] = new Point(rnd.Next(Width), 0);
                }
            }
            else
            {
                for (int i = 0; i < stars.Count; i++)
                {
                    stars[i] = new Point(stars[i].X, stars[i].Y + 1);
                    if (stars[i].Y > Height) stars[i] = new Point(rnd.Next(Width), 0);
                }
            }

            if (currentState == IronManState.Aim || currentState == IronManState.Fire)
            {
                float deltaX = mousePos.X - playerX;
                float deltaY = mousePos.Y - (playerY - 20);
                double radian = Math.Atan2(deltaY, deltaX);
                armRotation = (float)(radian * (180 / Math.PI));
            }
            else
            {
                armRotation = 90;
            }

            this.Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            g.FillRectangle(new SolidBrush(Color.FromArgb(20, 20, 30)), this.ClientRectangle);

            foreach (Point star in stars)
            {
                int b = rnd.Next(100, 255);
                g.FillRectangle(new SolidBrush(Color.FromArgb(b, Color.White)), star.X, star.Y, 2, 2);
            }

            foreach (Particle p in thrusters)
            {
                using (Brush brush = new SolidBrush(Color.FromArgb(p.Life, p.BaseColor)))
                {
                    g.FillEllipse(brush, p.X, p.Y, p.Size, p.Size);
                }
            }

            GraphicsState state = g.Save();
            g.TranslateTransform(playerX, playerY + hoverOffset);
            g.ScaleTransform(1.5f, 1.5f);

            DrawLegs(g);
            DrawBody(g);
            DrawHead(g);
            DrawArms(g);

            g.Restore(state);
        }

        private void DrawHead(Graphics g)
        {
            g.FillRectangle(Brushes.Crimson, -10, -50, 20, 25);
            Point[] mask = { new Point(-8, -45), new Point(8, -45), new Point(8, -30), new Point(0, -25), new Point(-8, -30) };
            g.FillPolygon(Brushes.Gold, mask);
            g.FillRectangle(Brushes.Cyan, -6, -40, 4, 1);
            g.FillRectangle(Brushes.Cyan, 2, -40, 4, 1);
        }

        private void DrawBody(Graphics g)
        {
            Point[] body = { new Point(-15, -25), new Point(15, -25), new Point(10, 10), new Point(-10, 10) };
            g.FillPolygon(Brushes.DarkRed, body);
            g.FillEllipse(Brushes.Cyan, -4, -18, 8, 8);
            g.FillEllipse(Brushes.White, -2, -16, 4, 4);
        }

        private void DrawLegs(Graphics g)
        {
            g.FillRectangle(Brushes.DarkRed, -12, 10, 8, 30);
            g.FillRectangle(Brushes.Gold, -12, 35, 8, 10);
            g.FillRectangle(Brushes.DarkRed, 4, 10, 8, 30);
            g.FillRectangle(Brushes.Gold, 4, 35, 8, 10);
        }

        private void DrawArms(Graphics g)
        {
            g.FillRectangle(Brushes.Crimson, -22, -25, 8, 25);
            g.FillRectangle(Brushes.Gold, -22, -5, 8, 8);

            GraphicsState armState = g.Save();
            g.TranslateTransform(15, -20);
            g.RotateTransform(armRotation);

            g.FillRectangle(Brushes.Crimson, 0, -4, 25, 8);
            g.FillRectangle(Brushes.Gold, 20, -5, 10, 10);

            if (currentState == IronManState.Fire)
            {
                using (Brush laser = new LinearGradientBrush(new Point(30, 0), new Point(1500, 0), Color.White, Color.Cyan))
                {
                    g.FillRectangle(laser, 30, -2, 3000, 4);
                }
                g.FillEllipse(Brushes.White, 25, -6, 12, 12);
            }
            g.Restore(armState);
        }
    }

    public enum IronManState { Idle, Aim, Fire, Fly }

    public class Particle
    {
        public float X, Y;
        public float Size;
        public float SpeedY, SpeedX;
        public int Life;
        public Color BaseColor;

        public Particle(float x, float y, Random rnd)
        {
            X = x;
            Y = y;
            Size = rnd.Next(3, 8);
            SpeedY = rnd.Next(2, 8);
            SpeedX = (float)(rnd.NextDouble() - 0.5) * 2;
            Life = 255;
            BaseColor = (rnd.Next(2) == 0) ? Color.Orange : Color.Yellow;
        }

        public bool Update()
        {
            Y += SpeedY;
            X += SpeedX;
            Life -= 15;
            return Life > 0;
        }
    }
}