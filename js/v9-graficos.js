/* =====================================================================
   HOGWARTS 9 · GRÁFICOS
   - Calidad «Ultra» (más resolución y sombras más finas)
   - Posprocesado cinematográfico para todos los juegos 3D:
     brillo de luces (bloom), color de película, viñeta y bordes suaves
   ===================================================================== */
(() => {
  if (typeof M3 === 'undefined') return;
  const Q = () => (window.V7 && V7.quality ? V7.quality() : 'med');

  const VS = 'attribute vec2 aP;varying vec2 vU;void main(){vU=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}';
  const BRIGHT = `precision mediump float;uniform sampler2D uT;uniform float uTh;varying vec2 vU;
void main(){vec3 c=texture2D(uT,vU).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(uTh,uTh+.18,l)*smoothstep(uTh,1.,l),1.);}`;
  const BLUR = `precision mediump float;uniform sampler2D uT;uniform vec2 uD;varying vec2 vU;
void main(){vec3 c=texture2D(uT,vU).rgb*.227;c+=(texture2D(uT,vU+uD*1.385).rgb+texture2D(uT,vU-uD*1.385).rgb)*.316;c+=(texture2D(uT,vU+uD*3.231).rgb+texture2D(uT,vU-uD*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}`;
  const COMP = `precision highp float;uniform sampler2D uT,uB1,uB2;uniform vec2 uPx;uniform float uBloom,uVig,uFx,uTime,uGrade;varying vec2 vU;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec3 c=texture2D(uT,vU).rgb;
if(uFx>.5){float n=lum(texture2D(uT,vU+vec2(0.,-uPx.y)).rgb),s=lum(texture2D(uT,vU+vec2(0.,uPx.y)).rgb),e=lum(texture2D(uT,vU+vec2(uPx.x,0.)).rgb),w=lum(texture2D(uT,vU+vec2(-uPx.x,0.)).rgb),m=lum(c);
float mx=max(m,max(max(n,s),max(e,w))),mn=min(m,min(min(n,s),min(e,w)));
if(mx-mn>max(.04,mx*.12)){vec2 d=normalize(vec2(-((n)-(s)),(e)-(w))+1e-5)*uPx;c=(c+texture2D(uT,vU+d*.6).rgb+texture2D(uT,vU-d*.6).rgb+texture2D(uT,vU+d*1.6).rgb*.5+texture2D(uT,vU-d*1.6).rgb*.5)/3.;}}
vec3 b=texture2D(uB1,vU).rgb*.65+texture2D(uB2,vU).rgb*.9;
c+=b*uBloom;
vec3 g=c;float mx=max(g.r,max(g.g,g.b));g=mix(g,aces(g),smoothstep(.85,1.4,mx)*uGrade);
g=mix(g,g*g*(3.-2.*g),.18*uGrade);float L=lum(g);g=mix(vec3(L),g,1.+.12*uGrade);g*=vec3(1.015,1.,.985);
vec2 q=vU-.5;g*=1.-uVig*dot(q,q)*1.6;
g+=(fract(sin(dot(vU*uTime,vec2(12.9898,78.233)))*43758.5453)-.5)*.012;
gl_FragColor=vec4(g,1.);}`;

  function attach(S3) {
    const gl = S3.gl, cv = S3.canvas;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = fs => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('post'); const U = {}; ['uT', 'uB1', 'uB2', 'uTh', 'uD', 'uPx', 'uBloom', 'uVig', 'uFx', 'uTime', 'uGrade'].forEach(n => U[n] = gl.getUniformLocation(p, n)); return { p, U }; };
    let P;
    try { P = { br: prog(BRIGHT), bl: prog(BLUR), co: prog(COMP) }; } catch (e) { console.warn('post', e.message); return; }
    const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const rt = (w, h, depth) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      let rb = null; if (depth) { rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb); }
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { t, fb, rb, w, h, ok };
    };
    const free = r => { if (!r) return; gl.deleteTexture(r.t); gl.deleteFramebuffer(r.fb); if (r.rb) gl.deleteRenderbuffer(r.rb); };
    let main = null, h1 = null, h2 = null, q1 = null, q2 = null, broken = false;
    const size = () => {
      const w = cv.width, h = cv.height; if (main && main.w === w && main.h === h) return true;
      [main, h1, h2, q1, q2].forEach(free);
      main = rt(w, h, true);
      const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1), qw = Math.max(1, w >> 3), qh = Math.max(1, h >> 3);
      h1 = rt(hw, hh); h2 = rt(hw, hh); q1 = rt(qw, qh); q2 = rt(qw, qh);
      return main.ok && h1.ok && q1.ok;
    };
    const pass = (pr, target, setup) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
      gl.viewport(0, 0, target ? target.w : cv.width, target ? target.h : cv.height);
      gl.useProgram(pr.p); setup(pr.U);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(0);
    };
    const tex = (unit, t, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unit); };
    S3.post = {
      on: true, bloom: 1, vig: .55, grade: 1,
      begin() {
        if (!this.on || broken || S3._low) return false;
        if (!size()) { broken = true; return false; }
        gl.bindFramebuffer(gl.FRAMEBUFFER, main.fb); gl.viewport(0, 0, main.w, main.h); return true;
      },
      end() {
        gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false);
        for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
        pass(P.br, h1, U => { tex(0, main.t, U.uT); gl.uniform1f(U.uTh, .9); });
        pass(P.bl, h2, U => { tex(0, h1.t, U.uT); gl.uniform2f(U.uD, 1 / h1.w, 0); });
        pass(P.bl, h1, U => { tex(0, h2.t, U.uT); gl.uniform2f(U.uD, 0, 1 / h1.h); });
        pass(P.bl, q2, U => { tex(0, h1.t, U.uT); gl.uniform2f(U.uD, 1 / q1.w, 0); });
        pass(P.bl, q1, U => { tex(0, q2.t, U.uT); gl.uniform2f(U.uD, 0, 1 / q1.h); });
        pass(P.co, null, U => {
          tex(0, main.t, U.uT); tex(1, h1.t, U.uB1); tex(2, q1.t, U.uB2);
          gl.uniform2f(U.uPx, 1 / main.w, 1 / main.h); gl.uniform1f(U.uBloom, this.bloom * (Q() === 'ultra' ? .8 : .65));
          gl.uniform1f(U.uVig, this.vig); gl.uniform1f(U.uFx, 1); gl.uniform1f(U.uTime, (performance.now() % 10000) / 1000 + 1); gl.uniform1f(U.uGrade, this.grade);
        });
        gl.activeTexture(gl.TEXTURE0); gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      }
    };
  }

  // calidad: Ultra sube la resolución y las sombras; Alta/Ultra/Media usan posprocesado
  const _create = M3.create;
  M3.create = function (canvas, o) {
    o = Object.assign({}, o || {}); const q = Q();
    if (q === 'ultra') o.maxDpr = 3; else if (q === 'high') o.maxDpr = Math.max(o.maxDpr || 2, 2);
    const S3 = _create.call(this, canvas, o); if (!S3) return S3;
    if (q !== 'low') attach(S3);
    const _mat = S3.mat; S3.mat = o => { const m = _mat(o); if (m.env == null && !m.unlit && m.spec >= 1) m.env = q === 'low' ? 0 : .38; return m; };
    const _ss = S3.setShadow;
    S3.setShadow = (sz, c, e) => { if (sz) { const max = S3.gl.getParameter(S3.gl.MAX_TEXTURE_SIZE) || 2048; sz = Math.min(max, q === 'ultra' ? sz * 2 : q === 'high' ? Math.max(sz, 2048) : sz); } return _ss(sz, c, e); };
    return S3;
  };
  window.V9G = { attach };
})();
