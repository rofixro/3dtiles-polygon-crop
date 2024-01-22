export class tileSetClipByPolygon {
  constructor(options) {
    this.tileSet = options.tileSet || null;
    this.edgeWidth = options.edgeWidth || 0.0;
    this.originPositions = options.originPositions || [];
    this.edgeColor = options.edgeColor || Cesium.Color.WHITE;
    this.enabled = !options.enabled ? options.enabled : true;
    this.unionClippingRegions = !options.unionClippingRegions ? options.unionClippingRegions : true;
  }
  isClockwise(polygon) {
    let area = 0;
    const { length } = polygon;
    for (let i = 0; i < length; i++) {
      const j = (i + 1) % length;
      area += polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
    }
    return area < 0;
  }
  getInverseTransform() {
    let transform;
    const tmp = this.tileSet.root.transform;
    if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(this.tileSet.boundingSphere.center);
    } else {
      transform = Cesium.Matrix4.fromArray(this.tileSet.root.transform);
    }
    return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());
  }
  clippingByPositions() {
    const clippingPlanes = [];
    const Cartesian3 = Cesium.Cartesian3;
    const pointsLength = this.originPositions.length;
    const clockwise = this.isClockwise(this.originPositions);
    const positions = clockwise ? this.originPositions.reverse() : this.originPositions;
    const inverseTransform = this.getInverseTransform();

    for (let i = 0; i < pointsLength; ++i) {
      const nextIndex = (i + 1) % pointsLength;
      const next = Cesium.Matrix4.multiplyByPoint(
        inverseTransform,
        Cesium.Cartesian3.fromDegrees(positions[nextIndex][0], positions[nextIndex][1]),
        new Cesium.Cartesian3()
      );
      const now = Cesium.Matrix4.multiplyByPoint(
        inverseTransform,
        Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]),
        new Cesium.Cartesian3()
      );
      const up = new Cesium.Cartesian3(0, 0, 10);
      let right = Cartesian3.subtract(next, now, new Cartesian3());
      right = Cartesian3.normalize(right, right);

      const normal = Cartesian3.cross(right, up, new Cartesian3());
      Cartesian3.normalize(normal, normal);
      if (this.unionClippingRegions) {
        Cartesian3.negate(normal, normal);
      }

      const planeTmp = Cesium.Plane.fromPointNormal(now, normal);
      const clipPlane = Cesium.ClippingPlane.fromPlane(planeTmp);

      clippingPlanes.push(clipPlane);
    }

    const clipPlanes = new Cesium.ClippingPlaneCollection({
      enabled: this.enabled,
      planes: clippingPlanes,
      edgeWidth: this.edgeColor,
      edgeColor: this.edgeColor,
      unionClippingRegions: this.unionClippingRegions,
    });

    this.tileSet.clippingPlanes = clipPlanes;
  }
  removeTilesetClip() {
    this.tileSet.clippingPlanes.enabled = false;
  }
}
