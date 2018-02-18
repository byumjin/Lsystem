import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';

import Lsystem from './lsystem/Lsystem';
import Icosphere from './geometry/Icosphere';
import Cube from './geometry/Cube';
import Square from './geometry/Square';

import Branch from './geometry/Branch';
import Suzanne from './geometry/Suzanne';
import Flower from './geometry/Flower';
import Leaf from './geometry/Leaf';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

import * as OBJ from 'webgl-obj-loader';


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Axiom: "[1X][2X][3X][4X]",
  Iteration: 1,
  Angle: 22.5,

  FlowerColor: [242, 232, 12, 1.0], 
  LeafColor: [18, 119, 23, 1.0], 
  BranchColor: [76, 43, 12, 1.0], 

  FlowerSize: 1.0, 
  LeafSize: 1.0, 
  BranchSize: 1.0,

  X : 1.0,
  Y : 0.0,
  Z : 1.0,
  WindStrength : 3.0,

};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;

let time: number;

let lsys: Lsystem;

let suz : Suzanne;
let branch : Branch;
let leaf : Leaf;
let flower : Flower;

let floor : Square;

let oldTime : number;
let currentTime : number;
let elapsedTime : number;
let deltaTime : number;

let MeshManager : Array<string> = [];





function loadScene() {

  //lsys = new Lsystem(vec3.fromValues(0, 0, 0));

  lsys.create();
  lsys.Angle = controls.Angle;
  lsys.BranchSize = controls.BranchSize;
  lsys.LeafSize = controls.LeafSize;
  lsys.FlowerSize = controls.FlowerSize;

  lsys.update(controls.Axiom, controls.Iteration);
  
  lsys.bindBuffers();
}

function releaseLsystem()
{
    //lsys.destory();
}

function rotatePlanet(planet: Icosphere, radius: number, speed: number) {
    let seed: number;
    seed = speed * time;

    //radius *= 5.0;

    planet.updateRotY(seed);
    planet.updateNewPos(vec3.fromValues(radius * Math.cos(seed), 0, radius * Math.sin(seed)));
    planet.updateModelMat();

}

function loadObjs()
{
  branch = new Branch(vec3.fromValues(0, 0, 0));      
  branch.createdByLoader(MeshManager[0]);

  leaf = new Leaf(vec3.fromValues(0, 0, 0));  
  leaf.createdByLoader(MeshManager[1]);
  //leaf.bindTexture("src/textures/floor_norm.jpg");

  flower = new Flower(vec3.fromValues(0, 0, 0));   
  flower.createdByLoader(MeshManager[2]);

  suz = new Suzanne(vec3.fromValues(0, 0, 0));         
  suz.createdByLoader(MeshManager[3]);

  floor = new Square(vec3.fromValues(0, 0, 0));  
  floor.create();    
  
  cube = new Cube(vec3.fromValues(0, 0, 0));  
  cube.create();    
}

