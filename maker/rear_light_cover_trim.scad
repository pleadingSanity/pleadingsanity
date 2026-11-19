// Rear-light decorative TRIM / surround — with blank custom-design panel.
// Pleading Sanity / P.S Studio · 17 Nov 2026
// IMPORTANT — UK ROAD LEGALITY: this is a decorative SURROUND / bezel that sits
// AROUND the lit lens, or a clear lens protector. It must NOT cover the lit
// area, change its colour, or reduce visibility — that fails MOT and is illegal.
// The inner opening exposes the full lens. The blank panel sits on the
// non-lit housing section for your custom design (engrave or glue an insert).
// MEASURE the rear section of your rear light first and edit the numbers.
// MATERIAL: black PETG/ASA for trim; CLEAR PETG if making a lens protector.
// Fit-check a paper template first. 0.2mm, 3 walls, no supports.

$fn = 48;

// ---- MEASURE THE REAR SECTION OF YOUR REAR LIGHT AND EDIT THESE ----
outer_w   = 180;   // mm — total width of trim
outer_h   = 70;    // mm — total height of trim
inner_w   = 150;   // mm — width of lens opening (must expose FULL lit area)
inner_h   = 45;    // mm — height of lens opening
trim_t    = 4;     // mm — thickness (depth) of the bezel
corner_r  = 10;    // mm — outer corner radius
inner_r   = 6;     // mm — inner corner radius
panel_w   = 40;    // mm — width of blank custom-design panel (non-lit section)
panel_d   = 1.5;   // mm — recess depth for your design insert/engraving
// ---------------------------------------------------------------

module rounded_rect(w, h, r) {
  hull() {
    for (dx = [-w/2+r, w/2-r])
      for (dy = [-h/2+r, h/2-r])
        translate([dx, dy]) circle(r=r);
  }
}

difference() {
  // bezel body
  linear_extrude(trim_t)
  rounded_rect(outer_w, outer_h, corner_r);
  // lens opening — exposes the lit lens fully, shifted to leave panel on side
  translate([(outer_w-inner_w)/2 - panel_w/2, 0, -0.5])
  linear_extrude(trim_t+1)
  rounded_rect(inner_w, inner_h, inner_r);
  // blank custom-design panel recess (carved from top face, non-lit area)
  translate([outer_w/2 - panel_w/2 - 2, 0, trim_t - panel_d])
  linear_extrude(panel_d + 0.5)
  rounded_rect(panel_w, outer_h - 8, 4);
}

// Your design goes in the recess: engrave text/logo, or glue a printed insert.
// Print a paper template at 100% scale first, hold it to the light, confirm fit.
