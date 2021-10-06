import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
{
    
    //defining some global variables for our project
    //declaring our scene, camera and renderer to initialize our three.js scene.
    const scene = new THREE.Scene();
    //perspective camera: Field of view, aspect ratio, near and far clipping plane.
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    const handleWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    const animate = () => {
        requestAnimationFrame(animate);
        
        renderer.render(scene, camera);
    }

    const renderFloor = () => {
        //adding a circular floor to our scene
        const floorGeometry = new THREE.CircleGeometry( 300, 100);
        const material = new THREE.MeshLambertMaterial( { color: `#C6CAFC` } );
        // const loader = new THREE.TextureLoader();
        // const material = new THREE.MeshLambertMaterial( { map: loader.load(`./assets/circlemarble.png`) } );
        const floor = new THREE.Mesh(floorGeometry, material);
        //rotate the circle to be flat on bottom
        floor.rotation.x = -Math.PI/2;
        floor.receiveShadow = true;
        floor.position.set(0,0,0);
        scene.add(floor);
    }

    const renderHemiLight = () => {
        //adding a hemisphere light to light up the entire scene
        const hemiLight = new THREE.HemisphereLight(`#ffffff`,`#7E89DD`,0.6);
        scene.add(hemiLight);
    }

    const renderScenicLights = () => {
        //Creating 10 lights evenly spaced around the scene
        const lightsRadius = 150;
        const lightsAmount = 12;
        for(let i=0; i<lightsAmount; i++){
            //add the blender object lamp underneath
            const loader = new GLTFLoader();
            loader.load(`./assets/sceneLight.glb`, 
                function (gltf) {
                    console.log(`loaded scene`);
                    const mesh = gltf.scene;
                    mesh.position.set(positionX,0,positionZ);
                    mesh.scale.set(1.5,1.5,1.5);
                    scene.add(mesh);
                }
            );
            
            //add a light source to our scene
            const light = new THREE.PointLight(`#ffffff`, 0.3);
            //adding a sphere to show the location of the light
            const sphere = new THREE.SphereGeometry(1.5,16,8);
            light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
            //make the coordinates random so they are placed around the scene
            //light.position.set(0,20,-40);
            const positionX = Math.round(lightsRadius * (Math.cos(i* (2 * Math.PI / lightsAmount ))));
            const positionZ = Math.round(lightsRadius * (Math.sin(i* (2 * Math.PI / lightsAmount ))));
            light.position.set(positionX, 25, positionZ);
            scene.add(light);
        }
    }

    const init = () => {
        //add a resize listener to our window, then redraw the scene to fit.
        window.addEventListener('resize', handleWindowResize);

        
        //set size and background color of renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        //telling our renderer to render in full retina resolution, to improve visual quality.
        renderer.setPixelRatio( window.devicePixelRatio );
        //adding our rendering canvas to our HTML document
        document.body.appendChild(renderer.domElement);
        //moving the camera away so that if renders from a certain position
        camera.position.set(0,30,10);

        //set a fog and background color on our scene
        scene.background = new THREE.Color(`#7E89DD`);
        scene.fog = new THREE.Fog( `#7E89DD`, 1, 280);

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