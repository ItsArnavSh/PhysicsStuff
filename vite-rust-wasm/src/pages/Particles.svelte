<script lang="ts">
    import { onMount } from "svelte";
    let canvas: HTMLCanvasElement;
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;
    let side = (width > height ? height : width) * 3 / 4;
    let ctx: CanvasRenderingContext2D | null;
    let gravity = 0;
    let damping = 0.9;
    let particles: Particle[] = [];
    let numParticles = 50;
    let radius = 10;
    let horizontalVelocity = 5; // Initial horizontal velocity
    let oldnum = numParticles;
    let oldradius = radius;
    let numberofCollisions = 0;
  
    class Particle {
      x: number;
      y: number;
      horizontalVelocity: number;
      verticalVelocity: number;
      radius: number;
      color: string;
  
      constructor(x: number, y: number, horizontalVelocity: number, verticalVelocity: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.horizontalVelocity = horizontalVelocity;
        this.verticalVelocity = verticalVelocity;
        this.radius = radius;
        this.color = color;
      }
  
      update() {
        this.y += this.verticalVelocity;
        this.x += this.horizontalVelocity;
        this.verticalVelocity += gravity;
        this.boundaryCheck();
      }
  
      boundaryCheck() {
        if (this.y > side - this.radius) {
          this.y = side - this.radius;
          this.verticalVelocity = -this.verticalVelocity * damping;
        }
        if (this.x > side - this.radius) {
          this.x = side - this.radius;
          this.horizontalVelocity = -this.horizontalVelocity * damping;
        }
        if (this.x < this.radius) {
          this.x = this.radius;
          this.horizontalVelocity = -this.horizontalVelocity * damping;
        }
        if (this.y < this.radius) {
          this.y = this.radius;
          this.verticalVelocity = -this.verticalVelocity * damping;
        }
      }
  
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }
  
    function checkCollision(p1: Particle, p2: Particle) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < p1.radius + p2.radius;
    }
  
    function resolveCollision(p1: Particle, p2: Particle) {
      const xVelocityDiff = p1.horizontalVelocity - p2.horizontalVelocity;
      const yVelocityDiff = p1.verticalVelocity - p2.verticalVelocity;
  
      const xDist = p2.x - p1.x;
      const yDist = p2.y - p1.y;
  
      if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(p2.y - p1.y, p2.x - p1.x);
  
        const m1 = p1.radius;
        const m2 = p2.radius;
  
        const u1 = rotate({ x: p1.horizontalVelocity, y: p1.verticalVelocity }, angle);
        const u2 = rotate({ x: p2.horizontalVelocity, y: p2.verticalVelocity }, angle);
  
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };
  
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);
  
        p1.horizontalVelocity = vFinal1.x;
        p1.verticalVelocity = vFinal1.y;
  
        p2.horizontalVelocity = vFinal2.x;
        p2.verticalVelocity = vFinal2.y;
        numberofCollisions++;
      }
    }
  
    function rotate(velocity: { x: number, y: number }, angle: number) {
      return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
      };
    }
  
    function restartSimulation() {
      oldnum=numParticles
      oldradius = radius
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        let x = Math.random() * (side - 2 * radius) + radius;
        let y = Math.random() * (side - 2 * radius) + radius;
        let horizontalVelocity = (Math.random() - 0.5) * 10;
        let verticalVelocity = (Math.random() - 0.5) * 10;
        let color = "white";
        particles.push(new Particle(x, y, horizontalVelocity, verticalVelocity, radius, color));
      }
      numberofCollisions = 0
    }
  
    onMount(() => {
      if (!canvas) {
        throw new Error("Unable to load Canvas");
      }
      canvas.width = side;
      canvas.height = side;
      ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("CTX Undefined");
      } else {
        ctx = ctx as CanvasRenderingContext2D;
      }
      restartSimulation();
      animate();
    });
  
    function animate() {
      if (ctx != null) {
        ctx.fillStyle = "#a1eced";
        ctx.fillRect(0, 0, side, side);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          for (let j = i + 1; j < particles.length; j++) {
            if (checkCollision(particles[i], particles[j])) {
              resolveCollision(particles[i], particles[j]);
            }
          }
          particles[i].draw(ctx);
        }
      }
      if(oldnum!=numParticles||oldradius!=radius)
      {
        restartSimulation()
      }
      requestAnimationFrame(animate);
    }
  </script>
  
  <div class="flex flex-row items-center justify-center h-lvh">
    <canvas bind:this={canvas}></canvas>
    <div class="flex flex-col items-center">
      <label>Particle Radius</label>
      <input type="range" min="1" max="20" bind:value={radius} />
  
      <label>Gravity</label>
      <input type="range" min="0" max="2" step="0.1" bind:value={gravity} />
  
      <label>Damping</label>
      <input type="range" min="0" max="1" step="0.1" bind:value={damping} />
  
      <label>Horizontal Velocity</label>
      <input type="range" min="-10" max="10" step="0.5" bind:value={horizontalVelocity} />
  
      <label>Number of Particles</label>
      <input type="range" min="1" max="500" bind:value={numParticles} />
  
      <button on:click={restartSimulation}>Restart Simulation</button>
      {numberofCollisions}
    </div>
  </div>
  