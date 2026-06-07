# Johnny Five V1 Prototype Archive Summary

This branch archives the Johnny Five V1 prototype. It preserves the current source code, assets, generated images, rejected V2 puppet attempts, workshop work, charger work, animation attempts, manifests, and notes so the project can be restarted cleanly later.

The project goal was an always-on iPad robot companion named 5. The first target was not AI, voice, chat, menus, or wake words. The target was making the character feel alive first.

The workshop and surrounding presentation improved during the prototype, but the robot animation did not reach the goal. The core failure was architectural: too much work continued around a static full-body robot sprite/sticker. That made the character appear to slide or float instead of behaving like a grounded machine.

Tread motion also never became convincing. The prototype used visual hacks, overlays, blur-like artifacts, and incomplete tread ideas rather than true tread frames from one consistent mechanical design. Charger alignment then became a distraction before the robot itself worked as a living character.

Generated V2 asset attempts were also not production-ready. The batch contained inconsistent parts, incompatible tread designs, incomplete crops, invented pieces, and parts that did not clearly belong to the same master robot. Those files are preserved for reference under `src/assets/five-v2/rejected/`.

The next version should start from a clean character-first pipeline. It should begin with one approved master character design, then produce exact transparent PNG puppet parts from that same design before any animation, charger, workshop, AI, voice, or speech work resumes.
