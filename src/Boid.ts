import { Duration } from "open-utilities/datetime";
import { Rect, Vector2 } from "open-utilities/geometry";

export interface Obstacle {
	readonly position: Vector2;
	readonly repelRadius: number;
	readonly repelStrength: number;
}


export class Boid implements Obstacle {
	static readonly defaultOptions = Object.freeze(new class implements Boid.Option {
		flockRadius = 5;
		cohesionStrength = 0.01;
		alignmentStrength = 0.06;
		maxVelocity = 30;
		boundsRepelStrength = this.maxVelocity * .1;
	});

	options = Boid.defaultOptions;

	position = new Vector2(0,0);
	velocity = new Vector2(3,0);

	// this should be equal to velocity unless velocity is zero.
	// this will give us a non-zero vector for rendering.
	direction = this.velocity.clone();
	
	repelRadius = 1;
	repelStrength = .5;


	update(elapsedTime: Duration, boids: ReadonlySet<Boid>, obstacles: ReadonlySet<Obstacle>, bounds: Rect) {
		const flock = this.#getInRange(boids, this.options.flockRadius);
		
		const acceleration = new Vector2(0,0);
		acceleration.add(this.#stayInBounds(bounds));

		// avoidance
		acceleration.add(this.#awayFrom(boids));
		acceleration.add(this.#awayFrom(obstacles));

		// alignment
		acceleration.add(this.#averageVelocity(flock).multiply(this.options.alignmentStrength));
		
		// cohesion
		acceleration.add(this.#displacementFromCenter(flock).multiply(this.options.cohesionStrength));


		this.velocity.add(acceleration);

		// keep velocity below max velocity
		if (this.velocity.length() > this.options.maxVelocity) this.velocity.normalize().multiply(this.options.maxVelocity);

		this.position.add(this.velocity.clone().multiply(elapsedTime.seconds));
		if (this.velocity.length() !== 0) this.direction = this.velocity.clone();
	}

	#stayInBounds(bounds: Rect): Vector2 {
		const acceleration = new Vector2(0,0);

		if (this.position.x < bounds.x1) acceleration.x = this.options.boundsRepelStrength;
		if (this.position.y < bounds.y1) acceleration.y = this.options.boundsRepelStrength;
			
		if (this.position.x > bounds.x2) acceleration.x = -this.options.boundsRepelStrength;
		if (this.position.y > bounds.y2) acceleration.y = -this.options.boundsRepelStrength;

		return acceleration;
	}

	#averageVelocity(flock: ReadonlySet<Boid>): Vector2 {
		if (flock.size == 0) return new Vector2(0,0);

		const avg = new Vector2(0,0);
		for (const other of flock) avg.add(other.velocity);
		avg.divide(flock.size);

		return avg;
	}

	#displacementFromCenter(flock: ReadonlySet<Boid>) {
		if (flock.size == 0) return new Vector2(0,0);

		const center = new Vector2(0,0);
		for (const other of flock) center.add(other.position);
		center.multiply(1.0/flock.size);

		return center.subtract(this.position);
	}

	#awayFrom(obstacles: ReadonlySet<Obstacle>) {
		const acceleration = new Vector2(0,0);
		for (const obstacle of obstacles) {
			const distance = this.position.distanceTo(obstacle.position);
			if (distance > obstacle.repelRadius) continue;

			const displacement = this.position.clone().subtract(obstacle.position);
			acceleration.add(displacement.multiply(obstacle.repelStrength));
		}
		
		return acceleration;
	}

	#getInRange(boids: ReadonlySet<Boid>, radius: number) {
		const out = new Set<Boid>();
		for (const other of boids) {
			const distance = this.position.distanceTo(other.position);
			if (distance < radius) out.add(other);
		}
		return out;
	}
}

export namespace Boid {
	export interface Option {
		flockRadius: number;

		cohesionStrength: number;
		alignmentStrength: number;

		maxVelocity: number;
		boundsRepelStrength: number;
	}
}