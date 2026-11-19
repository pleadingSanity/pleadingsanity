// 2018 Ford Transit Connect — clip-on "new-look" grille overlay.
// Pleading Sanity / P.S Studio · Shane Cooper · 17 Nov 2026
//
// A horizontal trim bar that clips OVER your existing upper-grille slats
// (no screws, no drilling), with a recessed blank badge mount in the centre.
// Fit your own legally-obtained badge for the modern coast-to-coast look.
//
// FIT CHECK FIRST: measure your grille, edit the parameters below, print a
// single test clip (set clip_count=1) to check the grip on one slat before
// printing the full bar.
//
// MATERIAL: PETG or ASA only — NOT PLA. PLA softens in a hot grille/sun and
// will warp. 0.2mm layers, 4 perimeters, 30% infill, supports under hooks.
//
// TRADEMARK: no Ford logo/badge is included — the centre recess is blank.

$fn = 48;

// ---- MEASURE YOUR GRILLE AND EDIT THESE ----
bar_length     = 420;   // mm — total width (measure upper grille opening)
bar_height     = 38;    // mm — vertical height of trim bar
bar_thickness  = 6;     // mm — depth, sits off grille face
slat_thickness = 4;     // mm — thickness of grille slat the clips grip
slat_lip       = 3;     // mm — hook lip that grabs behind the slat
clip_gap       = 0.4;   // mm — push-fit clearance
clip_count     = 4;     // number of C-clips, evenly spaced along the bar
clip_width     = 14;    // mm — width of each C-clip
badge_w        = 90;    // mm — centre badge recess width (measure your badge)
badge_h        = 45;    // mm — centre badge recess height
badge_d        = 2.5;   // mm — recess depth (badge sits inset)
corner_r       = 6;     // mm — rounded bar corners
// --------------------------------------------

grip = slat_thickness + clip_gap; // total gap inside the C

// ---- Main trim bar (rounded, along X), with centre badge pocket ----
module bar() {
  difference() {
    // rounded bar body: hull of 4 corner cylinders, extruded along X
    linear_extrude(bar_length, center=true)
    hull() {
      for (dy = [-bar_height/2 + corner_r, bar_height/2 - corner_r])
        for (dz = [-bar_thickness/2 + corner_r, bar_thickness/2 - corner_r])
          translate([dy, dz]) circle(r=corner_r);
    }
    // badge pocket on the front face (+Z side), centre, not through-hole
    translate([0, 0, bar_thickness/2 - badge_d/2 - 0.01])
    cube([badge_w, badge_h, badge_d + 0.2], center=true);
  }
}

// ---- One C-clip, centred at X=0, gripping a slat of thickness `grip` ----
// Profile (Y,Z): back plate at -bar_thickness/2, hooks reach toward grille.
module cclip() {
  y0 = -bar_height/2 + 3;          // bottom of back plate
  y1 =  bar_height/2 - 3;          // top of back plate
  z_back = -bar_thickness/2;       // back plate face (toward grille)
  z_front = bar_thickness/2 - 0.5; // front of back plate (bonded to bar)
  linear_extrude(clip_width, center=true)
  polygon(points=[
    // back plate
    [z_back,  y0],
    [z_back,  y1],
    [z_front, y1],
    // upper hook: forward, then inward (grips top of slat)
    [z_front, y1 - slat_lip - grip],
    [z_back + slat_lip, y1 - slat_lip - grip],
    [z_back + slat_lip, y0 + slat_lip + grip],
    [z_front, y0 + slat_lip + grip],
    // lower hook
    [z_front, y0],
  ]);
}

bar();

// Bond C-clips to the back of the bar, evenly spaced along X
spacing = bar_length / (clip_count + 1);
for (i = [1:clip_count]) {
  x = -bar_length/2 + i * spacing;
  translate([x, 0, 0]) cclip();
}

// Print hint: orient bar flat on bed (X-Y), clips point up; use supports.
