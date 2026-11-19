// ============================================================================
// P.S (Plastic Shane) — Reusable Two-Colour Logo Stamp Module
// Drop this file into EVERY OpenSCAD project. Use it on the back/underside
// of every part so the white "P.S" prints crisp in Slot 2 on the AD5X.
// ============================================================================
//
// USAGE — at the top of your .scad file:
//   use <ps_logo_stamp.scad>
//
// Then inside a difference() {} block for DEBOSS (recessed, prints white):
//   translate([x, y, z]) ps_stamp(width=20, depth=0.8, mode="deboss");
//
// Or inside a union() {} block for EMBOSS (raised, prints white on top):
//   translate([x, y, z]) ps_stamp(width=20, depth=0.8, mode="emboss");
//
// For 2-colour printing: export the stamp separately as a white STL
// (set mode="insert") and load it together with the black body in
// Orca-Flashforge as a multi-part object. Assign white to Slot 2.
// ============================================================================

$fn = 48;

module ps_stamp(width = 20, depth = 0.8, height = 0.8, mode = "deboss") {
    // width  = overall width of the P.S badge in mm
    // depth  = how far it sinks into (deboss) or rises above (emboss) the surface
    // height = extrusion height of the letters (keep = depth for flush)
    // mode   = "deboss" | "emboss" | "insert" (insert = standalone white STL)

    s = width / 3.2;  // letter scale derived from badge width

    // The sign of the extrusion: deboss goes DOWN (negative), emboss goes UP
    extrude_h = (mode == "deboss") ? -height : height;

    linear_extrude(height = abs(extrude_h)) {
        // Bold "P.S" lettering — Liberation Sans Bold ships with OpenSCAD
        text("P.S",
             size = s,
             font = "Liberation Sans:style=Bold",
             halign = "center",
             valign = "center",
             spacing = 1.08);

        // Clean underline bar under "P.S"
        translate([0, -s * 0.78, 0])
            square([width * 0.95, s * 0.13], center = true);

        // Small registered-dot between P and S for brand crispness
        translate([s * 0.55, -s * 0.05, 0])
            circle(r = s * 0.09);
    }
}

// ----------------------------------------------------------------------------
// STANDALONE TEST — uncomment to render just the badge (export as white STL)
// ----------------------------------------------------------------------------
// ps_stamp(width = 20, depth = 0.8, mode = "insert");

// ----------------------------------------------------------------------------
// EXAMPLE — Debossed P.S on the underside of a 60×40×5mm plate
// Mirror on X so it reads correctly when the part is flipped over.
// ----------------------------------------------------------------------------
// difference() {
//     cube([60, 40, 5]);
//     translate([30, 20, 5.01]) mirror([1, 0, 0])
//         ps_stamp(width = 20, depth = 0.8, mode = "deboss");
// }
