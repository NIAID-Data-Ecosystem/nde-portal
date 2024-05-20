// Description: Helper functions for rounding polygon corners
// https://observablehq.com/@daformat/rounding-polygon-corners

function limitPrecision(num, precision = 2) {
  return Math.round(num * 10 ** precision) / 10 ** precision;
}

export function roundSvgPath(pathData, radius) {
  if (!pathData) {
    return;
  }

  // Get path coordinates as array of {x, y} objects
  let pathCoords = pathData
    .split(/[a-zA-Z]/)
    .reduce(function (parts, part) {
      var match = part.match(/(-?[\d]+(\.\d+)?)/g);
      if (match) {
        // Cast to number before pushing coordinate
        parts.push({
          x: +match[0],
          y: +match[1],
        });
      }
      return parts;
    }, [])
    .filter((e, i, arr) => {
      // Remove consecutive duplicates
      const prev = arr[i === 0 ? arr.length - 1 : i - 1];
      return e.x !== prev.x || e.y !== prev.y;
    });

  const path = [];
  const curveRadius = radius;

  for (let i = 0; i < pathCoords.length; i++) {
    // Get current point and the next two (start, corner, end)
    const c2Index = (i + 1) % pathCoords.length;
    const c3Index = (i + 2) % pathCoords.length;

    const c1 = pathCoords[i];
    const c2 = pathCoords[c2Index];
    const c3 = pathCoords[c3Index];

    // Vector going from C2 to C1 and from C2 to C3
    const c1c2dx = c1.x - c2.x;
    const c1c2dy = c1.y - c2.y;
    const c3c2dx = c3.x - c2.x;
    const c3c2dy = c3.y - c2.y;

    const angle = Math.abs(
      Math.atan2(
        c1c2dx * c3c2dy - c1c2dy * c3c2dx,
        c1c2dx * c3c2dx + c1c2dy * c3c2dy,
      ),
    );

    // Divide distance by two to allow rounding the next corner as much as this one
    const c2c1Dist = Math.hypot(c1c2dx, c1c2dy) / 2;
    const c2c3Dist = Math.hypot(c3c2dx, c3c2dy) / 2;

    // Clamp radius the the max available
    const clampedRadius = Math.min(radius, c2c1Dist, c2c3Dist);

    // Compute ideal control point distance to create a circle with quadratic bezier curves
    // const idealControlPointDistance = (4 / 3) * Math.tan(Math.PI / (2 * 4)) * clampedRadius;
    const idealControlPointDistance =
      (4 / 3) *
      Math.tan(Math.PI / (2 * ((2 * Math.PI) / angle))) *
      clampedRadius *
      (angle < Math.PI / 2 ? 1 + Math.cos(angle) : 1);

    // Start of the curve
    let c1c2curvePoint = {
      x: c2.x + (c1c2dx * clampedRadius) / c2c1Dist / 2,
      y: c2.y + (c1c2dy * clampedRadius) / c2c1Dist / 2,
    };
    // First control point
    let c1c2curveCP = {
      x:
        c2.x +
        (c1c2dx * (clampedRadius - idealControlPointDistance)) / c2c1Dist / 2,
      y:
        c2.y +
        (c1c2dy * (clampedRadius - idealControlPointDistance)) / c2c1Dist / 2,
    };
    // End of the curve
    let c3c2curvePoint = {
      x: c2.x + (c3c2dx * clampedRadius) / c2c3Dist / 2,
      y: c2.y + (c3c2dy * clampedRadius) / c2c3Dist / 2,
    };
    // Second control point
    let c3c2curveCP = {
      x:
        c2.x +
        (c3c2dx * (clampedRadius - idealControlPointDistance)) / c2c3Dist / 2,
      y:
        c2.y +
        (c3c2dy * (clampedRadius - idealControlPointDistance)) / c2c3Dist / 2,
    };

    // Limit number after floating point
    const limit = point => ({
      x: limitPrecision(point.x, 3),
      y: limitPrecision(point.y, 3),
    });

    c1c2curvePoint = limit(c1c2curvePoint);
    c1c2curveCP = limit(c1c2curveCP);
    c3c2curvePoint = limit(c3c2curvePoint);
    c3c2curveCP = limit(c3c2curveCP);

    // If at last coordinate of polygon, use the end of the curve as
    // the polygon starting point
    if (i === pathCoords.length - 1) {
      path.unshift('M' + c3c2curvePoint.x + ' ' + c3c2curvePoint.y);
    }

    // Draw line from previous point to the start of the curve
    path.push('L' + c1c2curvePoint.x + ' ' + c1c2curvePoint.y);

    // Cubic bezier to draw the actual curve
    path.push(
      'C' +
        c1c2curveCP.x +
        ' ' +
        c1c2curveCP.y +
        ',' +
        c3c2curveCP.x +
        ' ' +
        c3c2curveCP.y +
        ',' +
        c3c2curvePoint.x +
        ' ' +
        c3c2curvePoint.y,
    );
  }

  // Close path
  path.push('Z');

  return path.join(' ');
}
