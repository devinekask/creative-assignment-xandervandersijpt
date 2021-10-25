import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.133.1-nP52U8LARkTRhxRcba9x/mode=imports/optimized/three.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/GLTFLoader.js';
import {FontLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/FontLoader.js';
import {TTFLoader} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/loaders/TTFLoader.js';
import {TextGeometry} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/geometries/TextGeometry.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@v0.133.1/examples/jsm/controls/OrbitControls.js';

{
    //defining our poems in array
    const poems = [
        {title:`celeste`, verseLength: 2, audioPath: `celeste`, interactionShapes: [{name:`star`, locationX: 30, locationY: 50, width: 12}, {name:`moon`, locationX: 60, locationY: 25, width: 25}], lines:[`Vibrant as the sun`,`her smile could make me blush`,`She draws me in`,`with every ray of light`,`Closely warming me`,`a distance that she crossed`,`It's a feeling that I get`,`waiting for our hearts to align`,`As I'm the crescent moon`,`reflecting everything she gives`,`Every night I feel awakened`,`dream of just a lingering touch`,`Cursed be our lips`,`for they will never touch`,`Intertwined forever`,`yet forever to be apart`]},
        {title:`to stay`, verseLength: 2, audioPath: `tostay`, interactionShapes: [{name:`sun`, locationX: 65, locationY: 35, width: 15}, {name:`waves`, locationX: 25, locationY: 60, width: 30}], lines:[`Took a train out of the city`,`Followed the wind to the waves`,`Bathed in the sunlight by the window`,`In a temporary home I made`,`Let the calm wash over me`,`Felt all my fears just wane away`,`Unspoken kindness brought me here`,`And offered me a chance to stay`,`Took a train out of the city`,`Followed the wind to the waves`,`Thought the calm would keep me sane`,`But my thoughts were still at play`,`Wandered around hoping I would find a way`,`But who am I to try and escape`,`Hope you don't blame the choice I made`,`Because I never said that I deserved to stay`]},
        {title:`nightmare`, verseLength: 2, audioPath: `nightmare`, interactionShapes: [{name:`face`, locationX: 50, locationY: 70, width: 15}, {name:`pillow`, locationX: 50, locationY: 5, width:35}], lines:[`Nightmares haunting through my head`,`keeping me up at night, busy in bed`,`The dreams don't run through me`,`they always seem to miss my bed`,`The nights go by in total silence`,`not even sure of their existence`,`From dusk till dawn the days go by`,`missing every movement I lie`,`Only nightmares seem to find me`,`haunting me until I die`,`But I'd choose them over dreams any day`,`for the nightmares don't deceive my head`,`And who wants to live in a world full of lies and deceit`,`when reality could be oh so bittersweet?`]},
        {title:`fantasy`, verseLength: 2, audioPath: `fantasy`, interactionShapes: [{name:`cloud`, locationX: 50, locationY: 60, width:25}, {name:`lightning`, locationX: 45, locationY: 10, width:8}], lines:[`When he softly dreams`,`his mind takes him places`,`Sweet fantasies to explore`,`with symphonies to keep him company`,`He tries to believe`,`in those fairytales he needs`,`But something speaks to him`,`of lies and deceit`,`Is it real what he sees`,`or merely just a fantasy?`]},
        {title:`caged heart`, verseLength: 2, audioPath: `cagedheart`, interactionShapes: [{name:`flowers`, locationX: 50, locationY: 42, width:8}, {name:`heart`, locationX: 53, locationY: 37, width:30}], lines:[`I can't deny what I feel`,`even though it shouldn't be real`,`I'd put the pain in a cage`,`thrown away the key`,`It may seem easy`,`but it takes a lot to keep myself sane`,`As I'm feeling kind of queasy`,`and all I can remember is the pain`,`But now the cage has been unlocked`,`and the feelings are coming out like a flood`,`It's too late now to put them back behind bars`,`as there has been a revival of this caged heart`]},
        {title:`haunting little demons`, verseLength: 4, audioPath: `hauntinglittledemons`, interactionShapes: [{name:`eye`, locationX: 50, locationY: 55, width:20}, {name:`tears`, locationX: 50, locationY: 47, width:25}], lines:[`Did I need to wait`,`for you to decide if you were ready`,`Like a mere object`,`begging for attention`,`Still wonder what you meant`,`in all those midnight texts`,`They felt like little clues`,`a puzzle inside my bed`,`That chaotic state of mind`,`left me incapacitated`,`While my hopes and dreams`,`were ever so infatuated`,`Your indecisive signs`,`gave me so many frustrations`,`While my indecisive mind`,`let me go to far worse places`,`A simple figment of my imagination`,`taken further while I was sleeping`,`Won't you just leave me here`,`with these haunting little demons?`]}
    ];
    
    //defining some global variables for our project
    let poseNet, canvas, context, speechRecognition, scene, camera, renderer, controls, fontWispy, fontPoppinsReg, lampFile, statueFile, cameraAngle, cameraRadius;
    let dotLocation = [];
    let statues = [];
    const $statueInteraction = document.querySelector(`.statint`);
    const $poemContainer = document.querySelector(`.poem`);
    let poemAudio = new Audio();

    const loadLamp = () => {
        const lampLoader = new GLTFLoader();
        return new Promise((resolve,reject)=>{
            lampLoader.load(`./assets/glb/sceneLight.glb`, 
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
            fontLoader.load('./assets/fonts/BNWispy.json', function(response) {
            fontWispy = response;

            //load the Poppins font
            const ttfLoader = new TTFLoader();
            const ttfFontLoader = new FontLoader();
            ttfLoader.load('./assets/fonts/Poppins-Light.ttf', function(response) {
                fontPoppinsReg = ttfFontLoader.parse(response);
            })
            resolve();
            });
        });
    }

    const loadStatue = () => {
        const statueLoader = new GLTFLoader();
        return new Promise((resolve,reject)=>{
            statueLoader.load(`./assets/glb/tombLaurier.glb`, function (gltf) {
                statueFile = gltf.scene;
                resolve();
            });
        });
    }

    const sceneSetup = () => {
        //declaring our scene, camera and renderer to initialize our three.js scene.
        scene = new THREE.Scene();

        //perspective camera: Field of view, aspect ratio, near and far clipping plane.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,0.1, 1000);
        camera.position.set(0,30,10);

        //starting our angle at 1.57 (or PI/2);
        cameraAngle = Math.PI/2;
        cameraRadius = 10; 

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
        scene.fog = new THREE.Fog( `#151E39`, 1, 400);
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
        const light = new THREE.PointLight(`#ffffff`, 0.7);
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
                lightsRadius = 170;
            } else {
                lightsRadius = 190;
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
                statuesRadius = 145;
            } else if(i % 3 === 0) {
                statuesRadius = 160;
            } else {
                statuesRadius = 130;
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

        //start playing the audio
        const audio = document.querySelector(`.audio`);
        audio.volume = 0.2;
        audio.loop = true;
        audio.play();

        //animate menu with gsap
        gsap.to(".circle", {duration: 3, scale:2, autoAlpha: 0});
        gsap.to(".circle", {duration: 1.5, rotation: `180deg`, ease: "power1.inOut"});
        gsap.to(".menu__copy", {duration: 3, autoAlpha: 0});
        gsap.to(".fog", {duration: 3, autoAlpha: 0});
        const $menu = document.querySelector(`.menu`);
        setTimeout( function() { 
            $menu.style.display = `none`; 
            //animate the camera controls of scene to move upwards.
            gsap.to(controls.target, { x:0,y:30,z:0, duration: 5, ease: "power1.inOut"});
        }, 3000);

        //launch the speech recognition when pressing space and face detection
        poseNet.on(`pose`, handlePoseResultsCamera);

        document.addEventListener('keyup', e => {
            if (e.code === 'Space') {
            speechRecognition.start();
            }
        });
    }

    const launchSpeechRecognition = () => {
        if ("webkitSpeechRecognition" in window) {
            console.log(`speech recognition available. Enjoy the Memoria experience.`);
            
            //define new speechRecognition
            speechRecognition = new webkitSpeechRecognition();
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.lang = `en-US`;
            speechRecognition.maxAlternatives = 1;

            const grammar = '#JSGF V1.0; grammar memoria; public <memoria> = one | two | three | four | five | six | return | back;';
            const speechGrammarList = new webkitSpeechGrammarList();
            speechGrammarList.addFromString(grammar, 1)
            speechRecognition.grammars = speechGrammarList;

            //define the callback functions, log that SR is listening, results etc.
            const $voiceListenContainer = document.querySelector(`.voicelistening`);

            speechRecognition.onstart = () => {
                console.log(`SR is listening`);
                gsap.to($voiceListenContainer, {autoAlpha: 1, duration: 1});
            }

            speechRecognition.onend = () => {
                console.log(`SR stopped listening`);
                gsap.to($voiceListenContainer, {autoAlpha: 0, duration: 1});
            }

            speechRecognition.onerror = e => {
                console.log(`SR has an error.`);
            }

            speechRecognition.onresult = e => {
                //show result in console
                let speechResult = e.results[0][0].transcript;

                //when there is a result, check if it matches one of the 6 numbers, and then call the focusStatue function on that number
                switch(speechResult){
                    case '1':
                    case 'one':
                        focusStatue(0);
                        break;
                    case '2':
                    case 'two':
                        focusStatue(1);
                        break;
                    case '3':
                    case 'three':
                        focusStatue(2);
                        break;
                    case '4':
                    case 'four':
                        focusStatue(3);
                        break;
                    case '5':
                    case 'five':
                        focusStatue(4);
                        break;
                    case '6':
                    case 'six':
                        focusStatue(5);
                        break;
                    case `return`:
                    case `back`:
                        returnToCenter();
                        break;
                    default:
                        //no result matched / found
                        voiceNoResult();
                        break;
                }
            }
        } else {
            console.log(`Hi developer, Memoria is not available in this browser. Please open the experience in Google Chrome for optimal function.`)
        }
    }
    
    const voiceNoResult = () => {
        const $voiceFailContainer = document.querySelector(`.voicefail`);
        gsap.to($voiceFailContainer, {autoAlpha: 1, duration: 1});
        setTimeout(function() {
            gsap.to($voiceFailContainer, {autoAlpha: 0, duration: 1});
        }, 2500);
    }

    const focusStatue = (voiceInput) => {
        //turn off poseNet
        poseNet.removeListener(`pose`, handlePoseResultsCamera);

        //get the coordinates of the statue
        const positionX = statues[voiceInput].position.x;
        const positionZ = statues[voiceInput].position.z;

        //change target of the camera to the statue, and position of camera to be in front of the statue
        gsap.to(controls.target, {x:positionX, y:45, z:positionZ, duration: 4, ease: "power1.inOut"});
        gsap.to(camera.position, {x:positionX*0.9, y:45, z:positionZ*0.9, duration: 4, ease: "power1.inOut"});

        //do a check to empty the poem and figure container entirely, if the user switched directly from one poem to another
        if($poemContainer.innerHTML != 0) {
            gsap.to($poemContainer,{autoAlpha: 0, duration: 2});
            setTimeout(function(){
                $poemContainer.innerHTML = ``;
                if($poemContainer.classList.contains(`poem--right`)){
                    $poemContainer.classList.remove(`poem--right`);
                };
            }, 2000);
        };
        if($statueInteraction.innerHTML != 0) {
            gsap.to($statueInteraction,{autoAlpha: 0, duration: 2});
            setTimeout(function(){
                $statueInteraction.innerHTML = ``;

                if($statueInteraction.classList.contains(`statint--left`)){
                $statueInteraction.classList.remove(`statint--left`);
                };
            }, 2000);
        };

        //stop the poemAudio if already playing
        if (poemAudio.duration > 0 && !poemAudio.paused) {
            //Its playing...do your job
            poemAudio.pause();
        } 

        //render the poem that matches with the current statue/voiceInput, after gsap camera move
        setTimeout(function(){
            renderFigures(voiceInput);
            renderPoem(voiceInput);
        }, 6000);
    }

    const renderFigures = async voiceInput => {
        //show the statint screen
        $statueInteraction.style.display=`block`;
        $statueInteraction.style.opacity= 1;
        $statueInteraction.style.visibility= `visible`;
        gsap.to($statueInteraction, {autoAlpha: 1, duration: 2, ease: "power1.inOut"});

        const currentPoem = poems[voiceInput];

        //show the canvas
        canvas.style.visibility = `visible`;

        //set dotlocation to 0 again
        dotLocation = [];

        //if it's the first poem, move the interaction to the left side
        if(voiceInput == 0) {
            $statueInteraction.classList.add(`statint--left`);
        }

        //loop to render dots and each figure
        for(let i = 0; i < currentPoem.interactionShapes.length; i++) {
            //draw dot using location from array, on left / right position of screen depending on where the poem is shown
            //create a group for each of the figures
            const statGroup = document.createElement(`div`);
            statGroup.classList.add(`statint__group`);
            statGroup.classList.add(`statint__group1`);
            statGroup.style.marginLeft = `${currentPoem.interactionShapes[i].locationX}%`;
            statGroup.style.marginTop = `${currentPoem.interactionShapes[i].locationY}%`;
            $statueInteraction.appendChild(statGroup);

            //get the svg code for the figure and implement it into HTML
            const figureSVG = await fetch(`./assets/SVG/${currentPoem.audioPath}-${currentPoem.interactionShapes[i].name}.svg`).then(function(response){
                return response.text();
            });
            statGroup.innerHTML = figureSVG;

            //set a width on the path and height auto, add class with number to later identify right figure to draw.
            const $shape = statGroup.querySelector(`.shape`);
            $shape.classList.add(`shape${i}`);
            $shape.style.width = `${currentPoem.interactionShapes[i].width}vw`;
            $shape.style.left = `-${(currentPoem.interactionShapes[i].width)/2}vw`;
            $shape.style.top = `-${(currentPoem.interactionShapes[i].width)/2}vw`;

            //add dot in the div
            const statDot = document.createElement(`img`);
            statDot.setAttribute(`alt`,`nose figure dot`);
            statDot.setAttribute(`src`,`assets/dot.png`);
            statDot.classList.add(`group__dot`);
            statDot.classList.add(`group__dot${i}`);
            statGroup.appendChild(statDot);

            const dot = document.querySelector(`.group__dot${i}`);
            const currentDotLocation = getOffset(dot);
            //adjusting location with half of width image dot (1rem) to make sure it is centered with the location checker
            currentDotLocation.left += 8;
            currentDotLocation.top += 8;

            dotLocation.push(currentDotLocation);
        }
        
        setTimeout(function() {
            poseNet.on(`pose`, handlePoseResultsDraw);
        }, 1000);
    }

    //function to render the poem
    const renderPoem = voiceInput => {
        //get the poem matching to this statue
        const currentPoem = poems[voiceInput];

        //show the poem class, and render the poem line per line animation
        $poemContainer.style.display=`block`;
        $poemContainer.style.opacity= 1;
        $poemContainer.style.visibility= `visible`;

        if(voiceInput == 0) {
            $poemContainer.classList.add(`poem--right`);
        }

        //create title, let appear using opacity styling and gsap
        const poemTitle = document.createElement(`p`);
        poemTitle.classList.add(`poem__title`);
        poemTitle.textContent = currentPoem.title;
        $poemContainer.appendChild(poemTitle);
        gsap.to(poemTitle, {autoAlpha: 1, duration: 2, ease: "power1.inOut"});

        //start the audio to read poem aloud
        poemAudio.src = `./assets/poems/poem-${currentPoem.audioPath}.mp3`;
        poemAudio.load();
        poemAudio.onloadeddata = function(){
            poemAudio.play(); 
           
            renderPoemLines(currentPoem, $poemContainer);

            //show line that tells user what to do with the visuals
            const $dotsLine = document.createElement(`p`);
            $dotsLine.classList.add(`poem__message`);
            $dotsLine.classList.add(`poem__message--instruction`);
            $dotsLine.textContent = `move your nose to the dots for a visual memory`;
            $poemContainer.appendChild($dotsLine);

            //show line that tells user how to return
            const $returnLine = document.createElement(`p`);
            $returnLine.classList.add(`poem__message`);
            $returnLine.textContent = `to leave this memory, press space and say return`;
            $poemContainer.appendChild($returnLine);

            //make the lines of the poem appear one by one
            for(let i=0; i < currentPoem.lines.length; i++) {
                //select the poem and execute gsap function on it
                const $currentLine = $poemContainer.querySelector(`.poem__line--${i}`);
                
                setTimeout(function(){
                    gsap.to($currentLine, {maxWidth: `100%`, duration: 3.5, ease: "power1.inOut"});
                }, (3500*i));
            }

            //make the return appear
            gsap.to($returnLine, {autoAlpha: 1, duration:1});
            gsap.to($dotsLine, {autoAlpha: 1, duration:1});
        }
    }

    const renderPoemLines = (currentPoem, poemContainer) => {
        for(let i=0; i < currentPoem.lines.length; i++){
            const newLine = document.createElement(`p`);
            newLine.classList.add(`poem__line`);
            newLine.classList.add(`poem__line--${i}`);
            if((i+1) % currentPoem.verseLength == 0) {
                newLine.classList.add(`poem__line--verse`);
            }
            newLine.textContent = currentPoem.lines[i];
            poemContainer.appendChild(newLine);
        }
    }

    const returnToCenter = () => {
        //hide the poem again and set its contents empty again for next poem
        const $poemContainer = document.querySelector(`.poem`);
        gsap.to($poemContainer, {autoAlpha:0, duration: 2});
        gsap.to($statueInteraction, {autoAlpha:0, duration: 2});

        //turn off cursor listener and clear canvas
        poseNet.removeListener(`pose`, handlePoseResultsDraw);
        context.clearRect(0, 0, canvas.width, canvas.height);

        //stop the poemAudio if playing
        if (poemAudio.duration > 0 && !poemAudio.paused) {
            poemAudio.pause();
        }

        setTimeout(function(){
            $poemContainer.style.display = `none`;
            $poemContainer.innerHTML = ``;
            $statueInteraction.style.display = `none`;
            $statueInteraction.innerHTML = ``;

            //calculate the current camera positions for center
            const positionX = cameraRadius * Math.cos(cameraAngle);  
            const positionZ = cameraRadius * Math.sin(cameraAngle);

            //change target of the camera to the center, and position of camera to be in front of center
            gsap.to(controls.target, {x:0, y:30, z:0, duration: 4, ease: "power1.inOut"});
            gsap.to(camera.position, {x: positionX, y:30, z:positionZ, duration: 4, ease: "power1.inOut"});
        },2000);

        //turn on posenet again
        poseNet.on(`pose`, handlePoseResultsCamera);
    }


    const modelLoaded = () => {
        console.log(`model loaded!`);
    }

    const launchNoseRecognition = async () => {
        //Defining the detection options
        const detectionOptions = {
            withLandmarks: true,
            withDescriptors: false,
            minConfidence:0.5,
        };

        //create a video element in the document
        const videoElement = document.createElement(`video`);
        videoElement.setAttribute(`style`,`display:none`);
        videoElement.width = window.innerWidth;
        videoElement.height = window.innerHeight;
        document.body.appendChild(videoElement);

        //get the webcam input and set it as video sourceobject
        const constraints = {
            video: true,
        };
        const videoInput = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = videoInput;
        videoElement.play();

        //setup canvas for nose cursor
        setupNoseCanvas();

        //faceapi = ml5.faceApi(videoElement, detectionOptions, modelLoaded);
        poseNet = ml5.poseNet(videoElement, {flipHorizontal: true}, modelLoaded); 
    }

    const setupNoseCanvas = () => {
        canvas = document.querySelector(`.cursor`);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext(`2d`);
    }

    const handlePoseResultsCamera = (results) => {
        if(results.length > 0){
            const currentNoseX = results[0].pose.nose.x;
            //check whether the nose is moving left or right
            if(currentNoseX < window.innerWidth * 0.4) {
                camera.position.x = cameraRadius * Math.cos(cameraAngle);  
                camera.position.z = cameraRadius * Math.sin(cameraAngle);
                cameraAngle -= 0.01;
            } else if(currentNoseX > window.innerWidth * 0.6){
                camera.position.x = cameraRadius * Math.cos(cameraAngle);  
                camera.position.z = cameraRadius * Math.sin(cameraAngle);
                cameraAngle += 0.01;
            }
        }
    }

    const getOffset = (element) => {
        const rectangle = element.getBoundingClientRect();
        //return object with top and left content
        return {
            left: rectangle.left + window.scrollX,
            top: rectangle.top + window.scrollY
        };
    }

    const handlePoseResultsDraw = (results) => {
        if(results.length > 0){
            //clear the canvas before drawing new cursor
            context.clearRect(0, 0, canvas.width, canvas.height);
            //show the nose position as a cursor
            const currentNoseX = results[0].pose.nose.x;
            const currentNoseY = results[0].pose.nose.y;
            
            //draw cursor
            const radius = 5;
            context.beginPath();
            context.arc(currentNoseX, currentNoseY, radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();

            context.beginPath();
            context.arc(currentNoseX, currentNoseY, radius + 12, 0, 2 * Math.PI, false);
            context.lineWidth = 1;
            context.strokeStyle = 'white';
            context.stroke();

            //check if nose location matches dot location (not exact, adding a little margin), in loop for both figures
            for(let i = 0; i < dotLocation.length; i++) {
                if(currentNoseX >= (dotLocation[i].left - 10) && currentNoseX <= (dotLocation[i].left + 10)  && currentNoseY >= (dotLocation[i].top - 10) && currentNoseY <= (dotLocation[i].top + 10)) {
                    //select right shape
                    const $shape = document.querySelector(`.shape${i}`);
                    const $path = $shape.querySelector(`.path`);
                    $path.classList.add(`animate-path`);
                    let length = $path.getTotalLength();
                    const $dot = document.querySelector(`.group__dot${i}`);

                    // source: https://medium.com/@sterling.meghan/svg-line-animation-for-beginners-51857c88357f
                    $path.style.strokeDasharray = length + ' ' + length;
                    $path.style.strokeDashoffset = length;

                    //dim the dot
                    gsap.to($dot, {autoAlpha: 0, duration: 0.5});
                }
            }
        }
    }

    const loadScene = async () => {
        function hasGetUserMedia() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        }
        
        if (hasGetUserMedia()) {
            console.log(`has getUserMedia!`)
        } else {
            console.log(`Hi developer, Memoria is not supported by this browser. Please open this site in Google Chrome.`);
        }
        
        hasGetUserMedia();
        
        //load fonts
        await loadFonts();

        //get the statue from our StatueLoader
        await loadStatue();
        
        //setting up the threejs scene
        sceneSetup();
        
        //setup nose detection
        launchNoseRecognition();

        //setup speech detection
        launchSpeechRecognition();

        setTimeout(function(){
            //hide loading screen and show menu screen
            const $menuLoad = document.querySelector(`.menu__loader`);
            gsap.to($menuLoad, {autoAlpha: 0, duration: 1});

            //add eventlistener for the enter link
            const $enterLink = document.querySelector(`.link`);
            $enterLink.addEventListener(`click`, handleClickEnter);

            setTimeout(function(){
                const $menuCopy = document.querySelector(`.menu__copy`);
                gsap.to($menuCopy, {autoAlpha: 1, duration: 1});
            }, 1000);
        },6000);
    }

    const init = async () => {
        //show the loading screen until screen is rendered, then show menu.
        loadScene();
    }

    init();
}