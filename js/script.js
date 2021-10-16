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
    //2. Make the statues rotate so they are face-first in the circle
    //3. incorporate motion detection of face to move around using ML5
    //4. Improve loading time by separating the loaders from the loops OK
    //5. When saying a statue name aloud, zoom in on that statue and make a poem appear next to it
        //1. Move in on statue number 4 automatically OK
        //2. Incorporate voice input OK
        //3. Render poem next to the statue line per line
        //4. Implement that when user says 'return', camera returns to center position of welcome to memoria
    //6. add background audio to the experience.
    //7. incorporate drawing onto sculpture, so our user can draw using ML5.
        //1. add small 'unlit' neon signs such as a moon, a heart, a tear...
        //2. when the user zooms in on statue, activate a checker that checks whether the cursor moves over the coordinates of this neon light
        //3. if coordinates match, turn on that part of the statue.
    //END: add a loader screen that displays until scene is fully loaded

    // try incorporating a voice to read our intro aloud

    //add a loading image at the beginning to ensure that everything is loaded before experience starts

    //IMPROVEMENTS TO MAKE
    //1. add the unrealbloom effect to lightbulbs to give them a glow TOO TAXING ON PERFORMANCE
    //2. improve fog in the experience
    //3. Background color into gradient to darker shade. Maybe try out small stars
    //4. look into throttling for the cursor eventlistener
    //5. add a check to see if the user has getUserMedia available, if not, we let our user navigate the experience with arrows or the hover effect left and right
    //6. add hover link to the enter button OK
    
    //defining our poems in array
    const poems = [
        {title:`celeste`, verseLength: 2, lines:[`vibrant as the sun`,`her smile could make me blush`,`she draws me in`,`with every ray of light`,`closely warming me`,`a distance that she crossed`,`it's a feeling that I get`,`waiting for our hearts to align`,`as I'm the crescent moon`,`reflecting everything she gives`,`every night I feel awakened`,`dream of just a lingering touch`,`cursed be our lips`,`for they will never touch`,`intertwined forever`,`yet forever to be apart`]},
        {title:`to stay`, verseLength: 2, lines:[`Took a train out of the city`,`Followed the wind to the waves`,`Bathed in the sunlight by the window`,`In a temporary home I made`,`Let the calm wash over me`,`Felt all my fears just wane away`,`Unspoken kindness brought me here`,`And offered me a chance to stay`,`Took a train out of the city`,`Followed the wind to the waves`,`Thought the calm would keep me sane`,`But my thoughts were still at play`,`Wandered around hoping I would find a way`,`But who am I to try and escape`,`Hope you don't blame the choice I made`,`Because I never said that I deserved to stay`]},
        {title:`nightmare`, verseLength: 2, lines:[`nightmares haunting through my head`,`keeping me up at night, busy in bed`,`the dreams don't run through me`,`they always seem to miss my bed`,`the nights go by in total silence`,`not even sure of their existence`,`from dusk till dawn the days go by`,`missing every movement I lie`,`only nightmares seem to find me`,`haunting me until I die`,`but I'd choose them over dreams any day`,`for the nightmares don't deceive my head`,`and who wants to live in a world full of lies and deceit`,`when reality can be oh so bittersweet?`]},
        {title:`fantasy`, verseLength: 2, lines:[`when he softly dreams`,`his mind takes him places`,`sweet fantasies to explore`,`with symphonies to keep him company`,`he tries to believe`,`in those fairytales he needs`,`but something speaks to him`,`of lies and deceit`,`is it real what he sees`,`or just a fantasy of the heart?`]},
        {title:`caged heart`, verseLength: 2, lines:[`I can't deny what I feel`,`even though it shouldn't be real`,`I had put the pain in a cage`,`thrown away the key`,`it may seem easy`,`but it takes a lot to keep myself sane`,`as I'm feeling kind of queasy`,`and all I can remember is the pain`,`but now the cage has been unlocked`,`and the feelings are coming out like a flood`,`it's too late now to put them back behind bars`,`as there has been a revival of this caged heart`]},
        {title:`haunting little demons`, verseLength: 4, lines:[`did I need to wait`,`for you to decide if you were ready`,`like a mere object`,`begging for attention`,`still wonder what you meant`,`in all those midnight texts`,`they felt like little clues`,`a puzzle inside my bed`,`that chaotic state of mind`,`left me incapacitated`,`while my hopes and dreams`,`were ever so infatuated`,`your indecisive signs`,`gave me so many frustrations`,`while my indecisive mind`,`let me go to far worse places`,`a simple figment of my imagination`,`taken further while I ws sleeping`,`Won't you just leave me here`,`with these haunting little demons?`]}
    ]
    
    //defining some global variables for our project
    let poseNet, video;
    let scene, camera, renderer, controls, fontWispy, fontPoppinsReg, lampFile, statueFile, cameraAngle, cameraRadius;
    let statues = [];

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

    const loadFonts = () => {
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

    const sceneSetup = () => {
        //declaring our scene, camera and renderer to initialize our three.js scene.
        scene = new THREE.Scene();

        //perspective camera: Field of view, aspect ratio, near and far clipping plane.
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight,0.1, 1000);
        camera.position.set(0,30,10);

        renderer = new THREE.WebGLRenderer();
        //set size and background color of renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        //telling our renderer to render in full retina resolution, to improve visual quality.
        renderer.setPixelRatio( window.devicePixelRatio);
        //adding our rendering canvas to our HTML document
        document.body.appendChild(renderer.domElement);
        //add a resize listener to our window, then redraw the scene to fit.
        window.addEventListener('resize', handleWindowResize);
        
        //Adding controls for our camera to move with an event listener (currently autorotating)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enabled = false;
        controls.target.set(0,0,0);
        controls.update();

        //setting a target our camera is looking at
        controls.enableDamping = true;
        controls.enableZoom = false;
        controls.update();

        //rendering the scene
        //set a fog and background color on our scene
        scene.background = new THREE.Color(`#151E39`);
        scene.fog = new THREE.Fog( `#151E39`, 1, 450);
        //adding a circular floor to our scene
        renderFloor();
        //render the hemispheric light to light up the whole scene
        //renderHemiLight();
        //render the scenic lights
        renderScenicLights(6);
        //when the enter button has been clicked and camera moved, render the text
        renderIntro();
        //render first statue
        renderStatues(6);
        //render the scene using an animation loop
        animate();
    }

    //function to generate a random number between a min and max
    const random = (min,max) => {
        return Math.random() * (max - min) + min;
    }

    //function to handle the windowResize event
    const handleWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
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

    const renderScenicLights = async (lightsAmount) => {
        //Creating 12 lights evenly spaced around the scene: 6 with a smaller radius and 6 with a larger one to make them more different in position
        let lightsRadius;

        //defining our pointlight sphere once, to then clone it in our loop. This improves performance
        //add a light source to our scene
        const light = new THREE.PointLight(`#ffffff`, 0.5);
        //adding a sphere to show the location of the light
        const sphere = new THREE.SphereGeometry(3,16,8);
        light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );

        //defining our gltf lightstand and loading it once in advance, again for performance.
        await loadLamp();

        for(let i=1/2; i<lightsAmount; i++){
            //define the radius
            if(i % 3/2 === 0) {
                lightsRadius = 150;
            } else if(i % 5/2 === 0) {
                lightsRadius = 180;
            } else {
                lightsRadius = 210;
            }

            const newLight = light.clone(true);
            //calculate the coordinates so the lights are placed evenly along circular path, the Y is a randomized value to place the bulbs at different heights
            const positionX = Math.round(lightsRadius * (Math.cos(i * (2 * Math.PI / lightsAmount ))));
            const positionY = random(25,65);
            const positionZ = Math.round(lightsRadius * (Math.sin(i * (2 * Math.PI / lightsAmount ))));
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

    const renderHemiLight = () => {
        //adding a hemisphere light to light up the entire scene
        const hemiLight = new THREE.HemisphereLight(`#151E39`,`#ffffff`,0.1);
        scene.add(hemiLight);
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

        const introTwoGeometry = new TextGeometry(`If you want to hear a statue's memory, press the spacebar`, {
            font: fontPoppinsReg,
            size: 6,
            height: 1,
            curveSegments: 10,
            bevelEnabled: false
        });
        
        const introTwoMesh = new THREE.Mesh(introTwoGeometry, textMaterial);
        introTwoMesh.geometry.center();
        introTwoMesh.position.set(0, 80, -300);

        const introThreeGeometry = new TextGeometry(`and say their number aloud.`, {
            font: fontPoppinsReg,
            size: 6,
            height: 1,
            curveSegments: 10,
            bevelEnabled: false
        });
        
        const introThreeMesh = new THREE.Mesh(introThreeGeometry, textMaterial);
        introThreeMesh.geometry.center();
        introThreeMesh.position.set(0, 68, -300);

        scene.add(titleMesh);
        scene.add(introMesh);
        scene.add(introTwoMesh);
        scene.add(introThreeMesh);
    }

    const renderStatues = statuesAmount => {
        let statuesRadius;

        //defining text material, to be reused multiple times in the loop
        const textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xbbbbbb, specular: 0x151E39 }
        );

        for(let i = -1; i < statuesAmount-1; i++) {
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
            //scale and rotate the statue to fit in this scene
            statueMesh.rotation.y = Math.PI - ((2*Math.PI / statuesAmount)*i);
            statueMesh.scale.set(12,12,12);
            scene.add(statueMesh);

            //add a number to each statue, starting at 1, using index
            const textGeometry = new TextGeometry( `0${i + 2}`, {
                font: fontWispy,
                size: 5,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false
            });

            const numberMesh = new THREE.Mesh( textGeometry, textMaterial );
            numberMesh.geometry.center();
            numberMesh.position.set(positionX*0.92, 10, positionZ*0.92);
            numberMesh.rotation.y =  -Math.PI/2 - ((2*Math.PI / statuesAmount) * i);

            scene.add( numberMesh );

            //push the index (number both on the statue visual for user and index) and position of the statue into array
            //we use this array later for matching the voice input of user to right statue
            const currentStatue = {};
            currentStatue.number = i + 2;
            currentStatue.position = {x: positionX, y: 0, z: positionZ};
            statues.push(currentStatue);
        }
    }

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    //function to generate the menu when clicking enter
    const handleClickEnter = e => {
        e.preventDefault();
        console.log(`clicked enter experience`);

        //start playing the audio
        const audio = document.querySelector(`.audio`);
        audio.volume = 0.4;
        audio.play();

        //animate menu with gsap
        gsap.to(".circle", {duration: 3, scale:2, opacity: 0});
        gsap.to(".circle", {duration: 1.5, rotation: `180deg`, ease: "power1.inOut"});
        gsap.to(".menu__copy", {duration: 3, opacity: 0});
        gsap.to(".fog", {duration: 3, opacity: 0});
        const $menuWrapper = document.querySelector(`.menu-wrapper`);
        setTimeout( function() { 
            $menuWrapper.style.display = `none`; 
            //animate the camera controls of scene to move upwards.
            gsap.to(controls.target, { x:0,y:30,z:0, duration: 5, ease: "power1.inOut"});
        }, 3000);

        //start the speech recognition after 8 seconds (so after the camera movement animation is over)
        // setTimeout( function() {
        //     //start up the speech recognition
        //     launchSpeechRecognition();
        // }, 8000);

        //launch the speech recognition
        launchSpeechRecognition();
    }

    const handleMousemoveWindow = e => {
        //execute function to check if mouse is in left or right 15% of screen, then move canvas accordingly
        if(e.clientX < (window.innerWidth *0.20)){
            // move left
            camera.position.x = cameraRadius * Math.cos( cameraAngle );  
            camera.position.z = cameraRadius * Math.sin( cameraAngle );
            cameraAngle -= 0.003;
        } else if(e.clientX > (window.innerWidth - (window.innerWidth *0.20))) {
            // move right
            camera.position.x = cameraRadius * Math.cos( cameraAngle );  
            camera.position.z = cameraRadius * Math.sin( cameraAngle );
            cameraAngle += 0.003;
        }
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

            const grammar = '#JSGF V1.0; grammar memoria; public <memoria> = one | two | three | four | five | six | return | back;';
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


            //temporary fix
            // focusStatue(3);
            // setTimeout(function(){
            //     returnToCenter();

            // }, 10000);

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
                    case `return`:
                    case `back`:
                        console.log(`input was return, start return to center function`);
                        returnToCenter();
                        break;
                }
            }
          
          } else {
            console.log(`Speech Recognition Not Available`);
        }

        // if ('speechSynthesis' in window) {
        //     console.log(`speech synthesis supported!`);
        //     const speechSynth = window.speechSynthesis;
        //     console.log(speechSynth);
            
        //     function populateVoiceList(){
        //         speechSynth.getVoices(); // now should have an array of all voices
        //     }

        //     if(speechSynth.onvoiceschanged !== undefined){
        //         speechSynth.onvoiceschanged = () => populateVoiceList();
        //     }

        //     let voices = speechSynth.getVoices();
        //     console.log(voices);

            
        //     const msg = new SpeechSynthesisUtterance();
        //     msg.text = "Welcome, to Memoria.";
        //     window.speechSynthesis.speak(msg);
        // }else{
        //      console.log("Sorry, your browser doesn't support text to speech!");
        // }
    }
    

    const focusStatue = (voiceInput) => {
        //get the coordinates of the statue
        const positionX = statues[voiceInput].position.x;
        const positionZ = statues[voiceInput].position.z;
        console.log(positionX);
        console.log(positionZ);

        //change target of the camera to the statue, and position of camera to be in front of the statue
        gsap.to(controls.target, {x:positionX, y:45, z:positionZ, duration: 4, ease: "power1.inOut"});
        gsap.to(camera.position, {x:positionX*0.9, y:45, z:positionZ*0.9, duration: 4, ease: "power1.inOut"});

        //render the poem that matches with the current statue/voiceInput, after gsap camera move
        setTimeout(function(){
            renderPoem(voiceInput);
        }, 6000);
    }

    //function to render the poem
    const renderPoem = voiceInput => {
        //log the poem matching to this statue
        console.log(poems[voiceInput]);
        console.log(poems[voiceInput].title);
        console.log(poems[voiceInput].lines);
        const currentPoem = poems[voiceInput];

        //show the poem class, and render the poem line per line animation
        const $poemContainer = document.querySelector(`.poem`);
        $poemContainer.style.display=`block`;
        $poemContainer.style.opacity=1;

        //create title, let appear using opacity styling and gsap
        const poemTitle = document.createElement(`p`);
        poemTitle.classList.add(`poem__title`);
        poemTitle.textContent = currentPoem.title;
        $poemContainer.appendChild(poemTitle);
        gsap.to(poemTitle, {opacity: 1, duration: 2, ease: "power1.inOut"});

        renderPoemLines(currentPoem, $poemContainer);

        //start the audio to read poem aloud


        //make the lines of the poem appear one by one
        for(let i=0; i < currentPoem.lines.length; i++) {
            //select the poem and execute gsap function on it
            const $currentLine = $poemContainer.querySelector(`.poem__line--${i}`);
            console.log($currentLine);
            
            setTimeout(function(){
                gsap.to($currentLine, {maxWidth: `100%`, duration: 2, ease: "power1.inOut"});
            }, (2000*i));
        }
    }

    const renderPoemLines = (currentPoem, poemContainer) => {
        for(let i=0; i < currentPoem.lines.length; i++){
            console.log(currentPoem.lines[i]);
            const newLine = document.createElement(`p`);

            newLine.classList.add(`poem__line`);
            newLine.classList.add(`poem__line--${i}`);
            if((i+1) % currentPoem.verseLength == 0) {
                newLine.classList.add(`poem__line--verse`);
            }

            newLine.textContent = currentPoem.lines[i];
            poemContainer.appendChild(newLine);
            // gsap.to(newLine, {maxWidth: `100%`, duration: 2});
        }
    }

    const returnToCenter = () => {
        //hide the poem again and set its contents empty again for next poem
        const $poemContainer = document.querySelector(`.poem`);
        gsap.to($poemContainer, {opacity:0, duration: 2});
        setTimeout(function(){
            $poemContainer.style.display = `none`;
            $poemContainer.innerHTML = ``;
            
            //change target of the camera to the center, and position of camera to be in front of center
            gsap.to(controls.target, {x:0, y:30, z:0, duration: 4, ease: "power1.inOut"});
            gsap.to(camera.position, {x:0, y:30, z:10, duration: 4, ease: "power1.inOut"});
        },2000);
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








        //load fonts
        await loadFonts();

        //get the statue from our StatueLoader
        await loadStatue();

        //setting up the scene
        sceneSetup();

        //show the loading screen until screen is rendered, then show menu.


        //show startup screen when scene is rendered.
        const $enterLink = document.querySelector(`.link`);
        $enterLink.addEventListener(`click`, handleClickEnter);
        gsap.to(".menu__copy", {duration: 1.5, opacity: 1});

        //starting our angle at 1.57 (or PI/2);
        cameraAngle = Math.PI/2;
        cameraRadius = 10; 
        window.addEventListener('mousemove', handleMousemoveWindow);
    }

    init();
}