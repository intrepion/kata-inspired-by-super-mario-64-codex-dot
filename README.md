# Cloudpost Orchard

An original 3D browser platformer inspired by Super Mario 64's movement vocabulary, controllable camera and revisitable mission structure. Play Pip, a sky courier restoring three sparks to a floating orchard. Procedural low-poly art, original setting and code; no Nintendo assets.

## Play locally

Node 22.12+ (Node 24 recommended):

```sh
npm ci
npm run dev -- --port 5220 --strictPort
```

Production: `npm run build`, then `npm exec vite preview -- --host 127.0.0.1 --port 5220 --strictPort`. Choose another free port if occupied. No website deployment is required.

## Controls

| Input                                    | Action                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| WASD                                     | Camera-relative movement with acceleration and braking |
| Space or Option/Alt (hold for height)    | Jump                                                   |
| Jump promptly after landing while moving | Double, then triple jump                               |
| Run, then Shift + Space                  | Long jump                                              |
| Stand still, then Shift + Space          | Backflip                                               |
| Fresh Space against a wall in air        | Wall kick                                              |
| Shift in air                             | Ground pound                                           |
| Q / E or mouse drag                      | Orbit camera                                           |
| Up / Down or mouse drag                  | Tilt camera                                            |
| Scroll                                   | Zoom                                                   |
| C                                        | Recenter behind courier                                |
| Escape                                   | Pause / help / return to post                          |

Choose one of three deliveries: climb the western ramp and terraces to the summit; search for eight amber seeds and return to the starting meadow; or wall-kick the eastern towers and ground-pound their bell. Touch the available glowing spark to finish. Return to the post or re-enter. Earned sparks save automatically in this browser; seeds reset on each entry. Falling restores you at the starting post. Orange wandering orchard pests can be stomped; contact hurts.

## Engineering and evidence

`npm run check` runs strict TypeScript. `npm test` runs behavioral simulation tests. `npm run build` checks types and builds production assets. CI runs all three on Node 22 and 24. See [research](docs/research.md), [scope/design](docs/design.md) and [verification](docs/verification.md) for provenance, tuning distinctions, actual checks and exclusions.

One open course, three objectives, desktop keyboard/mouse. No gamepad, touch controls, audio, swimming, flight, moving platforms, ledge grab, bosses or exact original-game physics. MIT license; Three.js is MIT. Gitignore includes the official GitHub Global Linux, Windows and macOS templates, plus project ignores.
