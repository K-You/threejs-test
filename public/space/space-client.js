import BlasterSystem from '../common/blaster.js';
import { game } from '../common/game.js';
import { graphics } from '../common/graphics.js';
import { visibility } from '../common/visibility.js';
import ExplodeParticles from './ExplodeParticles.js';
import SpaceBoid from './SpaceBoid.js';
import { Color, CubeTextureLoader, Mesh, MeshStandardMaterial, Vector3 } from '/build/three.module.js';
import { OBJLoader } from '/jsm/loaders/OBJLoader.js';

const BOIDS_NUMBER = 200;
const BOID_SPEED = 2;
const BOID_ACCELERATION = BOID_SPEED / 2.5;
const BOID_FORCE_MAX = BOID_ACCELERATION / 20.0;

class SpaceWorld extends game.Game {
	constructor() {
		super();
	}

	onInitialize() {
		this.entities = [];

		this.bloomPass = this.graphics.addPostFX(
			graphics.PostFX.UnrealBloomPass,
			{
					threshold: 0.75,
					strength: 2.5,
					radius: 0,
					resolution: {
						x: 1024,
						y: 1024,
					}
			});

	this.glitchPass = this.graphics.addPostFX(
			graphics.PostFX.GlitchPass, {});
	this.glitchCooldown = 15;

	this.glitchPass.enabled = false;

		this.loadBackground(false);

		const geometries = {};
    const loader = new OBJLoader();
    loader.load("./resources/fighter.obj", (result) => {
      geometries.fighter = result.children[0].geometry;
      loader.load("./resources/cruiser.obj", (result) => {
        geometries.cruiser = result.children[0].geometry;
        this.createBoids(geometries);
      });
    });

		this.createEntities();
	}

	loadBackground(test = false) {
		const loader = new CubeTextureLoader();
		let texture = null;
		if(test) {
			texture = loader.load([
					'./resources/space-posx copy.jpeg',
					'./resources/space-negx copy.jpeg',
					'./resources/space-posy copy.jpeg',
					'./resources/space-negy copy.jpeg',
					'./resources/space-posz copy.jpeg',
					'./resources/space-negz copy.jpeg',
				]);
		} else {
			texture = loader.load([
				'./resources/space-posx.jpeg',
				'./resources/space-negx.jpeg',
				'./resources/space-posy.jpeg',
				'./resources/space-negy.jpeg',
				'./resources/space-posz.jpeg',
				'./resources/space-negz.jpeg',
			]);
		}
		this.graphics.scene.background = texture;
	}

	createEntities() {
		this.visibilityGrid = new visibility.VisibilityGrid(
			[new Vector3(-500, 0, -500), new Vector3(500, 0, 500)],
			[100, 100]
		);

		this.explosionSystem = new ExplodeParticles(this);

    this.blasters = new BlasterSystem(this, {texture: "../resources/blaster.jpeg"});
	}

	// Uses blender obj files
	createBoids(geometries) {
		const positions = [
			new Vector3(-100, -130, 80),
			new Vector3(50, -100, 100)
		];
		const colors = [
			new Color(0.5, 0.5, 4.0),
			new Color(4.0, 0.5, 0.5)
		];

		// Create cruisers
		for (let i = 0; i<positions.length; i++) {
			const p = positions[i];
			const cruiser = new Mesh(geometries.cruiser, new MeshStandardMaterial({color: 0x808080}));
			cruiser.position.set(p.x, p.y, p.z);
			cruiser.castShadow = true;
			cruiser.receiveShadow = true;
			cruiser.rotation.x = Math.PI / 2;
			cruiser.scale.setScalar(10, 10, 10);
			cruiser.updateWorldMatrix();
			this.graphics.Scene.add(cruiser);
			
			cruiser.geometry.computeBoundingBox();
			const cruiserbb = cruiser.geometry.boundingBox.clone().applyMatrix4(cruiser.matrixWorld);
			this.visibilityGrid.addGlobalItem( {
				Position: p, 
				AABB: cruiserbb, 
				QuickRadius: 200, 
				Velocity: new Vector3(0,0,0),
				Direction: new Vector3(0,0,1)
			});
		}

		// Create figthers
		const params = {
			geometry: geometries.fighter,
			speedMin: 1.0,
			speedMax: 1.0,
			scale: 0.4,
			speed: BOID_SPEED,
			maxSteeringForce: BOID_FORCE_MAX,
			acceleration: BOID_ACCELERATION,
		};
		for (let i = 0; i < BOIDS_NUMBER; i++){
			if (i==0) {
				params.isFollowed = true;
			}
			params.seekGoal = positions[i % positions.length];
			params.color = colors[i % colors.length];
			
			const e = new SpaceBoid(this, params);
			this.entities.push(e);
		}
	}

	onStep(timeInSeconds) {
		
		timeInSeconds = Math.min(timeInSeconds, 1/10.0);

		this.blasters.update(timeInSeconds);
		this.explosionSystem.update(timeInSeconds);

		this.stepEntities(timeInSeconds);
	}

	stepEntities(timeInSeconds) {
		if (this.entities.length == 0) {
			return;
		}

		for(let e of this.entities) {
			e.step(timeInSeconds);
		}
	}
}

function main() {
	new SpaceWorld(); 
}
 
main();