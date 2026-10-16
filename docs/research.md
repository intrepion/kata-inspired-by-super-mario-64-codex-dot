# Gameplay research — 2026-10-16

## Original manual, verified before implementation

Nintendo, _Super Mario 64 instruction booklet_, English section, mirrored scan:
https://www.gamesdatabase.org/Media/SYSTEM/Nintendo_N64/Manual/formated/Super_Mario_64_-_1996_-_Nintendo.pdf

Read the original PDF with text extraction. Nintendo's former consumer URLs returned 404, so the scan is the cited primary document. PDF pages 4–5 describe direction/speed control, repeated landing jumps, triple jump with speed, stationary crouch somersault, running crouch then jump, and jumping again on wall contact. PDF page 7 describes the airborne Z ground pound; PDF page 10 describes following camera operators, C-button view changes, looking around for objectives and close/distant views. Printed page numbers differ because this scan uses spreads.

Verified inspiration → implementation:

- Running + crouch + jump → faster, lower long jump.
- Stationary crouch + jump → higher backward somersault.
- Timed jumps at successive landings → increasing double/triple jumps.
- Airborne wall contact + fresh jump → wall kick.
- Airborne crouch → downward ground pound.
- Controllable follow camera → orbit, tilt, zoom and recenter.

The manual is evidence for action relationships, **not** our numerical constants. Acceleration, gravity, jump speeds, collision radii, grace windows, long-jump speed and camera interpolation are original simplified tuning. Keyboard directional input and hold-sensitive jump height are browser adaptations. The manual does not substantiate our 120 Hz simulation or exact collision model.

## Gameplay corroboration

Super Mario Wiki, _Super Mario 64_, gameplay and controls:
https://www.mariowiki.com/Super_Mario_64#Gameplay

This specialist secondary reference corroborates a hub with course portals, multiple titled missions in explorable worlds, objective rewards, course exit after collecting most rewards, re-entry, enemy stomping, and eight-collectible missions. These informed three selectable objectives in one original course. It also corroborates the long-jump/backflip/wall-kick/chained-jump combinations. Our hub is a menu, our eight collectibles are seeds, and our objective count is three rather than a recreation of original content.

No copyrighted reference files are distributed in this repository. No source port/decompilation was used.
