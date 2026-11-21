# 3D print photos and concept renders
Put one photo per print here, named after the product `id` in `/ps-products.json`
(for example `ps-desk-tidy.webp`). Square, about 1200 x 1200, webp or jpg, under 300 KB.
The page only shows photos from this folder. See `docs/3D-PRINT-SHOP.md`.

## `*-render.png` files are check renders, not sale photos
Model check renders copied from `maker/ps-pack-20261120/*/stl-check-renders/`.
They show STL geometry before a physical test print. Their catalogue entry stays
`active: false` with `status: "design-validation"`; a render can never back a Buy
button. Replace it with a real photograph of the finished print before setting
`active: true`.
