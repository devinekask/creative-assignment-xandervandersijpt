{
    //defining some global variables for our project
    //declaring our scene, camera and renderer to initialize our three.js scene.
    const scene = new THREE.Scene();
    //perspective camera: Field of view, aspect ratio, near and far clipping plane.
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    const init = () => {
        //set size of renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        //adding our rendering canvas to our HTML document
        document.body.appendChild(renderer.domElement);


        //adding a cube to our canvas
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        cube = new THREE.Mesh(geometry, material);
        //adding the cube to our scene
        scene.add(cube);

        //moving the camera away so that it is out of our object
        camera.position.z = 5;


        //render the scene using an animation loop
        animate();
    }

    init();
}