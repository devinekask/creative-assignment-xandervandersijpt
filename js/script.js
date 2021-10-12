import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import {FontLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/FontLoader.js';
import {TTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/TTFLoader.js';
import {TextGeometry} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/geometries/TextGeometry.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';
// import {Text} from 'https://cdn.jsdelivr.net/npm/troika-three-text@0.43.0/dist/troika-three-text.umd.min.js';
// import { EffectComposer } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/ShaderPass.js';
// import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/postprocessing/UnrealBloomPass.js';
{
    //NEXT STEPS:
    //0. Render intro info OK
        //use speeck api to read the intro aloud
    //1. render numbers on each statue as identifiers OK
    //2. Make the statues rotate so they are face-first in the circle
    //3. incorporate motion detection of face to move around using ML5
    //4. Improve loading time by separating the loaders from the loops OK
    //5. When saying a statue name aloud, zoom in on that statue and make a poem appear next to it
        //1. Move in on statue number 4 automatically OK
        //2. Incorporate voice input OK
        //3. Render poem next to the statue
        //4. Implement that when user says 'return', camera returns to center position of welcome to memoria
    //END: add a loader screen that displays until scene is fully loaded

    // use web audio api to play the background audio
    // try incorporating a voice to read our intro aloud

    //add a loading image at the beginning to ensure that everything is loaded before experience starts

    //IMPROVEMENTS TO MAKE
    //1. add the unrealbloom effect to lightbulbs to give them a glow
    //2. improve fog in the experience
    //3. Background color into gradient to darker shade. Maybe try out small stars
    //4. look into throttling for the cursor eventlistener
    //5. add a check to see if the user has getUserMedia available, if not, we let our user navigate the experience with arrows or the hover effect left and right
    //6. add hover link to the enter button
    
    
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

        //start the speech recognition after 8 seconds (so after the camera movement animation is over)
        setTimeout( function() {
            //start up the speech recognition
            launchSpeechRecognition();
        }, 8000)
    }

    //defining some global variables for our project
    let poseNet, video;
    let scene, camera, renderer, controls, fontWispy, fontPoppinsReg, lampFile, statueFile, cameraAngle, cameraRadius;
    let statues = [];

    const loadFont = () => {
        return new Promise((resolve,reject)=>{
            //load the BNWispy title font
            const fontLoader = new FontLoader();
            fontLoader.load('./assets/BNWispy.json', function(response) {
            fontWispy = response;

            //load the Poppins font
            const ttfLoader = new TTFLoader();
            const ttfFontLoader = new FontLoader();
            ttfLoader.load('./assets/Poppins-Light.ttf', function(response) {
                fontPoppinsReg = ttfFontLoader.parse(response);
            })
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
        controls.enabled = false;
        camera.position.set(0,30,10);
        controls.target.set(0,0,0);
        controls.update();

        //setting a target our camera is looking at
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
        const textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xffffff, specular: 0x151E39 }
        ); 
        
        const titleGeometry = new TextGeometry( `Welcome, to Memoria.`, {
            font: fontWispy,
            size: 27,
            height: 1,
            curveSegments: 12,
            bevelEnabled: false
        });

        const titleMesh = new THREE.Mesh(titleGeometry, textMaterial);
        titleMesh.geometry.center();
        titleMesh.position.set(0, 120, -300);

        const introGeometry = new TextGeometry(`Explore Memoria by moving your head from left to right.`, {
            font: fontPoppinsReg,
            size: 6,
            height: 1,
            curveSegments: 10,
            bevelEnabled: false
        });

        const introMesh = new THREE.Mesh(introGeometry, textMaterial);
        introMesh.geometry.center();
        introMesh.position.set(0, 92, -300);

        const introTwoGeometry = new TextGeometry(`If you want to hear a statue's memory, say it's number aloud.`, {
            font: fontPoppinsReg,
            size: 6,
            height: 1,
            curveSegments: 10,
            bevelEnabled: false
        });
        
        const introTwoMesh = new THREE.Mesh(introTwoGeometry, textMaterial);
        introTwoMesh.geometry.center();
        introTwoMesh.position.set(0, 80, -300);

        scene.add(titleMesh);
        scene.add(introMesh);
        scene.add(introTwoMesh);
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

    const handleMousemoveWindow = e => {
        //execute function to check if mouse is in left or right 15% of screen, then move canvas accordingly
        if(e.clientX < (window.innerWidth *0.20)){
            // move left
            camera.position.x = cameraRadius * Math.cos( cameraAngle );  
            camera.position.z = cameraRadius * Math.sin( cameraAngle );
            cameraAngle -= 0.005;
        } else if(e.clientX > (window.innerWidth - (window.innerWidth *0.20))) {
            // move right
            camera.position.x = cameraRadius * Math.cos( cameraAngle );  
            camera.position.z = cameraRadius * Math.sin( cameraAngle );
            cameraAngle += 0.005;
        }
    }

    const focusStatue = (voiceInput) => {
        //get the coordinates of the statue
        const positionX = statues[voiceInput].position.x;
        const positionZ = statues[voiceInput].position.z;
        console.log(positionX);
        console.log(positionZ);

        //change target of the camera to the statue, and position of camera to be in front of the statue
        gsap.to(controls.target, {x:positionX, y:45, z:positionZ, duration: 4});
        gsap.to(camera.position, {x:positionX*0.9, y:45, z:positionZ*0.9, duration: 4});
    }

    const modelLoaded = () => {
        console.log(`model loaded!`);
        //start a loop that detects your face every 200 milliseconds
        // setInterval(
        //     function() {
        //         faceapi.detectSingle(video, (err,results) => {
        //             console.log(results);
        //         });
        //     }, 2000
        // );

    }

    const detectResults = () => {
        
    }

    const launchSpeechRecognition = () => {
        if ("webkitSpeechRecognition" in window) {
            console.log(`speech recognition available`);
            
            //define new speechRecognition
            let speechRecognition = new webkitSpeechRecognition();
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.lang = `en-US`;
            speechRecognition.maxAlternatives = 1;

            const grammar = '#JSGF V1.0; grammar numbers; public <numbers> = one | two | three | four | five | six;';
            const speechGrammarList = new webkitSpeechGrammarList();
            speechGrammarList.addFromString(grammar, 1)
            speechRecognition.grammars = speechGrammarList;
            console.log(speechGrammarList[0].weight);

            //start speech recognition when pressing the spacebar
            document.addEventListener('keyup', e => {
                if (e.code === 'Space') {
                  console.log('Space pressed, initialise speech recognition');
                  speechRecognition.start();
                }
            });

            //define the callback functions, log that SR is listening, results etc.
            speechRecognition.onstart = () => {
                console.log(`SR is listening`);
            }

            speechRecognition.onend = () => {
                console.log(`SR stopped listening`);
            }

            speechRecognition.onerror = e => {
                console.log(`SR has an error`);
                console.log(e.error);
            }

            speechRecognition.onresult = e => {
                //show result in console
                let speechResult = e.results[0][0].transcript;
                console.log(speechResult);

                //when there is a result, check if it matches one of the 6 numbers, and then call the focusStatue function on that number
                switch(speechResult){
                    case '1':
                    case 'one':
                        console.log(`input was one`);
                        focusStatue(0);
                        break;
                    case '2':
                    case 'two':
                        console.log(`input was two`);
                        focusStatue(1);
                        break;
                    case '3':
                    case 'three':
                        console.log(`input was three`);
                        focusStatue(2);
                        break;
                    case '4':
                    case 'four':
                        console.log(`input was four`);
                        focusStatue(3);
                        break;
                    case '5':
                    case 'five':
                        console.log(`input was five`);
                        focusStatue(4);
                        break;
                    case '6':
                    case 'six':
                        console.log(`input was six`);
                        focusStatue(5);
                        break;
                }
            }
          
          } else {
            console.log(`Speech Recognition Not Available`);
        }
    }

    const init = async () => {
        function hasGetUserMedia() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
          }
          if (hasGetUserMedia()) {
            console.log(`has getUserMedia!`)
          } else {
            console.log(`getUserMedia() is not supported by the browser.`);
        }

        hasGetUserMedia();

        //Defining the detection options
        // const detectionOptions = {
        //     withLandmarks: true,
        //     withDescriptors: false,
        //     minConfidence:0.5,
        // };

        //create a video element in the document
        // const videoElement = document.createElement(`video`);
        // videoElement.setAttribute(`style`,`display:none`);
        // videoElement.width = window.innerWidth;
        // videoElement.height = window.innerHeight;
        // document.body.appendChild(videoElement);

        // //get the webcam input and set it as video sourceobject
        // const constraints = {
        //     video: true,
        // };
        // const videoInput = await navigator.mediaDevices.getUserMedia(constraints);
        // videoElement.srcObject = videoInput;
        // videoElement.play();

        // //faceapi = ml5.faceApi(videoElement, detectionOptions, modelLoaded);
        // poseNet = ml5.poseNet(videoElement, modelLoaded);
        // poseNet.on(`pose`, (results) => {
        //     console.log(results);
        // })

        //using p5 and ml5 to get nose position and use it as a cursor



        //drawing a menu using dom elements and javascript, so that our scene can render whilst the startup is displayed 
        const $enterLink = document.querySelector(`.link`);
        $enterLink.addEventListener(`click`, handleClickEnter);
        gsap.to(".menu__copy", {duration: 1.5, opacity: 1});

        //starting our angle at 1.57 (or PI/2);
        cameraAngle = Math.PI/2;
        cameraRadius = 10; 
        window.addEventListener('mousemove', handleMousemoveWindow);

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