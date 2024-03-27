uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

// vColor je varying atribut i to je nacin na koji vertexShader salje podatke fragmentShader-u!
varying vec4 vColor;
varying vec2 vAngle;

// color i position su vec rezervisane reci i to nije moralo da se dodaje kao sto je size dodat sa attribute float size;
void main() {
  // Transforms the position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  // Sets the size of the point
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColor = vec4(colour);
}
