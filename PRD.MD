Product Requirements Document: Pancake Stack Frenzy
Version: 1.0
Last Updated: December 25, 2025
Document Owner: Product Team
1. Game Overview and Vision
Pancake Stack Frenzy is a casual, physics-based mobile game where players stack pancakes as high as possible before the tower collapses. The game combines satisfying tactile gameplay with charming visuals and sound design to create a delightful, snackable experience perfect for short play sessions. Core Vision:
Accessible one-handed gameplay that anyone can pick up in seconds
Satisfying physics interactions that feel realistic yet forgiving
Cozy, food-themed aesthetic that evokes comfort and joy
Creative expression through pancake decoration
High replayability through simple "beat your high score" mechanics
2. Target Audience
Primary Audience:
Casual mobile gamers (ages 8-35)
Players who enjoy physics-based puzzles (Tower Bloxx, Stack, Pancake Tower)
Fans of cozy, low-stress gaming experiences
Secondary Audience:
Younger children (6-12) drawn to colorful, food-themed content
Players seeking short, satisfying gameplay sessions (2-5 minutes)
Creative players who enjoy customization and decoration mechanics
Player Motivations:
Quick entertainment during commutes or breaks
Satisfying tactile feedback and physics simulation
Achievement through high scores and personal bests
Creative expression through decoration
3. Platform
Target Platforms:
iOS (iPhone and iPad) - iOS 14.0+
Android smartphones and tablets - Android 8.0 (API level 26)+
Technical Specs:
Portrait orientation (primary)
Touch-optimized controls
Optimized for devices released in last 5 years
Target framerate: 60 FPS
Estimated download size: 150-250 MB
4. Core Gameplay Loop
4.1 Classic Stack Mode Gameplay Flow
Pancake Delivery - A new pancake appears at the top of the screen
Player Positioning - Player taps or drags to position the pancake horizontally
Drop Action - Player releases to drop the pancake onto the stack
Physics Reaction - Pancake lands, stack wobbles based on physics
Stabilization - Stack settles (or continues wobbling)
Repeat - Next pancake appears
Collapse - Eventually, the stack becomes too unstable and topples
Score Display - Final score shown with replay option
4.2 Session Structure
Average session length: 2-5 minutes
Quick restart: One tap to replay after failure
No lives system: Unlimited attempts
Immediate feedback: Visual and audio cues for good/bad placement
5. Physics System
5.1 Stack Behavior
Core Physics Principles:
Realistic gravity simulation with slightly forgiving parameters
Each pancake is a physics object with mass, friction, and bounce properties
Stack stability decreases with height and poor pancake alignment
Center-of-mass calculation determines wobble intensity
Cumulative instability: small misalignments compound over time
Pancake Properties:
Mass: Consistent across all pancakes (unless special types introduced)
Friction: Medium-high to prevent excessive sliding
Bounciness: Low (soft landing feel)
Shape: Circular collider with slight thickness
5.2 Wobble and Collapse Mechanics
Wobble System:
Stack begins wobbling when center of mass shifts beyond threshold
Wobble intensity increases with:
Stack height
Misalignment from center
Speed of pancake impact
Visual wobble animation synchronized with physics
Collapse Triggers:
Center of mass exceeds critical angle (e.g., 15-20 degrees from vertical)
Pancakes slide off edges
Excessive momentum from poor drop
Collapse Behavior:
Pancakes tumble realistically with rotation
Stack falls in direction of imbalance
Pancakes scatter and bounce on ground
Brief slow-motion effect at moment of collapse (0.5s)
5.3 Physics Parameters (Reference Values)
Gravity: Standard (9.8 m/s² or adjusted for game feel)
Pancake diameter: 100 units (relative)
Maximum safe offset: 30% of diameter before instability
Wobble threshold angle: 12 degrees
Collapse threshold angle: 18 degrees
6. Controls
6.1 Classic Stack Mode Controls
Primary Control Scheme: Tap-to-Drop
Pancake automatically sways left-right at top of screen
Tap anywhere to drop pancake at current position
Simple, one-handed gameplay
Alternative Control Scheme: Drag-and-Drop
Player drags pancake left/right before dropping
Release finger to drop
Allows more precise placement but requires two-hand play
Control Settings:
Players can toggle between control schemes in settings
Default: Tap-to-Drop (more accessible)
6.2 Decoration Mode Controls
Tap: Select decoration tool
Drag: Apply decoration (syrup pour, sprinkle scatter, cream placement)
Hold: Continuous application (e.g., pouring syrup)
Pinch-to-zoom: (Optional) View pancake details
Undo button: Remove last decoration action
7. Scoring System and Progression
7.1 Scoring Mechanics
Points Awarded:
+10 points per pancake successfully stacked
+5 bonus points for perfect center alignment
+3 bonus points for gentle landing (low impact velocity)
Combo multiplier: Consecutive perfect stacks increase multiplier (x1.5, x2, x2.5, max x3)
Height bonuses: Every 10 pancakes = +50 bonus points
Score Display:
Real-time score counter during gameplay
Visual celebration for milestones (every 10 pancakes)
Personal best indicator on screen
7.2 Progression and Unlocks
Initial Release (No Monetization):
All decoration items unlocked from start
Focus on beating personal high scores
Local leaderboard (personal best history)
Optional Future Progression:
Unlock new pancake types (blueberry, chocolate chip) through achievements
Unlock decoration colors/styles by reaching score milestones
Daily challenges for variety
8. Menu Flow and UX
8.1 Screen Hierarchy

