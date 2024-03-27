uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  // We take the 2D texture coordinates and multiply by a 2D rotation matrix
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  // Just samples the texture
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}
