export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledLayer {
  id: number;
  name: string;
  type: "tilelayer" | "objectgroup";
  visible: boolean;
  width?: number;
  height?: number;
  data?: number[];
  objects?: TiledObject[];
  properties?: TiledProperty[];
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: TiledProperty[];
}

export interface TiledProperty {
  name: string;
  type: string;
  value: any;
}

export interface TiledTileset {
  firstgid: number;
  source: string;
}
