import { Boid, type Obstacle } from "./Boid.js";
import { ArraySet } from "open-utilities/core/dataStructures/mod.js";
import { Matrix4, Path, Rect, Vector2 } from "open-utilities/core/maths/mod.js";
import { AnimationFrameScheduler, HTMLCanvas2D } from "open-utilities/web/ui/mod.js";
import { Circle } from "open-utilities/core/maths/mod.js";
import { Color, ShapeStyle } from "open-utilities/core/ui/mod.js";

import { render } from "solid-js/web";
import { App } from "./ui/App.jsx";
import info from "./info.html?raw";

const canvas = document.createElement("canvas");
const message = document.createElement("div");

message.style.padding=".5em";
message.style.display="flex";
message.style.alignItems="end";
message.style.fontSize="2vmin";
message.style.pointerEvents="none";
message.style.opacity="1";
message.style.transition="opacity .3s ease"; 
message.textContent = "Press the screen to place an obstacle.";

render(()=>App({ 
	layers: [canvas, message], 
	info: info,
	githubLink: "https://github.com/TheCymaera/boids"
}), document.body);

const renderer = HTMLCanvas2D.fromCanvas(canvas);

// adapt to screen size
const viewport = Rect.zero.clone();
new ResizeObserver(()=>{
	const maxViewportLength = 80;

	const ratio = canvas.clientHeight / canvas.clientWidth;
	const width  = maxViewportLength * (ratio < 1 ? 1 : 1 / ratio);
	const height = maxViewportLength * (ratio < 1 ? ratio : 1);

	renderer.setBitmapDimensions(new Vector2(canvas.clientWidth * devicePixelRatio, canvas.clientHeight * devicePixelRatio));
	viewport.copy(Rect.fromCenter(Vector2.zero, width, height));
	renderer.setTransform(Matrix4.ortho(viewport));

	draw();
}).observe(canvas);


const boids = new ArraySet<Boid>();
const obstacles = new ArraySet<Obstacle>();

// create random boids
for (let i = 0; i < 200; i++) {
	const boid = new Boid();
	boid.velocity.rotate(Math.random() * Math.PI * 2);
	boids.add(boid);
}

// main loop
AnimationFrameScheduler.periodic((elapsedTime)=>{
	if (elapsedTime.milliseconds > 100) elapsedTime.milliseconds = 100;

	const bounds = viewport.clone();
	bounds.deflate(Math.min(bounds.height, bounds.width) * .2);

	for (const boid of boids) boid.update(elapsedTime, boids, obstacles, bounds);
	draw();
});


function draw() {
	const color = HTMLCanvas2D.sampleCSSColor(getComputedStyle(canvas).getPropertyValue("color"));

	renderer.clear();

	for (const boid of boids) {
		const direction = boid.velocity.clone().normalize() ?? new Vector2(1,0);
		const front = boid.position.clone().add(direction.clone().multiply(boid.repelRadius * .5));
		const back1 = boid.position.clone().add(direction.clone().multiply(boid.repelRadius * .3).rotate(Math.PI * 2 / 3 * 1));
		const back2 = boid.position.clone().add(direction.clone().multiply(boid.repelRadius * .3).rotate(Math.PI * 2 / 3 * 2));

		renderer.drawPath(
			new Path().setOrigin(front).lineTo(back1).lineTo(boid.position).lineTo(back2).close(),
			new ShapeStyle({
				fill: color,
			})
		)
	}

	for (const obstacle of obstacles) {
		renderer.drawCircle(
			new Circle(obstacle.position, obstacle.repelRadius),
			new ShapeStyle({
				fill: Color.fromRGBA(color.r,color.g,color.b,30),
			})
		);
	}
}


const mouseObstacle = new class implements Obstacle {
	position = Vector2.zero;
	repelRadius = 5;
	repelStrength = 2.2;
}

const updateMouseCoordinate = (event: MouseEvent)=>{
	const clientCoord = new Vector2(event.clientX, event.clientY);
	mouseObstacle.position = clientCoord.transformMatrix4(renderer.getClientInverseTransform());
}

canvas.onpointermove = updateMouseCoordinate;

canvas.onpointerdown = (event)=>{
	updateMouseCoordinate(event);
	obstacles.add(mouseObstacle);
	message.style.opacity = "0";
}

canvas.onpointerup = ()=>{
	obstacles.delete(mouseObstacle);
}


console.log(`For debugging, see "app"`)
Object.defineProperty(window, "app", {
	value: { canvas, boids, renderer, obstacles, mouseObstacle },
});

window["Vector2"] = Vector2;