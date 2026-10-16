# Verification record — 2026-10-16

## Automated

16 behavioral tests pass through the actual Game.step controller:

- camera-relative movement at a 90° yaw, acceleration, inertia and braking;
- variable jump height, apex, solid-ground landing and head collision;
- running long jump versus standing backflip;
- air ground pound and walking after landing;
- sequential double/triple jumps;
- wall blocking and timed wall kick;
- continuous ramp ascent and actual authored ramp-to-plateau seam;
- fall recovery and health restoration;
- enemy damage/invulnerability and descending stomp;
- eight-seed objective, reward collection, visit reset, save round trip;
- bell ground-pound objective;
- malformed/duplicate/out-of-range save sanitation.

Strict TypeScript and production build pass. Seed/bell scenario tests arrange initial player positions to isolate objective conditions; they do not claim a full input-only traversal. Camera obstruction is implemented and code-reviewed but has no dedicated automated test.

## Mac Chrome, normal input

Verified on production preview http://127.0.0.1:5220/ using keyboard input and UI clicks, with DOM accessibility feedback and rendered screenshots:

- Course selection and normal walking/jumping; blocked by the seed ledge until jumping.
- Western ramp ascent. Browser traversal exposed a ramp/plateau collision lip, now fixed with a real-terrain regression.
- Full summit route: all five raised terrace transitions, reward collection, completion screen and 1/3 spark total.
- Re-enter button restores spawn, resets seeds to 0/8 and retains 1/3 spark.
- Camera Q orbit to 95°, followed by W: courier moves west in world space (x becomes -6), proving camera-relative movement. C recenters.
- Standing Shift+Space displays Backflip at y=3.2 with backward displacement.
- Space then airborne Shift, followed by direction input, lands and permits walking.
- Southern-edge fall restores full health and starting area (continuing movement during the held input carries courier slightly beyond spawn).
- Actual browser reload restores menu with Summit marked complete and 1/3 saved sparks.

**Not independently confirmed by normal browser input:** running long-jump transition, timed wall kick, sequential double/triple jump timing, complete eight-seed route, complete bell-tower route, every platform edge/ceiling and camera obstruction angle. These mechanics have simulation coverage where listed above, but no claim of exhaustive browser verification is made. Browser control disconnected/timeouts required fresh testing tabs. No game state was injected to complete the summit route or saved reload.

## Independent review

Separate code and fidelity reviewers inspected controller, world, camera/input, save logic and tests. Both identified a ground-pound landing mode freeze; fixed after bell detection and covered by a regression. Fidelity review identified the missing speed condition for the third chained jump; now requires horizontal speed >=4. A follow-up independent review found no substantive regression and reran 16/16 tests plus strict types. Collision is an expanded rectangular approximation with center-based floor checks, not exact cylinder geometry. Authored terrace spacing was inspected; the summit was subsequently completed in the browser.

## Isolation and publishing hygiene

New files confined to this workspace. Existing projects/saves were not edited. Prior preview listeners on 5218 and 5219 remain present. New production preview bound to verified-free 127.0.0.1:5220 with strictPort, detached session, PID 10065, parent PID 1, HTTP 200 verified. This is a local preview, no public website deployment. GitHub official Global ignore templates fetched intact. Staged contents scanned for common credential/private-data patterns before commit.
