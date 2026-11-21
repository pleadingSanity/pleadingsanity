// bruceybonusbargins — keychain / brand tag.
// Pleading Sanity / P.S Studio · 17 Nov 2026
// Set VARIANT = "bar" (long), "tag" (dog-tag), or "round" (circular).
// Print in PLA, 0.2mm, 3 walls, no supports. Embossed text for durability.

$fn = 64;

VARIANT = "bar";   // "bar" | "tag" | "round"

// ---- params ----
text_str    = "bruceybonusbargins";
text_depth  = 0.6;   // mm emboss
tag_t       = 3;     // mm thickness
hole_d      = 6;     // mm keyring hole
// bar
bar_w       = 90;    bar_h = 22;    bar_r = 11;
// tag
tag_w       = 45;    tag_h = 60;    tag_r = 8;
// round
round_d     = 55;
// ----------------

function text_size_for(w) = w / (len(text_str) * 0.62);

module shape() {
  if (VARIANT == "bar") {
    hull() {
      for (dx = [-bar_w/2+bar_r, bar_w/2-bar_r])
        translate([dx, 0]) circle(r=bar_r);
    }
  } else if (VARIANT == "tag") {
    hull() {
      for (dx = [-tag_w/2+tag_r, tag_w/2-tag_r])
        for (dy = [-tag_h/2+tag_r, tag_h/2-tag_r])
          translate([dx, dy]) circle(r=tag_r);
    }
  } else { // round
    circle(d=round_d);
  }
}

hole_x = (VARIANT == "bar") ? -bar_w/2 + 14 : 0;
hole_y = (VARIANT == "tag") ? tag_h/2 - 14 : 0;
ts = (VARIANT == "bar") ? 10 : (VARIANT == "tag" ? 7 : 8);

difference() {
  linear_extrude(tag_t) shape();
  translate([hole_x, hole_y, -1]) cylinder(d=hole_d, h=tag_t+2);
}

// embossed text on front
translate([(VARIANT=="bar"?6:0), 0, tag_t])
linear_extrude(text_depth)
text(text_str, size=ts, font="Arial:style=Bold", halign="center", valign="center");
