# 3dtiles-polygon-crop

![](example.gif)

~~Limited by Cesium API, currently only single area cropping can be provided. For details, see CesiumGS/cesium#8751~~

Cesium version 1.117 add ClippingPolygonCollection API to support polygon clipping. This project is archived

## Install

```javascript
npm install 3dtiles-polygon-crop
```

## Usage

```javascript
import { tileSetClipByPolygon } from "3dtiles-polygon-crop";

const points = [
  [106.443237643721, 29.46804376199225],
  [106.443237643721, 29.49579683916092],
  [106.500710551558, 29.49579683916092],
  [106.499071590308, 29.46301761415856],
  [106.490986048141, 29.443022286907117],
  [106.451323185888, 29.450780036824349],
];
const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(40866);
const CeiumPolygonClip = new tileSetClipByPolygon({
  tileSet: tileset,
  originPositions: points,
  unionClippingRegions: false,
});

CeiumPolygonClip.clippingByPositions();
```

## Options

| Name                 | Type            | Default            |
| -------------------- | --------------- | ------------------ |
| tileSet              | Cesium3DTileset | Null               |
| originPositions      | Array           | []                 |
| unionClippingRegions | Boolean         | True               |
| edgeWidth            | Number          | 0.0                |
| edgeColor            | Cesium.Color    | Cesium.Color.WHITE |
| enabled              | Boolean         | True               |

## License

[MIT](LICENSE)
