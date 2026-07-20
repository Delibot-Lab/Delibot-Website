declare module "occt-import-js" {
  export type OcctMeshAttribute = { array: number[] };

  export type OcctMesh = {
    name: string;
    attributes: {
      position: OcctMeshAttribute;
      normal?: OcctMeshAttribute;
    };
    index: OcctMeshAttribute;
    color?: [number, number, number];
    brep_faces?: { first: number; last: number; color?: [number, number, number] }[];
  };

  export type OcctReadResult = {
    success: boolean;
    meshes: OcctMesh[];
  };

  export type OcctInstance = {
    ReadStepFile: (buffer: Uint8Array, params: null) => OcctReadResult;
    ReadIgesFile: (buffer: Uint8Array, params: null) => OcctReadResult;
    ReadBrepFile: (buffer: Uint8Array, params: null) => OcctReadResult;
  };

  export type OcctModuleOptions = {
    locateFile?: (path: string) => string;
  };

  export default function occtimportjs(
    options?: OcctModuleOptions
  ): Promise<OcctInstance>;
}
