GOAL:    A Hindi-speaking viewer with a home loan finishes knowing two numbers: 0.5% costs about ₹6 lakh, and ₹10,000 more a month saves about ₹38 lakh and 15 years. They feel the second one.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    ~ 8.5 min after dead-air trim x 30 fps. No music; the voice is the clock.
LOOK:    ground #F7F4EC whitish paper with a static grain PNG at 17% alpha, faint dotted grid #E3DED2 every 60 px;
         ink #2B2924 charcoal, marker strokes 6-9 px round caps, hand-wobble 2-3 px re-posed every 3 frames (boil);
         accent yellow #FFD84A: marker highlight behind the one spoken keyword in captions and on the board, nowhere else;
         red #E4573D only for interest/cost, green #3BA55D only for savings; blue #3D6FB4 only for customer B's house roof;
         display: Kalam 700 (handwriting, Devanagari+Latin) 56-120 px for labels, Baloo 2 700 for captions 58 px and hero numbers 140-220 px;
         medium: notebook page and marker. Depth: none. Shadows: hard 4px #2B2924 offset on paper notes only. No blur, no gradients.
OBJECTS: house A (charcoal, red door), house B (blue roof); a marker pen cursor that leads every draw; ₹ coin stack (circles with ₹);
         a 30-year ruler with 30 ticks; an EMI "receipt" slip; a sticky note (yellow, 4px hard shadow) for the +₹10,000; a bank building with pillars; a question mark.
MOTION:  draw-on = pen-velocity dash reveal 0.4-0.9 s power2.inOut; pop = back.out(2.2) 0.45 s on scale, never on opacity;
         scribble-out erase between topics 0.5 s; camera push on the board power2.inOut 0.8 s; counters power2.out 1.2-1.6 s;
         captions: group fades 0.16 s, karaoke yellow band per word scaleX 0.12 s. Boil on all ink: amp 1.4 px, rot 0.4 deg, frameDrop 3.
SHOTS:   see index.html scene table; one host per topic, internal beats cued to transcript words.
BANNED:  dark void; glow/particles; gradients; serif+mono label look; everything fading up; three cards in a row; a docked logo;
         bullet lists; a finished diagram dropped at once; captions repeating a title word for word; invented figures (every ₹ comes from the EMI formula on the numbers Shiv says).
QA:      frame 0 not empty (0.5% already drawn); every caption inside 80% title-safe; every ₹ figure recomputed by scripts/finance.py; nothing changes >3 s only during the voice's own pauses.
