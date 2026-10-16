# Scope and decisions

Original game: **Cloudpost Orchard**, starring Pip, a sky courier recovering three wind lantern sparks in a floating orchard. All mesh art is procedural original geometry; there are no Nintendo assets, audio, characters, code, or extracted data.

The user chose recommended defaults without interviews. Grill with Docs informed these decisions; its interview/confirmation instructions were superseded by that explicit direction. Implement informs type checking, behavioral testing, independent review, and commit delivery.

- One open, revisitable course with three selectable deliveries rather than many unfinished courses.
- Fixed 120 Hz simulation, independent of display refresh. Expanded rectangular side collision with a center-based floor footprint with descending top crossings, head collision, ramps and wall normals.
- Camera-relative acceleration, inertia and braking; keyboard walk while crouched. Third person orbit, tilt, zoom, recenter, obstacle shortening and follow smoothing.
- Six characteristic actions: variable-height jump, sequential double/triple jump, running long jump, standing crouch backflip, timed wall kick and air ground pound. Forgiving jump grace and wall contact window.
- Terrace summit, eight scattered seeds, and a bell on the eastern wall-kick towers. Collect a spark to finish, return to post or re-enter; completed deliveries persist locally under a namespaced/versioned key.
- Failed falls restore health and spawn without erasing seeds already collected in that visit. Re-entry resets seeds/enemies/bell and retains earned sparks. No life limit. Browser storage errors are nonfatal.

## Verification seam

Tests exercise Game.step through input frames, observable positions/move states, objective completion and save serialization. Scenario setup may place the player at boundary conditions; those tests do not claim a full course traversal by keyboard. Browser checks separately use normal input.

## Deliberate simplifications

Original tuning, no frame-perfect Nintendo physics, no analog gamepad support, no swimming/flying/cannon, no ledge grab/pole climb, no punch/dive, no bosses, audio or multiplayer. One course with three missions. Steep slippery slopes and moving platforms are excluded. Decorations are noncolliding; gameplay solids are rectangular prisms or a planar ramp. No public website deployment.
