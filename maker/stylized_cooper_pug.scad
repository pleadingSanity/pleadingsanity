// STYLIZED COOPER — two-color pug/boxer figurine for AD5X IFS.
// Pleading Sanity / P.S Studio · 17 Nov 2026
// BLACK (slot 1): body, head, ears, legs, tail, eyes, nose.
// WHITE (slot 3): chest patch, muzzle blaze.
// Render twice:
//   openscad -D PART=\"black\" -o cooper_black.stl stylized_cooper_pug.scad
//   openscad -D PART=\"white\" -o cooper_white.stl stylized_cooper_pug.scad
// Load both STLs in OrcaSlicer, assign black -> slot1, white -> slot3, same origin.
// Print: 0.2mm, 3 walls, 15% gyroid, supports under chin/tail only.
$fn = 48;
PART = "both";   // "black" | "white" | "both"
SCALE = 1.0;     // overall size multiplier (1.0 = ~80mm tall)

module black_parts() {
  // body (ellipsoid)
  scale([1, 1.35, 1]) sphere(r=22*SCALE);
  // head
  translate([0, 26*SCALE, 14*SCALE]) sphere(r=16*SCALE);
  // snout (black base; white blaze on top added separately)
  translate([0, 38*SCALE, 10*SCALE]) scale([1, 1.2, 0.8]) sphere(r=9*SCALE);
  // ears (flopped, flat)
  for (sx = [-1, 1]) {
    translate([sx*13*SCALE, 24*SCALE, 20*SCALE]) rotate([40, 0, sx*20])
      scale([0.35, 1, 1.2]) sphere(r=8*SCALE);
  }
  // legs (4 cylinders)
  for (sx = [-1, 1]) for (sy = [-1, 1])
    translate([sx*12*SCALE, sy*16*SCALE, -18*SCALE])
      cylinder(r=5*SCALE, h=20*SCALE, center=false);
  // tail (curled — torus segment)
  translate([0, -26*SCALE, 10*SCALE]) rotate([90, 0, 0])
    rotate([0, 0, 45]) torus(major_r=5*SCALE, minor_r=2.5*SCALE);
  // eyes + nose
  for (sx = [-1, 1]) translate([sx*6*SCALE, 39*SCALE, 18*SCALE]) sphere(r=2*SCALE);
  translate([0, 46*SCALE, 11*SCALE]) sphere(r=2.5*SCALE);
}
module white_parts() {
  // chest blaze (front of body, white patch)
  translate([0, 22*SCALE, -2*SCALE]) scale([0.55, 0.25, 0.7]) sphere(r=14*SCALE);
  // muzzle blaze (top of snout stripe)
  translate([0, 41*SCALE, 14*SCALE]) scale([0.4, 0.6, 0.5]) sphere(r=7*SCALE);
  // optional: white paw tips
  for (sx = [-1, 1]) translate([sx*12*SCALE, 20*SCALE, -20*SCALE])
    cylinder(r=5.2*SCALE, h=4*SCALE);
}
if (PART == "black" || PART == "both") black_parts();
if (PART == "white" || PART == "both") white_parts();
