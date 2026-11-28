/* Cold Ischemia Foundation webinar presenter.
   Animates webinar/presenter.jpg with WebGL: jaw opening driven by the narration envelope,
   natural blinks, and slight head motion. Falls back to the still photo without WebGL. */
(function () {
  'use strict';
  // Landmarks in presenter.jpg pixel space (500 x 658)
  var L = {
    mx: 239.0, seamY: 308.5, seamK: 0.003, mouthHalf: 53.0, jawHalf: 96.0, chinY: 392.0, neckY: 452.0,
    e1: [175.0, 205.0, 22.0, 8.0], e2: [280.0, 200.0, 22.0, 8.0]
  };

  var VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'uniform sampler2D tex;uniform vec2 size;uniform float openA;uniform float blink;',
    'uniform vec4 e1;uniform vec4 e2;uniform vec4 m;uniform vec3 jaw;',
    'varying vec2 uv;',
    'vec2 eyeShift(vec2 p, vec4 e){',
    '  float dx=(p.x-e.x)/e.z; if(abs(dx)>=1.0||blink<=0.001) return p;',
    '  float hh=e.w*sqrt(1.0-dx*dx); float top=e.y-hh; float lid=top+blink*2.0*hh;',
    '  if(p.y>top-7.0 && p.y<lid){ return vec2(p.x, p.y-blink*2.0*hh); }',
    '  return p;}',
    'float lash(vec2 p, vec4 e){',
    '  float dx=(p.x-e.x)/e.z; if(abs(dx)>=1.0||blink<=0.15) return 0.0;',
    '  float hh=e.w*sqrt(1.0-dx*dx); float lid=e.y-hh+blink*2.0*hh;',
    '  return (1.0-smoothstep(0.0,1.6,abs(p.y-lid)))*(1.0-dx*dx)*blink;}',
    'void main(){',
    '  vec2 p=uv*size;',
    '  float seam=m.y-m.z*(p.x-m.x)*(p.x-m.x);',
    '  float A=openA*12.0;',
    '  float dx=(p.x-m.x)/jaw.x; float wx=clamp(1.0-dx*dx,0.0,1.0); wx=wx*wx*(3.0-2.0*wx);',
    '  float vy=(p.y<seam)?0.0:1.0-smoothstep(jaw.y,jaw.z,p.y);',
    '  float mdx=(p.x-m.x)/m.w; float ms=max(0.0,1.0-mdx*mdx); float sms=sqrt(ms);',
    '  float D=A*wx*vy*mix(sms,1.0,smoothstep(0.0,28.0,p.y-seam));',
    '  float gap=A*wx*sms;',
    '  vec2 src=vec2(p.x,p.y-D);',
    '  src=eyeShift(src,e1); src=eyeShift(src,e2);',
    '  vec4 c=texture2D(tex,src/size);',
    '  float k=lash(p,e1)+lash(p,e2); c.rgb*=1.0-0.55*k;',
    '  if(gap>0.4 && p.y>=seam && p.y<seam+gap){',
    '    float t=(p.y-seam)/gap;',
    '    vec3 dark=mix(vec3(0.20,0.06,0.06),vec3(0.09,0.03,0.03),smoothstep(0.0,0.6,ms));',
    '    vec3 tongue=vec3(0.48,0.18,0.17);',
    '    vec3 inner=mix(dark,tongue,smoothstep(0.62,0.95,t)*smoothstep(0.3,0.8,ms)*0.7);',
    '    vec3 teeth=mix(vec3(0.84,0.80,0.72),vec3(0.58,0.52,0.47),clamp(t/0.5,0.0,1.0))*(0.75+0.25*ms);',
    '    float tb=smoothstep(0.0,0.06,t)*(1.0-smoothstep(0.36,0.52,t))*smoothstep(0.35,0.8,ms)*smoothstep(4.0,8.0,gap);',
    '    inner=mix(inner,teeth,tb*0.85);',
    '    float edge=smoothstep(0.0,1.3,min(p.y-seam,seam+gap-p.y))*smoothstep(0.0,0.08,ms);',
    '    c.rgb=mix(c.rgb,inner,edge);',
    '  }',
    '  gl_FragColor=c;',
    '}'
  ].join('\n');

  function Presenter(canvas, imgUrl) {
    this.canvas = canvas; this.open = 0; this.target = 0; this.speaking = false;
    this.blink = 0; this.nextBlink = performance.now() + 2500; this.blinkStart = 0;
    this.t0 = performance.now(); this.ok = false;
    var self = this, img = new Image();
    img.onload = function () { self.init(img); };
    img.src = imgUrl;
  }
  Presenter.prototype.init = function (img) {
    var c = this.canvas; c.width = img.width; c.height = img.height;
    var gl = null;
    try { gl = c.getContext('webgl', { premultipliedAlpha: false }) || c.getContext('experimental-webgl'); } catch (e) {}
    if (!gl) { this.fallback(img); return; }
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    try {
      var pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      var U = function (n) { return gl.getUniformLocation(pr, n); };
      gl.uniform2f(U('size'), img.width, img.height);
      gl.uniform4f(U('e1'), L.e1[0], L.e1[1], L.e1[2], L.e1[3]);
      gl.uniform4f(U('e2'), L.e2[0], L.e2[1], L.e2[2], L.e2[3]);
      gl.uniform4f(U('m'), L.mx, L.seamY, L.seamK, L.mouthHalf);
      gl.uniform3f(U('jaw'), L.jawHalf, L.chinY, L.neckY);
      this.gl = gl; this.uOpen = U('openA'); this.uBlink = U('blink'); this.ok = true;
      this.loop();
    } catch (e) { this.fallback(img); }
  };
  Presenter.prototype.fallback = function (img) {
    var c = this.canvas, ctx = c.getContext('2d'); if (ctx) ctx.drawImage(img, 0, 0);
  };
  // value 0..1 from the narration envelope (or null when silent)
  Presenter.prototype.setLevel = function (v, speaking) { this.target = v; this.speaking = speaking; };
  Presenter.prototype.loop = function () {
    var self = this;
    var now = performance.now(), t = (now - this.t0) / 1000;
    // smooth mouth: fast open, slightly slower close
    var k = this.target > this.open ? 0.55 : 0.35;
    this.open += (this.target - this.open) * k;
    // blinks every 2.5-6s, 160ms, occasional double blink
    if (now > this.nextBlink && !this.blinkStart) { this.blinkStart = now; }
    if (this.blinkStart) {
      var d = (now - this.blinkStart) / 160;
      this.blink = d < 0.5 ? d * 2 : Math.max(0, 2 - d * 2);
      if (d >= 1) { this.blinkStart = 0; this.blink = 0; this.nextBlink = now + (Math.random() < 0.15 ? 220 : 2500 + Math.random() * 3500); }
    }
    var gl = this.gl;
    gl.uniform1f(this.uOpen, Math.max(0, Math.min(1, this.open)));
    gl.uniform1f(this.uBlink, this.blink);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // head motion: subtle sway, more when speaking; breathing
    var amp = this.speaking ? 1 : 0.45;
    var rot = (Math.sin(t * 0.7) * 0.55 + Math.sin(t * 1.9) * 0.25 * amp + this.open * 0.35) * amp;
    var ty = Math.sin(t * 0.5) * 1.2 - this.open * 1.2 * amp;
    var tx = Math.sin(t * 0.37) * 1.4 * amp;
    var sc = 1 + Math.sin(t * 1.1) * 0.003;
    this.canvas.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')';
    requestAnimationFrame(function () { self.loop(); });
  };
  window.CIFPresenter = Presenter;
})();