function main() {
  // Initial display for framerate

  elapsedTime = 0.0;
  oldTime = Date.now();

  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  gui.add(controls, 'Axiom').onChange(function()
  {
    releaseLsystem();
    loadScene();
  });
  
  gui.add(controls, 'Iteration', 0, 6).step(1).onChange(function()
  {
    releaseLsystem();
    loadScene();
  });

  gui.add(controls, 'Angle', 0, 90).step(0.1).onChange(function()
  {
    releaseLsystem();
    loadScene();
  });

  var COL = gui.addFolder('Color'); 
  COL.addColor(controls, 'BranchColor');
  COL.addColor(controls, 'LeafColor');
  COL.addColor(controls, 'FlowerColor');

  gui.add(controls, 'BranchSize', 0, 3).step(0.1).onChange(function()
  {
    releaseLsystem();
    loadScene();
  });

  gui.add(controls, 'LeafSize', 0, 3).step(0.1).onChange(function()
  {
    releaseLsystem();
    loadScene();
  });

  gui.add(controls, 'FlowerSize', 0, 3).step(0.1).onChange(function()
  {
    releaseLsystem();
    loadScene();
  });


  var WIND = gui.addFolder('Wind'); 
  WIND.add(controls, 'X', 0.0, 1.0).step(0.1);
  WIND.add(controls, 'Y', 0.0, 1.0).step(0.1);
  WIND.add(controls, 'Z', 0.0, 1.0).step(0.1);
  WIND.add(controls, 'WindStrength', 0.0, 10.0).step(0.1);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);  

  const camera = new Camera(vec3.fromValues(0, 20, 60), vec3.fromValues(0, 15, 0));
  const renderer = new OpenGLRenderer(canvas);
  gl.enable(gl.DEPTH_TEST);

  let lambertShader: ShaderProgram;
  let solarShader: ShaderProgram;

  //main shader
  lambertShader = new ShaderProgram([
      new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
      new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),]);

  //Load Object
  loadObjs();
  lsys = new Lsystem(vec3.fromValues(0, 0, 0));
  lsys.getMeshes(branch, leaf, flower, suz);

  //Load main scene
  loadScene();

  //bakcground       
  solarShader = new ShaderProgram([
          new Shader(gl.VERTEX_SHADER, require('./shaders/solarSystem-vert.glsl')),
          new Shader(gl.FRAGMENT_SHADER, require('./shaders/solarSystem-frag.glsl')), ]);
    
  renderer.setClearColor(0.0, 0.0, 0.0, 1);

  function updateTime()
  {
    currentTime = Date.now();

    deltaTime = currentTime - oldTime;
    elapsedTime += deltaTime;    

    oldTime = currentTime;
  }

  // This function will be called every frame
  function tick()
  {
    updateTime();

    camera.update();

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    
    renderer.render(camera, lambertShader,
            [lsys],
            vec4.fromValues(controls.BranchColor[0], controls.BranchColor[1], controls.BranchColor[2], controls.BranchColor[3]),
            vec4.fromValues(controls.LeafColor[0], controls.LeafColor[1], controls.LeafColor[2], controls.LeafColor[3]),
            vec4.fromValues(controls.FlowerColor[0], controls.FlowerColor[1], controls.FlowerColor[2], controls.FlowerColor[3]),
            vec2.fromValues(elapsedTime * 0.001, 0.0),            
            vec4.fromValues(controls.X, controls.Y, controls.Z, controls.WindStrength),
        );

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);

    renderer.render(camera, solarShader, [floor],
    vec4.fromValues(controls.BranchColor[0], controls.BranchColor[1], controls.BranchColor[2], controls.BranchColor[3]),
    vec4.fromValues(controls.LeafColor[0], controls.LeafColor[1], controls.LeafColor[2], controls.LeafColor[3]),
            vec4.fromValues(controls.FlowerColor[0], controls.FlowerColor[1], controls.FlowerColor[2], controls.FlowerColor[3]),
    vec2.fromValues(elapsedTime * 0.001, 0.0),
    vec4.fromValues(controls.X, controls.Y, controls.Z, controls.WindStrength),
    );

    gl.disable(gl.CULL_FACE);
    
          
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

function readTextFile(file : string) : string
{
   console.log("Download" + file + "...");
    var rawFile = new XMLHttpRequest();
    let resultText : string;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                resultText= rawFile.responseText;                
            }
        }
    }
    rawFile.send(null);

    return resultText;
}

function DownloadMeshes()
{
  MeshManager.push(readTextFile("./src/models/branch.obj"));
  MeshManager.push(readTextFile("./src/models/leaf.obj"));
  MeshManager.push(readTextFile("./src/models/flower.obj"));
  MeshManager.push(readTextFile("./src/models/suzanne.obj"));
  console.log("Downloading is complete!");

  main();  
}

DownloadMeshes();

