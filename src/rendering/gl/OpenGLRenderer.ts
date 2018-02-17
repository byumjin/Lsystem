import {mat4, vec2, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, bcolorParam: vec4, lcolorParam: vec4, fcolorParam: vec4, timeInfo: vec2 , windParam: vec4) {
    
    let viewProj = mat4.create();
    let bcolor = vec4.fromValues(bcolorParam[0] / 255, bcolorParam[1] / 255, bcolorParam[2] / 255, bcolorParam[3]);
    let lcolor = vec4.fromValues(lcolorParam[0] / 255, lcolorParam[1] / 255, lcolorParam[2] / 255, lcolorParam[3]);
    let fcolor = vec4.fromValues(fcolorParam[0] / 255, fcolorParam[1] / 255, fcolorParam[2] / 255, fcolorParam[3]);
    let wind = vec4.fromValues(windParam[0], windParam[1], windParam[2], windParam[3]);
   
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    
    prog.setViewProjMatrix(viewProj);
    
    prog.setBranchColor(bcolor);
    prog.setLeafColor(lcolor);
    prog.setFlowerColor(fcolor);

    prog.setTimeInfo(timeInfo);

    prog.setWind(wind);

    for (let drawable of drawables) {      
      prog.setTexture(drawable.diffuseMap);
      prog.setModelMatrix(drawable.modelMat);
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
