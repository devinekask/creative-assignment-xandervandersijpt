import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
// import { EffectComposer } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/UnrealBloomPass.js';
{
    //NEXT STEPS:
    //1. make the start-up screen start camera look to origin, then smoothly move upwards to where the 'intro info' appears.
    //2. render rectangular blocks (representing the statues in later stage)
    //3. render numbers on each statue as identifiers
    //3. incorporate motion detection of face to move around

    // use web audio api to play the background audio
    // try incorporating a voice to read our intro aloud

    //IMPROVEMENTS TO MAKE
    //1. add the unrealbloom effect to lightbulbs to give them a glow
    //2. improve fog in the experience
    //3. Background color into gradient to darker shade. Maybe try out small stars?
    
    //function to generate the menu at startup
    const handleClickEnter = e => {
        e.preventDefault();
        console.log(`clicked enter experience`);

        //animate menu with gsap
        gsap.to(".circle", {duration: 3, scale:2, opacity: 0});
        gsap.to(".circle", {duration: 1.5, rotation: `180deg`});
        gsap.to(".menu__copy", {duration: 3, opacity: 0});
        gsap.to(".fog", {duration: 3, opacity: 0});
        const $menuWrapper = document.querySelector(`.menu-wrapper`);
        setTimeout( function() { 
            $menuWrapper.style.display = `none`; 
            //animate the camera controls of scene to move upwards.
        gsap.to(controls.target, { x:0,y:30,z:0, duration: 5});
        }, 3000);
    }

    //defining some global variables for our project
    let scene, camera, renderer, controls, composer;


    const sceneSetup = () => {
        //declaring our scene, camera and renderer to initialize our three.js scene.
        scene = new THREE.Scene();
        //perspective camera: Field of view, aspect ratio, near and far clipping plane.
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight,0.1, 1000);

        renderer = new THREE.WebGLRenderer();
        //Adding controls for our camera to move with an event listener (currently autorotating)
        controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(0,30,10);
        controls.target.set(0,0,0);
        controls.update();
        //setting a target our camera is looking at
        //controls.target.set(0,30,0);
        // controls.target.set(0,30,0);
        controls.enableDamping = true;
        controls.enableZoom = false;
        controls.update();
        //controls.autoRotate = true;
    }

    const handleWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    //random function to generate a random number between a min and max
    const random = (min,max) => {
        return Math.random() * (max - min) + min;
    }

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        
        renderer.render(scene, camera);
    }

    const renderFloor = () => {
        //adding a circular floor to our scene
        const floorGeometry = new THREE.CircleGeometry( 330, 100);
        //const material = new THREE.MeshLambertMaterial( { color: `#C6CAFC` } );
        const loader = new THREE.TextureLoader();
        const material = new THREE.MeshLambertMaterial( { map: loader.load(`./assets/marble.png`) } );
        const floor = new THREE.Mesh(floorGeometry, material);
        //rotate the circle to be flat on bottom
        floor.rotation.x = -Math.PI/2;
        floor.receiveShadow = true;
        floor.position.set(0,0,0);
        scene.add(floor);
    }

    const renderHemiLight = () => {
        //adding a hemisphere light to light up the entire scene
        const hemiLight = new THREE.HemisphereLight(`#151E39`,`#ffffff`,0.1);
        //scene.add(hemiLight);
    }

    const renderScenicLights = () => {
        //Creating 12 lights evenly spaced around the scene: 6 with a smaller radius and 6 with a larger one to make them more different in position
        let lightsRadius;
        const lightsAmount = 12;
        for(let i=0; i<lightsAmount; i++){
            //define the radius
            if(i % 2 === 0) {
                lightsRadius = 150;
            } else if(i % 3 === 0) {
                lightsRadius = 180;
            } else {
                lightsRadius = 210;
            }

            //add a light source to our scene
            const light = new THREE.PointLight(`#ffffff`, 0.3);
            //adding a sphere to show the location of the light
            const sphere = new THREE.SphereGeometry(3,16,8);
            light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
            //calculate the coordinates so the lights are placed evenly along circular path, the Y is a randomized value to place the bulbs at different heights
            const positionX = Math.round(lightsRadius * (Math.cos(i* (2 * Math.PI / lightsAmount ))));
            const positionY = random(25,65);
            const positionZ = Math.round(lightsRadius * (Math.sin(i* (2 * Math.PI / lightsAmount ))));
            light.position.set(positionX, positionY, positionZ);
            scene.add(light);

            //add the blender object lamp underneath
            const loader = new GLTFLoader();
            loader.load(`./assets/sceneLight.glb`, 
                function (gltf) {
                    console.log(`loaded scene lightbulb`);
                    const mesh = gltf.scene;
                    mesh.position.set(positionX,0,positionZ);
                    //making the vertical scaling random here to match with lightbulb height, using the normal height to calculate the right factor height

                    mesh.scale.set(1.5,1.5*(positionY/25),1.5);
                    scene.add(mesh);
                }
            );
        }
    }

    const init = () => {
        //drawing a menu using dom elements and javascript, so that our scene can render whilst the startup is displayed 
        const $enterLink = document.querySelector(`.link`);
        $enterLink.addEventListener(`click`, handleClickEnter);
        gsap.to(".menu__copy", {duration: 1.5, opacity: 1});

        sceneSetup();

        //add a resize listener to our window, then redraw the scene to fit.
        window.addEventListener('resize', handleWindowResize);

        //set size and background color of renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        //telling our renderer to render in full retina resolution, to improve visual quality.
        renderer.setPixelRatio( window.devicePixelRatio);
        //adding our rendering canvas to our HTML document
        document.body.appendChild(renderer.domElement);
        
        //set a fog and background color on our scene
        scene.background = new THREE.Color(`#151E39`);
        scene.fog = new THREE.Fog( `#151E39`, 1, 380);

        //adding a circular floor to our scene
        renderFloor();

        //render the hemispheric light to light up the whole scene
        renderHemiLight();

        //render the scenic lights
        renderScenicLights();
        
        //render the scene using an animation loop
        animate();
    }

    init();
}