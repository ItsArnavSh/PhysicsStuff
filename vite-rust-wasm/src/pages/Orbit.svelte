<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { get } from "svelte/store";

    let canvas: HTMLCanvasElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let side = height * 4 / 5;
    let ctx: CanvasRenderingContext2D | null;
    let distance: number;
    let velocity: number;
    let maxVelocity = 0;
    let potentialEnergy: number;
    let kineticEnergy: number;
    let totalEnergy: number;

    const minDistance = 5; // Minimum distance threshold
    const softeningParameter = 0.1; // Softening parameter

    const centralMass = writable(5000);
    const bodyMass = writable(10);
    const initialDx = writable(0);
    const initialDy = writable(2);

    let centralMassValue = 5000;
    let bodyMassValue = 10;
    let dx = 0;
    let dy = 2;
    let G = 1;

    let x = side / 4, y = side / 4;

    centralMass.subscribe(value => {
        centralMassValue = value;
        resetSimulation();
    });

    bodyMass.subscribe(value => {
        bodyMassValue = value;
        resetSimulation();
    });

    initialDx.subscribe(value => {
        dx = value;
        resetSimulation();
    });

    initialDy.subscribe(value => {
        dy = value;
        resetSimulation();
    });

    onMount(() => {
        if (canvas != null) {
            ctx = canvas.getContext("2d");
            canvas.height = side;
            canvas.width = side;
            draw();
        }
    });

    function draw() {
        if (ctx != null) {
            distance = Math.sqrt((side / 2 - x) ** 2 + (side / 2 - y) ** 2);
            if (distance < minDistance) {
                distance = minDistance; // Set to minimum distance threshold
            }
            if (velocity > maxVelocity) {
                maxVelocity = velocity;
            }

            // Apply softening parameter to the distance
            let softenedDistance = Math.sqrt(distance ** 2 + softeningParameter ** 2);
            let force = G * bodyMassValue * centralMassValue / (softenedDistance * softenedDistance);
            dx += force * ((side / 2 - x) / softenedDistance) / bodyMassValue;
            dy += force * ((side / 2 - y) / softenedDistance) / bodyMassValue;
            velocity = Math.sqrt(dx ** 2 + dy ** 2);
            x += dx;
            y += dy;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, side, side);
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(side / 2, side / 2, 10, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();

            // Draw the trail effect
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, velocity / 10)})`;
            ctx.arc(x, y, 5, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.closePath();

            potentialEnergy = -G * centralMassValue * bodyMassValue / softenedDistance;
            kineticEnergy = 0.5 * bodyMassValue * (dx ** 2 + dy ** 2);
            totalEnergy = potentialEnergy + kineticEnergy;
            requestAnimationFrame(draw);
        }
    }

    function resetSimulation() {
        x = side / 4;
        y = side / 4;
        maxVelocity = 0;
        dx = get(initialDx);
        dy = get(initialDy);
        draw();
    }
</script>

<style>
    body {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #282c34;
        color: white;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
    }

    canvas {
        border: 1px solid white;
        margin-top: 20px;
    }

    h1 {
        font-size: 1.5em;
        margin: 10px;
    }

    div {
        margin: 10px;
    }

    label {
        display: inline-block;
        width: 200px;
        text-align: right;
        margin-right: 10px;
    }

    input[type="range"] {
        width: 200px;
    }
</style>

<canvas bind:this={canvas}></canvas>
<h1>Distance: {Math.round(distance)}</h1>
<h1>Max Velocity: {Math.round(maxVelocity)}</h1>
<h1>Velocity: {Math.round(velocity)}</h1>

<div>
    <label for="centralMass">Central Mass: {centralMassValue}</label>
    <input type="range" id="centralMass" min="100" max="10000" bind:value={$centralMass} step="100">
</div>
<div>
    <label for="bodyMass">Body Mass: {bodyMassValue}</label>
    <input type="range" id="bodyMass" min="1" max="100" bind:value={$bodyMass} step="1">
</div>
<div>
    <label for="initialDx">Initial Horizontal Velocity: {get(initialDx)}</label>
    <input type="range" id="initialDx" min="-10" max="10" bind:value={$initialDx} step="0.1">
</div>
<div>
    <label for="initialDy">Initial Vertical Velocity: {get(initialDy)}</label>
    <input type="range" id="initialDy" min="-10" max="10" bind:value={$initialDy} step="0.1">
</div>
