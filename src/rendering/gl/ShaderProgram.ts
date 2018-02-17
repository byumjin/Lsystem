import {vec2, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrUV: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;

  unifBColor: WebGLUniformLocation;
  unifLColor: WebGLUniformLocation;
  unifFColor: WebGLUniformLocation;

  unifTimeInfo : WebGLUniformLocation;

  unifWind : WebGLUniformLocation;

  unifDiffuseMap: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_Uv");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");

    this.unifBColor = gl.getUniformLocation(this.prog, "u_branchColor");
    this.unifLColor = gl.getUniformLocation(this.prog, "u_leafColor");
    this.unifFColor = gl.getUniformLocation(this.prog, "u_flowerColor");

    this.unifTimeInfo = gl.getUniformLocation(this.prog, "u_TimeInfo");

    this.unifWind = gl.getUniformLocation(this.prog, "u_Wind");

    this.unifDiffuseMap = gl.getUniformLocation(this.prog, "u_DiffuseMap");
    }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setBranchColor(color: vec4) {
    this.use();
    if (this.unifBColor !== -1) {
      gl.uniform4fv(this.unifBColor, color);
    }
  }

  setLeafColor(color: vec4) {
    this.use();
    if (this.unifLColor !== -1) {
      gl.uniform4fv(this.unifLColor, color);
    }
  }

  setFlowerColor(color: vec4) {
    this.use();
    if (this.unifFColor !== -1) {
      gl.uniform4fv(this.unifFColor, color);
    }
  }

  setTimeInfo(info: vec2) {
    this.use();
    if (this.unifTimeInfo !== -1) {
      gl.uniform2fv(this.unifTimeInfo, info);
    }
  }

  setWind(wind: vec4) {
    this.use();
    if (this.unifWind !== -1) {
      gl.uniform4fv(this.unifWind, wind);
    }
  }


  

  setTexture(texture: WebGLTexture) {
      this.use();
      if (this.unifDiffuseMap !== -1) {

        gl.uniform1i(this.unifDiffuseMap, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
  }
};

export default ShaderProgram;
