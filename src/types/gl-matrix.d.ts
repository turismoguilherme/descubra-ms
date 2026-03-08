// Override gl-matrix types to suppress TS1540 errors (transitive dep of mapbox-gl)
// The 'module' keyword issue is in gl-matrix's own typings
declare module 'gl-matrix' {
  export namespace glMatrix {
    const EPSILON: number;
    const ARRAY_TYPE: any;
    const RANDOM: () => number;
    function setMatrixArrayType(type: any): void;
    function toRadian(a: number): number;
    function equals(a: number, b: number): boolean;
  }
  export namespace mat2 { const create: any; }
  export namespace mat2d { const create: any; }
  export namespace mat3 { const create: any; }
  export namespace mat4 { const create: any; }
  export namespace quat { const create: any; }
  export namespace quat2 { const create: any; }
  export namespace vec2 { const create: any; }
  export namespace vec3 { const create: any; }
  export namespace vec4 { const create: any; }
}
