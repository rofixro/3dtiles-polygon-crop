import { Color, Plane, Matrix4, Cartesian3, Transforms, ClippingPlane, ClippingPlaneCollection } from "cesium";

export class tilesPolygonCrop {
  constructor(options) {
    this.tileset = options.tileset || null;
    this.edgeWidth = options.edgeWidth || 0.0;
    this.edgeColor = options.edgeColor || Color.WHITE;
    this.originPositions = options.originPositions || [];
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
    const tmp = this.tileset.root.transform;
    if ((tmp && tmp.equals(Matrix4.IDENTITY)) || !tmp) {
      transform = Transforms.eastNorthUpToFixedFrame(this.tileset.boundingSphere.center);
    } else {
      transform = Matrix4.fromArray(this.tileset.root.transform);
    }
    return Matrix4.inverseTransformation(transform, new Matrix4());
  }
  clippingByPositions() {
    const clippingPlanes = [];
    const pointsLength = this.originPositions.length;
    const clockwise = this.isClockwise(this.originPositions);
    const positions = clockwise ? this.originPositions.toReversed() : this.originPositions;
    const inverseTransform = this.getInverseTransform();
    for (let i = 0; i < pointsLength; ++i) {
      const nextIndex = (i + 1) % pointsLength;
      const next = Matrix4.multiplyByPoint(
        inverseTransform,
        Cartesian3.fromDegrees(positions[nextIndex][0], positions[nextIndex][1]),
        new Cartesian3()
      );
      const now = Matrix4.multiplyByPoint(
        inverseTransform,
        Cartesian3.fromDegrees(positions[i][0], positions[i][1]),
        new Cartesian3()
      );

      const up = new Cartesian3(0, 0, 10);

      let right = Cartesian3.subtract(next, now, new Cartesian3());
      right = Cartesian3.normalize(right, right);

      const normal = Cartesian3.cross(right, up, new Cartesian3());
      Cartesian3.normalize(normal, normal);

      if (this.unionClippingRegions) {
        Cartesian3.negate(normal, normal);
      }

      const planeTmp = Plane.fromPointNormal(now, normal);
      const clipPlane = ClippingPlane.fromPlane(planeTmp);

      clippingPlanes.push(clipPlane);
    }
    const clipPlanes = new ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeWidth: this.edgeColor,
      edgeColor: this.edgeColor,
      enabled: this.enabled,
      unionClippingRegions: this.unionClippingRegions,
    });
    this.tileset.clippingPlanes = clipPlanes;
  }
  removeTilesetClip() {
    this.tileset.clippingPlanes.enabled = false;
  }
}