Splash Screen
    ↓
Home / Main Menu
    ├── Play (Classic Stack Mode)
    ├── Decorate Mode
    ├── High Scores
    ├── Settings
    └── (Future: Shop, Challenges)
8.2 Home / Main Menu
Layout:
Large, playful logo at top
Two primary buttons (large, tap-friendly):
"PLAY" - Launches Classic Stack Mode
"DECORATE" - Launches Decorate Mode
Smaller buttons below:
High Scores icon
Settings icon
(Future: Daily Challenge icon)
Visual Design:
Cozy kitchen/diner background
Animated elements (steam rising, syrup drip)
Personal best score prominently displayed
Soft background music
8.3 Classic Stack Mode Flow
Player taps "PLAY"
Brief transition animation (0.5s)
Gameplay begins immediately (no countdown)
On collapse → Game Over screen:
Final score displayed large
"New High Score!" celebration if applicable
Two buttons: "REPLAY" and "HOME"
Optional: Share score button (future)
8.4 Decorate Mode Flow
Player taps "DECORATE"
Transition to decoration workspace
Single pancake displayed on plate (center screen)
Decoration tool palette at bottom:
Sprinkles button
Whipped cream button
Maple syrup button
Player decorates freely (no time limit)
Top bar:
"DONE" button → Save screenshot / return to menu
"CLEAR" button → Reset decorations
(Future: Save to gallery)
8.5 Settings Menu
Options:
Controls: Toggle between Tap-to-Drop / Drag-and-Drop
Sound: Master volume slider
Music: Toggle background music on/off
SFX: Toggle sound effects on/off
Haptics: Toggle vibration feedback (iOS/Android)
Credits: Development team
Privacy Policy / Terms of Service
9. Decoration System and Animations
9.1 Decoration Tools
Sprinkles
Application: Tap or drag to scatter sprinkles
Animation:
Sprinkles fall from touch point with slight randomization
Gentle bounce on landing
Settle into position (0.3s animation)
Each sprinkle has slight rotation variance
Visual: Colorful (rainbow mix), small circular/rod shapes
Sound: Light "tink tink tink" as they land
Whipped Cream
Application: Drag to create swirl pattern
Animation:
Cream extrudes from nozzle following finger path
Smooth, fluffy texture with slight jiggle physics
Builds up in 3D-looking mounds
Settles with subtle bounce (0.4s)
Visual: White/off-white, glossy texture, peaked swirls
Sound: Soft "pshhhhh" aerosol sound while applying
Maple Syrup
Application: Hold and drag to pour
Animation:
Syrup streams from bottle following finger position
Liquid physics simulation (flowing, pooling)
Spreads slowly across pancake surface
Drips over edges realistically
Settles and glistens (0.5s)
Visual: Amber/golden color, glossy, semi-transparent
Sound: Satisfying "glug glug" pouring sound, pitch varies with pour speed
9.2 Animation Quality Targets
Framerate: All decoration animations at 60 FPS
Particle counts:
Sprinkles: Up to 100 individual particles
Cream: Smooth spline-based rendering
Syrup: Fluid simulation with 30-50 sample points
Physics feel: Slightly exaggerated for satisfaction, not fully realistic
Responsiveness: Zero perceived input lag
9.3 Decoration Interaction Rules (Initial Release)
Decorations are purely visual in Classic Stack Mode
Decorations do not affect physics (weight, friction, stability)
Players can apply decorations in any order and quantity
Decorations layer naturally (syrup pools, cream sits on top, sprinkles on surface)
(Future consideration: Syrup adds slight stickiness, cream adds weight)
10. Visual Style
10.1 Art Direction
Overall Aesthetic:
Cute, cozy, and inviting
Warm color palette (yellows, golds, browns, with colorful accents)
Soft lighting and shadows
Slightly stylized realism (not cartoony, not photorealistic)
Food should look delicious and appealing
Pancake Design:
Golden-brown with slight texture variation
Soft, fluffy appearance
Subtle butter pat on top (optional visual detail)
Light steam particles on fresh pancakes
Environment:
Kitchen/diner setting implied in backgrounds
Wooden table or countertop surface
Warm indoor lighting
Subtle background details (blurred kitchen items)
10.2 UI/UX Design
Typography:
Friendly, rounded sans-serif font
High contrast for readability
Large, tap-friendly buttons (minimum 44x44pt)
Color Scheme:
Primary: Warm gold (#FFD166)
Secondary: Rich brown (#8B4513)
Accent: Berry red (#C1121F) for important CTAs
Background: Soft cream (#FFF8E7)
Icons and Buttons:
Clear, recognizable iconography
Generous padding and spacing
Hover/press states with scale animation (0.95x on press)
10.3 Effects and Polish
Particle effects: Steam, flour puffs on collapse, celebration confetti for high scores
Screen shake: Subtle shake on pancake impact, stronger on collapse
Transitions: Smooth fade/slide animations between screens (0.3-0.5s)
Highlights: Glow effects for perfect placements
11. Audio Design
11.1 Sound Effects (SFX)
Gameplay Sounds:
Pancake drop: Soft "flump" or "floof" sound (pitch varies by impact force)
Perfect placement: Satisfying "ding" or chime
Stack wobble: Creaking/wobbling sound (intensity tied to physics)
Collapse: Cascading tumble sounds, comedic "crash"
Pancake bounce: Soft bouncy impacts
Decoration Sounds:
Sprinkles: Light tinkling, multiple pitches
Whipped cream: Aerosol "pshhh" with slight whoosh
Syrup pour: Rich, viscous "glug glug" sound
Application feedback: Subtle audio confirmation per decoration action
UI Sounds:
Button press: Gentle "pop" or "tap"
Menu transition: Soft whoosh
High score: Triumphant jingle (2-3 seconds)
Game over: Gentle "aww" sound or descending notes
11.2 Music
Main Menu Music:
Cozy, upbeat background track
Acoustic instrumentation (guitar, light percussion)
Loop length: 60-90 seconds
Low-moderate tempo (90-110 BPM)
Non-intrusive, can loop indefinitely
Gameplay Music:
Option 1: Same as menu music (consistency)
Option 2: Stripped-down version (less distracting)
Should not overwhelm SFX
Optional: Music tempo increases slightly as stack grows (tension building)
Decorate Mode Music:
Calm, creative ambiance
Slower tempo than gameplay
Optional: No music, just ambient sounds
11.3 Audio Settings
Independent volume controls for Music and SFX
Mute toggle for each
Audio continues in background (option in settings)
Haptic feedback synchronized with key audio events (optional)
12. Fail States and Replayability
12.1 Fail State: Stack Collapse
Trigger Conditions:
Center of mass exceeds critical angle
Pancakes slide completely off the stack
Tipping momentum becomes irreversible
Fail State Presentation:
0.0-0.5s: Slow-motion effect as collapse begins
0.5-2.0s: Full-speed physics simulation of tumbling pancakes
2.0s: Screen shake and collapse SFX
2.5s: Game Over screen fades in
Game Over Screen:
Final score (large, centered)
Personal best indicator ("New Record!" or "Best: XX")
Pancake count ("You stacked XX pancakes!")
Two clear CTAs: "PLAY AGAIN" and "HOME"
No Punishment:
No lives system
No energy/timer mechanics
Instant retry available
Encourage experimentation and repeated attempts
12.2 Replayability Hooks
Core Loop Replayability:
"Just one more try" addictiveness
Chasing personal high scores
Physics variability (no two games identical)
Quick session length encourages multiple attempts
Progression Hooks (Future):
Daily challenges with specific goals
Unlockable pancake variants
Achievement system (e.g., "Stack 50 pancakes," "Get 10 perfect placements")
Seasonal events (holiday-themed pancakes)
Social Hooks (Future):
Shareable high score screenshots
Friend leaderboards
Challenge friends to beat your score
13. Monetization (Optional - Cosmetic Only)
Monetization Philosophy:
No pay-to-win mechanics
No gameplay-affecting purchases
No intrusive ads during gameplay
Family-friendly, ethical monetization
13.1 Potential Revenue Streams
Option 1: Premium (Paid App)
One-time purchase ($2.99-$4.99)
All content unlocked
No ads, no IAP
Option 2: Free-to-Play with Cosmetic IAP
Free base game with all gameplay modes
Optional cosmetic purchases:
Pancake skins (blueberry, chocolate chip, rainbow)
Plate designs
Background themes (kitchen, diner, outdoor picnic)
Decoration tool variants (colored syrups, shaped sprinkles, flavored creams)
Particle effect trails
"Remove Ads" IAP (if ads are present)
Option 3: Hybrid Model
Free demo (limited to score threshold or game sessions)
One-time unlock for full game
13.2 Ad Integration (If Free-to-Play)
Ad Placement Rules:
Never during gameplay (breaks flow and immersion)
Optional rewarded ads:
"Continue" option after collapse (watch ad for one extra pancake)
Double score reward (watch ad to double last game's score)
Unlock decoration item early
Banner ads: Only on main menu (non-intrusive)
Frequency caps: Max one rewarded ad per 5 minutes
Ad-Free Option:
Single IAP to remove all ads permanently
14. Technical Considerations
14.1 Physics Engine
Recommended Engine:
Unity: Use Box2D or built-in 2D physics (if 2D approach)
Unity 3D Physics: For enhanced visual depth with 3D pancakes in 2.5D perspective
Alternative: Custom lightweight physics for maximum optimization
Physics Requirements:
Real-time rigid body simulation
Collision detection (pancake-to-pancake, pancake-to-surface)
Center-of-mass calculation for stability
Stable simulation at 60 FPS on mid-range devices
Optimization:
Limit active physics objects (e.g., despawn pancakes far from stack)
Simplified collision shapes (circles/cylinders, not complex meshes)
Physics time step tuning for performance
14.2 Animation System
Animation Approaches:
Procedural animations: Wobble, bounce, squash-and-stretch
Particle systems: Sprinkles, steam, celebration effects
Shader effects: Syrup flow, whipped cream rendering
Tweening library: For UI animations (e.g., DOTween in Unity)
Performance Targets:
All animations must maintain 60 FPS on target devices
Particle effects with dynamic LOD (fewer particles on lower-end devices)
14.3 Rendering and Graphics
Graphics Pipeline:
2D sprites with layering (simplest, best performance)
2.5D approach (3D objects, fixed camera angle) for added depth
Mobile-optimized shaders (avoid expensive effects)
Resolution Support:
Adaptive UI for various screen aspect ratios (18:9, 19.5:9, 4:3 tablets)
Texture atlasing for efficient memory usage
Compressed textures (ASTC for Android, PVRTC for iOS)
14.4 Data and Persistence
Local Storage:
High scores stored locally (PlayerPrefs or equivalent)
Settings preferences
Unlock states (if progression system implemented)
Cloud Save (Future):
Optional cloud sync for cross-device progression
Requires user account system
14.5 Build and Testing
Performance Benchmarks:
Smooth 60 FPS on iPhone X / Samsung Galaxy S9 equivalent and newer
Acceptable 30 FPS on older devices (iPhone 7 / Galaxy S7)
Battery usage: Moderate (comparable to casual puzzle games)
Device Testing Matrix:
iOS: iPhone SE (2020), iPhone 12, iPhone 15, iPad Air
Android: Samsung Galaxy S10, Google Pixel 5, OnePlus 9, budget device (e.g., Moto G)
Testing Focus Areas:
Physics consistency across devices
Touch input responsiveness
Audio synchronization
Memory leaks during extended play
Edge case physics (extreme wobbles, rapid drops)
15. Future Feature Ideas
15.1 Gameplay Enhancements
Power-Ups (Mid-Priority):
Sticky Syrup: Next 3 pancakes bond slightly, reducing wobble
Perfect Placement Guide: Visual indicator for center alignment (limited uses)
Slow-Mo Drop: Briefly slows time for precision placement
Safety Net: Prevents one collapse (single-use per game)
Special Pancakes (High-Priority):
Blueberry Pancakes: Smaller diameter, lighter weight
Chocolate Chip Pancakes: Standard size, slightly heavier
Silver Dollar Pancakes: Tiny, used for gap-filling
Crepe: Wide and flat, more stable base
Burnt Pancake: Irregular shape, challenge pancake
Challenge Modes (Mid-Priority):
Time Attack: Stack as many as possible in 60 seconds
Limited Pancakes: Achieve high score with only 20 pancakes
No Wobble: Ultra-precise mode, one wobble = game over
Random Sizes: Pancakes vary in diameter each drop
15.2 Creative and Social Features
Screenshot/Share (High-Priority):
Capture decorated pancake and share to social media
Auto-generated share message: "I stacked XX pancakes! Can you beat me?"
Pancake Gallery (Low-Priority):
Save decorated pancakes to personal collection
Browse and admire past creations
Multiplayer Concepts (Low-Priority):
Async Turn-Based: Players alternate drops on same stack
Race Mode: Side-by-side stacking, first to collapse loses
Co-op Stack: Two players work together on one massive stack
15.3 Progression and Meta-Game
Achievement System (Mid-Priority):
"First Stack" - Complete first game
"Breakfast Champion" - Stack 50 pancakes in one game
"Perfectionist" - Get 10 perfect placements in a row
"Decorator" - Use all decoration tools
Daily Challenges (Mid-Priority):
Rotating objectives (e.g., "Stack 30 pancakes with only blueberry")
Rewards: Unlock decoration colors or pancake types
Seasonal Events (Low-Priority):
Holiday-themed pancakes (heart-shaped for Valentine's, pumpkin for Halloween)
Special decorations (candy canes, autumn leaves)
15.4 Technical and Quality-of-Life
Replay System (Low-Priority):
Watch replay of your best stack
Share replay video
Accessibility (High-Priority):
Colorblind mode (adjust UI colors)
Adjustable game speed for players with motor difficulties
High-contrast mode
Localization (Mid-Priority):
Support for 10+ languages
Cultural variants (e.g., "Hotcake" for some regions)
16. Success Metrics and KPIs
16.1 Launch Goals (First 3 Months)
Acquisition:
100K downloads (if free)
4.0+ star rating on App Store and Google Play
Engagement:
Average session length: 3-5 minutes
Sessions per user per day: 2-3
Day 1 retention: 40%+
Day 7 retention: 20%+
Monetization (If Applicable):
Ad revenue per DAU: $0.05-$0.10
IAP conversion rate: 2-5%
16.2 Key Performance Indicators
Player Behavior:
Average pancakes stacked per session
Percentage of players reaching Decorate Mode
Most popular decoration tool
High score distribution
Technical Performance:
Crash rate: <1%
Average FPS on target devices
Load time: <3 seconds
17. Development Roadmap (Suggested)
Phase 1: Core Prototype (4-6 weeks)
Basic physics-based stacking mechanics
Tap-to-drop controls
Simple scoring system
Placeholder art and audio
Milestone: Playable core loop
Phase 2: Full Gameplay (6-8 weeks)
Polish physics (wobble, collapse feel)
Implement Drag-and-Drop controls
Complete visual art pass (pancakes, environment)
Integrate audio (SFX, music)
Menu flow and UX
Milestone: Classic Stack Mode complete
Phase 3: Decoration Mode (4-6 weeks)
Decorate Mode UI and workspace
Sprinkles system (animation, physics)
Whipped cream system
Maple syrup system
Save/screenshot functionality
Milestone: Decoration Mode complete
Phase 4: Polish and Testing (4-6 weeks)
Bug fixing and optimization
Device testing across range
Juice and polish (particles, screen shake, transitions)
Accessibility features
Localization (if applicable)
Milestone: Release Candidate
Phase 5: Launch Prep (2-3 weeks)
App store assets (screenshots, video, description)
Marketing materials
Soft launch (limited region)
Final bug fixes based on soft launch
Milestone: Global launch
Post-Launch: Live Ops
Monitor analytics and player feedback
Hotfix critical issues
Plan content updates (seasonal events, new pancake types)
Implement high-priority future features
18. Risks and Mitigation
Risk	Impact	Mitigation Strategy
Physics feel not satisfying	High	Early prototyping, extensive playtesting, iterate on parameters
Performance issues on older devices	Medium	Aggressive optimization, LOD systems, minimum spec cutoff
Gameplay too simple/repetitive	High	Implement variety (special pancakes, challenge modes), focus on "feel"
Decoration mode underutilized	Medium	Tutorial prompts, integrate with progression, shareable screenshots
Monetization negatively impacts UX	Medium	Ethical design, no pay-to-win, skip ads if hurts retention
Scope creep delays launch	High	Strict MVP definition, future features post-launch only
19. Appendix
19.1 Competitive Analysis
Similar Games:
Stack (Ketchapp): Minimal stacking, different mechanic (block cutting)
Pancake Tower (Various): Direct competitor, simpler physics
Tower Bloxx: Classic stacking with building theme
Jelly Tower: Physics-based, wobbly stacking
Differentiation:
More realistic, satisfying physics simulation
Charming food theme with decoration creativity
Balanced difficulty (not frustratingly hard)
Cozy, stress-free aesthetic
19.2 Glossary
Physics Object: In-game entity governed by physics simulation (mass, gravity, collision)
Center of Mass: Calculated balance point of the pancake stack
Wobble Threshold: Angle at which stack begins visible instability
Perfect Placement: Pancake dropped within small radius of exact center
Combo Multiplier: Score bonus for consecutive successful actions
19.3 References and Inspiration
Physics feel: Getting Over It with Bennett Foddy, Human: Fall Flat
Visual style: Good Pizza Great Pizza, Overcooked
Audio design: Little Inferno, Monument Valley
Decoration mechanics: Cake Mania, Cooking Mama
End of Document
This PRD is a living document and will be updated as the project evolves. For questions or clarifications, contact the product team.