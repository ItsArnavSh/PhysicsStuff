<script lang="ts">
    import { onMount } from "svelte";
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;
    let side = (width > height ? height : width) * 3 / 4;
    let ctx: CanvasRenderingContext2D | null;

    let angle = Math.PI / 4; // Initial angle (45 degrees)
    let angularVelocity = 0;
    let angularAcceleration = 0;
    let length = side / 2; // Length of the pendulum
    let gravity = 0.98; // Gravity constant
    let damping = 1; // Damping factor to simulate air resistance
    let mainX = side / 2;
    let mainY = 0;
    let canvas: HTMLCanvasElement;

    onMount(() => {
        if (canvas != null)
            ctx = canvas.getContext("2d");
        else
            throw new Error("Canvas Not Found");
        canvas.width = side;
        canvas.height = side;
        draw();
    });

    function draw() {
        if (ctx != null) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, side, side);

            // Calculate the position of the pendulum bob
            let x = mainX + length * Math.sin(angle);
            let y = mainY + length * Math.cos(angle);

            // Draw the pendulum rod
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(mainX, mainY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();

            // Draw the pendulum bob
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.closePath();

            // Calculate the angular acceleration (torque)
            angularAcceleration = (-gravity / length) * Math.sin(angle);
            
            // Update the angular velocity and angle
            angularVelocity += angularAcceleration;
            angularVelocity *= damping; // Apply damping
            angle += angularVelocity;

            requestAnimationFrame(draw);
        }
    }
</script>

<div>
    <canvas bind:this={canvas}></canvas>
</div>
