// Suppress gl-matrix type errors (transitive dependency of mapbox-gl)
declare module 'gl-matrix' {
  const content: any;
  export default content;
}
