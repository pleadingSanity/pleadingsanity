// COOPER — dog keychain / tag for Shane's dog Cooper.
// Pleading Sanity / P.S Studio · 17 Nov 2026
// Dog-tag shape with embossed name + paw print + keyring hole.
// Print in any PLA. 0.2mm layers, 3 walls, no supports.
// For a realistic 3D dog figurine: download a pug/boxer model from
// Printables/MakerWorld (free) and glue to the blank back; this tag is the
// custom nameplate. (I can't model a realistic dog from text — use a free STL.)

$fn = 64;

// ---- params ----
tag_w       = 45;    // mm width
tag_h       = 60;    // mm height
tag_t       = 3;     // mm thickness
corner_r    = 8;     // mm rounded corners
hole_d      = 6;     // mm keyring hole
hole_y      = 22;    // mm offset of hole from top edge
text_size   = 12;    // mm "COOPER"
text_depth  = 0.6;   // mm emboss
paw_scale   = 1.0;   // paw print size multiplier
// ----------------

module paw(x, y, s) {
  // main pad
  translate([x, y]) circle(r=4*s);
  // toes
  translate([x-5*s, y+5*s]) circle(r=2*s);
  translate([x-1.7*s, y+6.5*s]) circle(r=2*s);
  translate([x+1.7*s, y+6.5*s]) circle(r=2*s);
  translate([x+5*s, y+5*s]) circle(r=2*s);
}

difference() {
  // tag body: rounded rect via hull of 4 circles, extruded
  linear_extrude(tag_t)
  hull() {
    for (dx = [-tag_w/2+corner_r, tag_w/2-corner_r])
      for (dy = [-tag_h/2+corner_r, tag_h/2-corner_r])
        translate([dx, dy]) circle(r=corner_r);
  }
  // keyring hole (top)
  translate([0, tag_h/2 - hole_y, -1])
  cylinder(d=hole_d, h=tag_t+2);
}

// embossed name + paw on front (+Z face)
translate([0, -6, tag_t])
linear_extrude(text_depth)
text("COOPER", size=text_size, font="Arial:style=Bold", halign="center", valign="center");

translate([0, 12, tag_t])
linear_extrude(text_depth)
paw(0, 0, paw_scale);

// small dot accent under name (heart glyph removed — Arial may not render it;
// re-add with a symbol font if you want one)
translate([0, -18, tag_t])
linear_extrude(text_depth)
circle(r=2.5);
