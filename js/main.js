// scene setup by three js //
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

renderer.setClearColor (0xb7c3f3, 1)

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add(light);

// global  variables ///

const start_position = 3;
const end_position = -start_position;
let text = document.querySelector('.text')
let timeLimit = 7;
let gameStat = 'loading';
let isLookingBackward = true;



// create cubes for track  section///

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add(cube);
    return cube;
}

// create  doll cllass and gltf model upload 

const loader = new THREE.GLTFLoader();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        loader.load("./model/scene.gltf",  (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1.5, 0);
            this.doll = gltf.scene;
        })
    }

    lookBackward() {
        gsap.to(this.doll.rotation, { y: -3.15, duration: .45 }) 
        setTimeout(() => isLookingBackward = true, 150)
        
    }

    lookForward() {
        gsap.to(this.doll.rotation, { y: 0, duration: .45 }) 
        setTimeout(() => isLookingBackward = false, 450)
    }
    
    async start() {
        this.lookBackward()
        await delay(Math.random() *1000 + 1000)
        this.lookForward()
        await delay(Math.random() *750 + 750)
        this.start()
    }
}

/// and of Doll section

/// create track section

function createTrack() {
    createCube({ w: start_position *2 + .2, h: 1.5, d: 1 }, 0, 0, 0xe5a716).position.z = -1;
    createCube({ w: .2, h: 1.5, d: 1 }, start_position, -.35 );
    createCube({ w: .2, h: 1.5, d: 1 }, end_position, .35);
    
}

createTrack();

/// player class

class Player {
    constructor() {
        const geometry = new THREE.SphereGeometry(.3, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff});
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add(sphere);
        this.player = sphere;
        this.PlayerInfo = {
            positionX: start_position,
            velocity: 0,
        }
    }
    
    run() {
        this.PlayerInfo.velocity = .03
    }   
    stop() {
            gsap.to(this.PlayerInfo, { velocity: 0, duration: .1})
    }
   
    check() {
        if (this.PlayerInfo.velocity > 0 && !isLookingBackward) {
            gameStat = 'over'
            text.innerText = 'you lose!'
        }
        if (this.PlayerInfo.positionX < end_position + .4) {
             text.innerText = 'you win!'
            gameStat = 'over'
        }
    }
    update() {
        this.check();
        this.PlayerInfo.positionX -= this.PlayerInfo.velocity;
        this.player.position.x = this.PlayerInfo.positionX 
    }


}



let doll = new Doll;
const player = new Player;

async function init() {
    await delay(500)
    text.innerText = 'Starting in 3'
    await delay(500)
    text.innerText = 'Starting in 2'
    await delay(500)
    text.innerText = 'Starting in 1'
    await delay(500)
    text.innerText = 'Go!!!'    
    startGame()
}

function startGame() {
    gameStat = 'started'
    let progressBar = createCube({ w: 5, h: .1, d: 1 }, 0);
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {x: 0, duration: timeLimit, ease: 'none' })
    doll.start() 
    setTimeout(() => {
        if (gameStat != 'over') {
            text.innerText = 'You ran out of time';
            gameStat = 'over'
        }
    }, timeLimit *1000)
}


init(); 


function animate() {
    if (gameStat == 'over')  return
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update();
    
}

animate();

camera.position.z = 5;

// responsive canvas make //

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize (window.innerWidth, window.innerHeight)
    
}

/// moving sphere on keypress  left arrow //

window.addEventListener('keydown', (e) => {
    if (gameStat != 'started') return 
    if (e.key == "ArrowLeft") {
        player.run();
    }
});
window.addEventListener('keyup', (e) => {
   
    if (e.key == "ArrowLeft") {
        player.stop();
    }
})