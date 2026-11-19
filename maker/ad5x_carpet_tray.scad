// ============================================================================
// P.S (Plastic Shane) — 4-Piece Interlocking Carpet Tray for Flashforge AD5X
// Fits 363x363mm AD5X footprint | Prints on 220x220mm bed | Dual-Colour P.S Logo
// ============================================================================
// HOW TO EXPORT:
//   Set part_to_export = 1 → F6 render → Export as STL → tile1_black.stl
//   Repeat for 2, 3, 4 (all black body)
//   Set part_to_export = 5 → Export as STL → ps_logo_white.stl (white insert)
//
// HOW TO PRINT 2-COLOUR:
//   Drag tile1_black.stl + ps_logo_white.stl into Orca-Flashforge together
//   → "Load as single object with multiple parts?" → YES
//   → Assign black body to Slot 1, white logo to Slot 2
//   → Flushing volume Black→White: 500 mm³
//   → Logo sits face-down on PEI plate, razor-sharp white finish, zero supports
//
// SLICER SETTINGS (AD5X): 0.20mm layer | 4 wall loops | 15% gyroid | no supports
// ============================================================================

$fn = 32;

// --- SELECT WHICH PIECE TO EXPORT ---
// 1 = Front-Left (Base)   | 2 = Front-Right (Base)
// 3 = Back-Left (Base)    | 4 = Back-Right (Base + Cable Notch)
// 5 = "P.S" Logo Insert (Export separately for crisp 2-colour printing!)
part_to_export = 1;

// --- DIMENSIONS (mm) ---
tile_size   = 190;   // 4 tiles = 380x380mm outer tray (368x368mm inner fit for 363mm base)
base_thick  = 4.0;   // Solid base thickness
rim_height  = 12.0;  // Outer lip height to block carpet fluff
rim_thick   = 6.0;   // Outer lip thickness
tab_len     = 14.0;  // Dovetail puzzle tab length
tab_width   = 22.0;  // Dovetail puzzle tab width
clearance   = 0.25;  // Snug friction-fit tolerance for PLA+

// --- REUSABLE "P.S" LOGO STAMP MODULE ---
module ps_logo_stamp(size = 18, depth = 0.8) {
    linear_extrude(height = depth) {
        text("P.S", size = size, font = "Liberation Sans:style=Bold",
             halign = "center", valign = "center", spacing = 1.05);
        translate([0, -size * 0.72, 0])
            square([size * 2.1, size * 0.14], center = true);
    }
}

// --- DOVETAIL PUZZLE CONNECTOR ---
module dovetail(tol = 0) {
    w1 = (tab_width * 0.65) - tol;
    w2 = tab_width - tol;
    l  = tab_len - (tol * 0.5);
    linear_extrude(height = base_thick)
        polygon(points = [
            [-w1/2, -0.1],
            [ w1/2, -0.1],
            [ w2/2,  l],
            [-w2/2,  l]
        ]);
}

// --- SINGLE CORNER TILE GENERATOR ---
module corner_tile(has_cable_notch = false) {
    difference() {
        union() {
            // Main flat floor plate
            cube([tile_size, tile_size, base_thick]);

            // Outer left & bottom raised rims
            cube([rim_thick, tile_size, rim_height]);
            cube([tile_size, rim_thick, rim_height]);

            // Male dovetail tab on right edge
            translate([tile_size, tile_size * 0.55, 0])
                rotate([0, 0, -90])
                    dovetail(clearance);
        }

        // Female dovetail slot on top edge
        translate([tile_size * 0.55, tile_size + 0.1, -0.1])
            rotate([0, 0, 180])
                scale([1, 1, 1.1])
                    dovetail(0);

        // Recessed "P.S" Logo Stamp on the BACK (underside) of every tile
        translate([tile_size * 0.52, tile_size * 0.52, -0.01])
            mirror([1, 0, 0]) // Mirrored so it reads right-way-round when flipped
                ps_logo_stamp(size = 20, depth = 0.81);

        // Optional rear power-cord notch for Back-Right corner
        if (has_cable_notch) {
            translate([tile_size * 0.65, -1, base_thick])
                cube([32, rim_thick + 2, rim_height]);
        }
    }
}

// --- EXPORT CONTROLLER ---
if (part_to_export == 1) corner_tile(false);
if (part_to_export == 2) rotate([0, 0, 90])  corner_tile(false);
if (part_to_export == 3) rotate([0, 0, -90]) corner_tile(false);
if (part_to_export == 4) rotate([0, 0, 180]) corner_tile(true);

// Export #5 as a separate STL to load together with #1-#4 for 2-colour print
if (part_to_export == 5) {
    translate([tile_size * 0.52, tile_size * 0.52, 0])
        mirror([1, 0, 0])
            ps_logo_stamp(size = 20, depth = 0.8);
}
