import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
{
    
    //defining some global variables for our project
    //declaring our scene, camera and renderer to initialize our three.js scene.
    const scene = new THREE.Scene();
    //perspective camera: Field of view, aspect ratio, near and far clipping plane.
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight,0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer();
    //Adding controls for our camera to move with an event listener (currently autorotating)
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0,30,10);
    controls.target.set(10,30,10);
    controls.update();
    controls.autoRotate = true;

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
        const hemiLight = new THREE.HemisphereLight(`#ffffff`,`#7E89DD`,0.1);
        scene.add(hemiLight);
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
            const sphere = new THREE.SphereGeometry(1.5,16,8);
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
                    console.log(`loaded scene`);
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
        //add a resize listener to our window, then redraw the scene to fit.
        window.addEventListener('resize', handleWindowResize);

        //set size and background color of renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        //telling our renderer to render in full retina resolution, to improve visual quality.
        renderer.setPixelRatio( window.devicePixelRatio);
        //adding our rendering canvas to our HTML document
        document.body.appendChild(renderer.domElement);

        
        //set a fog and background color on our scene
        scene.background = new THREE.Color(`#7E89DD`);
        scene.fog = new THREE.Fog( `#7E89DD`, 1, 300);

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