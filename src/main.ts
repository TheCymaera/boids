import { Circle, Path, Rect, Vec2 } from "open-utilities/geometry";
import { AnimationFrameScheduler, Canvas2DRenderer } from "open-utilities/rendering-web";
import "./ui.js";
import "./ui.scss";
import { Boid, Obstacle } from "./Boid.js";
import { Color, ShapeStyle } from "open-utilities/ui";

const canvas = document.querySelector("canvas")!;
const renderer = Canvas2DRenderer.fromCanvas(canvas);

new ResizeObserver(()=>{
	const viewportLength = 80 / window.devicePixelRatio;
	const minCanvasLength = 1000;
	
	const ratio = canvas.clientHeight / canvas.clientWidth;
	if (ratio > 1) {
		const canvasLength = Math.max(minCanvasLength, canvas.clientWidth);

		renderer.setViewportRect(Rect.fromCenter(Vec2.zero, viewportLength, viewportLength * ratio));
		canvas.width = canvasLength;
		canvas.height = canvasLength * ratio;
	} else {
		const canvasLength = Math.max(minCanvasLength, canvas.clientHeight);

		renderer.setViewportRect(Rect.fromCenter(Vec2.zero, viewportLength / ratio, viewportLength));
		canvas.width = canvasLength / ratio;
		canvas.height = canvasLength;
	}

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

	const bounds = renderer.viewportRect().clone();
	bounds.deflate(Math.min(bounds.height, bounds.width) * .2);

	for (const boid of boids) boid.update(elapsedTime, boids, obstacles, bounds);
	draw();
});


function draw() {
	const color = Canvas2DRenderer.sampleCSSColor(window.getComputedStyle(document.body).getPropertyValue("color"));

	renderer.clear();
	for (const boid of boids) {
		const direction = boid.direction.clone().normalize().multiply(boid.repelRadius);
		const front = boid.position.clone().add(direction.clone().multiply(.5));
		const back1 = boid.position.clone().add(direction.clone().multiply(.3).rotate(Math.PI * 2 / 3 * 1));
		const back2 = boid.position.clone().add(direction.clone().multiply(.3).rotate(Math.PI * 2 / 3 * 2));

		renderer.drawShape(
			new Path().setOrigin(front).lineTo(back1).lineTo(boid.position).lineTo(back2).close(),
			new ShapeStyle({
				fillColor: color,
			})
		)
	}
	for (const obstacle of obstacles) {
		renderer.drawCircle(
			new Circle(obstacle.position, obstacle.repelRadius),
			new ShapeStyle({
				fillColor: Color.fromRGBA(color.r,color.g,color.b,30),
			})
		);
	}
}


const mouseObstacle = new class implements Obstacle {
	position = Vec2.zero;
	repelRadius = 5;
	repelStrength = 2.2;
}

const updateMouseCoordinate = (event: MouseEvent)=>{
	const mouseClientPosition = new Vec2(event.clientX, event.clientY);
	mouseObstacle.position = Rect.mapPointOnto(renderer.clientRect(), mouseClientPosition, renderer.viewportRect());
}

canvas.onpointermove = updateMouseCoordinate;

canvas.onpointerdown = (event)=>{
	updateMouseCoordinate(event);
	obstacles.add(mouseObstacle);
	document.getElementById("pressScreenMessage")!.style.opacity = "0";
}

canvas.onpointerup = ()=>{
	obstacles.delete(mouseObstacle);
}


console.log(`For debugging, see "app"`)
Object.defineProperty(window, "app", {
	value: {  canvas, boids, renderer },
});