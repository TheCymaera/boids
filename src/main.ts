import { Circle, Matrix4, Path, Rect, Vector2 } from "open-utilities/geometry";
import { AnimationFrameScheduler, HTMLCanvas2D } from "open-utilities/ui";
import { Boid, Obstacle } from "./Boid.js";
import { Color, ShapeStyle } from "open-utilities/ui";

const canvas = document.querySelector("canvas")!;
const renderer = HTMLCanvas2D.fromCanvas(canvas);
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


const boids = new Set<Boid>();
const obstacles = new Set<Obstacle>();
for (let i = 0; i < 200; i++) {
	const boid = new Boid();
	boid.velocity.rotate(Math.random() * Math.PI * 2);
	boids.add(boid);
}

AnimationFrameScheduler.periodic((elapsedTime)=>{
	if (elapsedTime.milliseconds > 100) elapsedTime.milliseconds = 100;

	const bounds = viewport.clone();
	bounds.deflate(Math.min(bounds.height, bounds.width) * .2);

	for (const boid of boids) boid.update(elapsedTime, boids, obstacles, bounds);
	draw();
});


function draw() {
	const color = HTMLCanvas2D.sampleCSSColor(window.getComputedStyle(canvas).getPropertyValue("color"));

	renderer.clear();
	for (const boid of boids) {
		const direction = boid.direction.clone().normalize().multiply(boid.repelRadius);
		const front = boid.position.clone().add(direction.clone().multiply(.5));
		const back1 = boid.position.clone().add(direction.clone().multiply(.3).rotate(Math.PI * 2 / 3 * 1));
		const back2 = boid.position.clone().add(direction.clone().multiply(.3).rotate(Math.PI * 2 / 3 * 2));

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

const pressScreenMessage = document.getElementById("pressScreenMessage")!;
canvas.onpointerdown = (event)=>{
	updateMouseCoordinate(event);
	obstacles.add(mouseObstacle);
	pressScreenMessage.style.opacity = "0";
}

canvas.onpointerup = ()=>{
	obstacles.delete(mouseObstacle);
}


console.log(`For debugging, see "app"`)
Object.defineProperty(window, "app", {
	value: {  canvas, boids, renderer, obstacles, mouseObstacle },
});