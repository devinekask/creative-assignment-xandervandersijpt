import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import {FontLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/geometries/TextGeometry.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
// import {Text} from 'https://cdn.jsdelivr.net/npm/troika-three-text@0.43.0/dist/troika-three-text.umd.min.js';
// import { EffectComposer } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/UnrealBloomPass.js';
{
    //NEXT STEPS:
    //1. make the start-up screen start camera look to origin, then smoothly move upwards to where the 'intro info' appears. OK
    //2. render rectangular blocks (representing the statues in later stage) (currently rendered singular statue multiple times) OK
    //3. render numbers on each statue as identifiers OK
    //3. incorporate motion detection of face to move around using ML5
    //4. Improve loading time by separating the loaders from the loops OK


    // use web audio api to play the background audio
    // try incorporating a voice to read our intro aloud

    //IMPROVEMENTS TO MAKE
    //1. add the unrealbloom effect to lightbulbs to give them a glow
    //2. improve fog in the experience
    //3. Background color into gradient to darker shade. Maybe try out small stars
    //4. look into throttling for the cursor eventlistener
    
    
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
    let scene, camera, renderer, controls, fontWispy, lampFile, statueFile;
    let statues = [];

    const loadFont = () => {
        return new Promise((resolve,reject)=>{
            //here our function should be implemented 
            const fontLoader = new FontLoader();
            fontLoader.load('./assets/BNWispy.json', function(response) {
            fontWispy = response;
            resolve();
            });
        });
    }

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

        //implementing mousemove rotation
        

        //setting a target our camera is looking at
        controls.enableDamping = true;
        //controls.enableZoom = false;
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
        const floorGeometry = new THREE.CircleGeometry( 400, 100);
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
        scene.add(hemiLight);
    }
    
    const loadLamp = () => {
        const lampLoader = new GLTFLoader();
        return new Promise((resolve,reject)=>{
            lampLoader.load(`./assets/sceneLight.glb`, 
                function (gltf) {
                    console.log(`loaded scene lightbulb`);
                    lampFile = gltf.scene;
                    resolve();
                }
            );
        });
    }

    const renderScenicLights = async () => {
        //Creating 12 lights evenly spaced around the scene: 6 with a smaller radius and 6 with a larger one to make them more different in position
        let lightsRadius;
        const lightsAmount = 12;

        //defining our pointlight sphere once, to then clone it in our loop. This improves performance
        //add a light source to our scene
        const light = new THREE.PointLight(`#ffffff`, 0.3);
        //adding a sphere to show the location of the light
        const sphere = new THREE.SphereGeometry(3,16,8);
        light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );

        //defining our gltf lightstand and loading it once in advance, again for performance.
        await loadLamp();

        for(let i=0; i<lightsAmount; i++){
            //define the radius
            if(i % 2 === 0) {
                lightsRadius = 150;
            } else if(i % 3 === 0) {
                lightsRadius = 180;
            } else {
                lightsRadius = 210;
            }

            const newLight = light.clone(true);
            //calculate the coordinates so the lights are placed evenly along circular path, the Y is a randomized value to place the bulbs at different heights
            const positionX = Math.round(lightsRadius * (Math.cos(i* (2 * Math.PI / lightsAmount ))));
            const positionY = random(25,65);
            const positionZ = Math.round(lightsRadius * (Math.sin(i* (2 * Math.PI / lightsAmount ))));
            newLight.position.set(positionX, positionY, positionZ);
            scene.add(newLight);

            //add the blender object lamp underneath
            const newLamp = lampFile.clone(true);
            newLamp.position.set(positionX,0,positionZ);
            //making the vertical scaling random here to match with lightbulb height, using the normal height to calculate the right factor height
            newLamp.scale.set(1.5,1.5*(positionY/25),1.5);
            scene.add(newLamp);
        }
    }

    const renderIntro = () => {
        const textGeometry = new TextGeometry( 'Welcome, to Memoria.', {
            font: fontWispy,
            size: 25,
            height: 1,
            curveSegments: 12,
            bevelEnabled: false
        });

        var textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xffffff, specular: 0x151E39 }
          );
        
        var mesh = new THREE.Mesh( textGeometry, textMaterial );
        mesh.geometry.center();
        mesh.position.set(0,120,-300);

        scene.add( mesh );
    }

    const loadStatue = () => {
        const statueLoader = new GLTFLoader();
        return new Promise((resolve,reject)=>{
            statueLoader.load(`./assets/tombLaurier.glb`, function (gltf) {
                console.log(`statue loaded`);
                statueFile = gltf.scene;
                resolve();
            });
        });
    }

    const renderStatues = () => {
        let statuesRadius;
        let statuesAmount = 6;

        //defining text material, to be reused multiple times in the loop
        const textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xbbbbbb, specular: 0x151E39 }
        );

        for(let i = 0; i < statuesAmount; i++) {
            const statueMesh = statueFile.clone(true);

            //define the radius
            if(i % 2 === 0) {
                statuesRadius = 180;
            } else if(i % 3 === 0) {
                statuesRadius = 210;
            } else {
                statuesRadius = 150;
            }

            //calculate the coordinates so the lights are placed evenly along circular path, the Y is a randomized value to place the bulbs at different heights
            const positionX = Math.round(statuesRadius * (Math.cos(i* (2 * Math.PI / statuesAmount ))));
            const positionY = 0;
            const positionZ = Math.round(statuesRadius * (Math.sin(i* (2 * Math.PI / statuesAmount ))));
            statueMesh.position.set(positionX, positionY, positionZ);
            //scale the tomb to fit in this scene
            statueMesh.rotation.y = -(Math.PI / 2);
            statueMesh.scale.set(12,12,12);
            scene.add(statueMesh);

            //add a number to each statue
            const textGeometry = new TextGeometry( `0${i}`, {
                font: fontWispy,
                size: 5,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false
            });

            const numberMesh = new THREE.Mesh( textGeometry, textMaterial );
            numberMesh.geometry.center();
            numberMesh.position.set(positionX,10,positionZ + 9);

            scene.add( numberMesh );

            //push the index (number both on the statue visual for user and index) and position of the statue into array
            //we use this array later for matching the voice input of user to right statue
            const currentStatue = {};
            currentStatue.number = i;
            currentStatue.position = {x: positionX, y: 0, z: positionZ};
            statues.push(currentStatue);
        }
    }

    const init = async () => {
        //drawing a menu using dom elements and javascript, so that our scene can render whilst the startup is displayed 
        const $enterLink = document.querySelector(`.link`);
        $enterLink.addEventListener(`click`, handleClickEnter);
        gsap.to(".menu__copy", {duration: 1.5, opacity: 1});

        //starting our angle at 1.57 (or PI/2);
        var angle = Math.PI/2;
        var radius = 10; 
        window.addEventListener('mousemove', (e) => {
            //execute function to check if mouse is in left or right 15% of screen, then move canvas accordingly
            if(e.clientX < (window.innerWidth *0.15)){
                // move left
                camera.position.x = radius * Math.cos( angle );  
                camera.position.z = radius * Math.sin( angle );
                angle -= 0.001;
            } else if(e.clientX > (window.innerWidth - (window.innerWidth *0.15))) {
                // move right
                camera.position.x = radius * Math.cos( angle );  
                camera.position.z = radius * Math.sin( angle );
                angle += 0.001;
            }
        });

        sceneSetup();

        await loadFont();

        //get the statue from our StatueLoader
        await loadStatue();

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
        scene.fog = new THREE.Fog( `#151E39`, 1, 450);

        //adding a circular floor to our scene
        renderFloor();

        //render the hemispheric light to light up the whole scene
        //renderHemiLight();

        //render the scenic lights
        renderScenicLights();

        //when the enter button has been clicked and camera moved, render the text
        renderIntro();
        
        //render first statue
        renderStatues();

        //render the scene using an animation loop
        animate();
    }

    init();
}