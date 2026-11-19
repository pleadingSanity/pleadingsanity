// Ford-style badge CLIP-ON holder for old bumper — blank badge mount.
// Pleading Sanity / P.S Studio · 17 Nov 2026
// A C-clip that pushes onto a bumper slat/grille edge, with a flat face and
// a recessed blank oval so you can fit your own legally-obtained badge.
// NO Ford logo is modelled — trademark. Generic clip + blank mount only.
// MATERIAL: PETG or ASA (car heat/UV). NOT PLA. Fit-check a single clip first.
// 0.2mm layers, 4 walls, supports under the C-clip hooks.

$fn = 48;

// ---- MEASURE YOUR BUMPER SLAT / EDGE AND EDIT THESE ----
face_w        = 110;   // mm — width of the visible badge plate
face_h        = 55;    // mm — height of the visible badge plate
face_t        = 5;     // mm — thickness of the plate
edge_thick    = 5;     // mm — thickness of the bumper slat/edge the clip grips
clip_lip      = 3;     // mm — hook lip that grabs behind the edge
clip_gap      = 0.5;   // mm — push-fit clearance
clip_count    = 2;     // number of C-clips on the back (evenly spaced)
clip_width    = 18;    // mm — width of each C-clip
badge_oval_w  = 90;    // mm — width of blank badge recess (measure your badge)
badge_oval_h  = 35;    // mm — height of blank badge recess
badge_d       = 2.5;   // mm — recess depth
corner_r      = 8;     // mm — plate corner radius
// -------------------------------------------------------

grip = edge_thick + clip_gap;

// plate body (rounded rect, extruded along X = width)
module plate() {
  difference() {
    linear_extrude(face_w, center=true)
    hull() {
      for (dy = [-face_h/2+corner_r, face_h/2-corner_r])
        for (dz = [-face_t/2+corner_r, face_t/2-corner_r])
          translate([dy, dz]) circle(r=corner_r);
    }
    // blank oval badge recess on front (+Z face), not through
    translate([0, 0, face_t/2 - badge_d/2 - 0.01])
    scale([1, badge_oval_w/badge_oval_h, 1])
    cylinder(d=badge_oval_h, h=badge_d+0.2, center=true);
  }
}

// one C-clip, centred at X=0, gripping edge of thickness `grip`
module cclip() {
  y0 = -face_h/2 + 4;
  y1 =  face_h/2 - 4;
  z_back = -face_t/2;        // toward bumper
  z_front = face_t/2 - 0.5;  // bonded to plate
  linear_extrude(clip_width, center=true)
  polygon(points=[
    [z_back,  y0],
    [z_back,  y1],
    [z_front, y1],
    [z_front, y1 - clip_lip - grip],
    [z_back + clip_lip, y1 - clip_lip - grip],
    [z_back + clip_lip, y0 + clip_lip + grip],
    [z_front, y0 + clip_lip + grip],
    [z_front, y0],
  ]);
}

plate();

spacing = face_w / (clip_count + 1);
for (i = [1:clip_count]) {
  x = -face_w/2 + i*spacing;
  translate([x, 0, 0]) cclip();
}

// PRINT: plate flat on bed, clips up, supports on hooks. PETG/ASA only.
