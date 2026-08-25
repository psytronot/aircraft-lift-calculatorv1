# Flight Lab — Release QA Checklist

## Gate 1 — Physics
- [x] Dynamic pressure regression
- [x] Lift/drag regression
- [x] Reynolds/Mach regression
- [x] Stall-model regression
- [x] Polar sweep regression
- [x] Zero-speed edge case
- [x] Invalid/NaN/Infinity input rejection
- [x] Velocity-squared scaling
- [x] Area scaling
- [ ] Reference-data validation for a condition-matched NACA 0012 dataset

## Gate 2 — Geometry
- [x] All 18 library geometries enumerated
- [x] Area/volume regression matrix
- [x] Projected/reference-area checks
- [x] Axis vs face flow checks
- [x] Finite-output checks
- [x] Zero/negative source-dimension safety check
- [ ] Automated renderer vertex/bounding-box dimension checks for every geometry

## Gate 3 — Physics/Geometry Integration
- [x] Single GeometryState drives calculations and renderer
- [x] Family selection updates active geometry
- [x] Geometry selection updates reference area
- [ ] Automated change-propagation assertions for every geometry parameter

## Gate 4 — Flow / 3D
- [x] Flow-direction state wired into renderer
- [x] Renderer orientation contract tests
- [x] Qualitative airflow/wake visualization
- [ ] Browser visual verification at desktop viewport
- [ ] Browser visual verification at mobile viewport
- [ ] Screenshot mismatch review
- [ ] Long-run animation stability check

## Gate 5 — UI / Student Workflow
- [x] Navigation controls implemented
- [x] Geometry family selection
- [x] Shape selection
- [x] Manual dimensions
- [x] Analytical/measured coefficient mode
- [x] Wind direction controls
- [x] Performance section
- [x] Stall section
- [x] Validation/About section
- [ ] Browser interaction suite green
- [ ] Keyboard-only workflow review
- [ ] Screen-reader/ARIA review

## Gate 6 — Security / Performance / Reliability
- [x] Dependency audit gate added to CI
- [ ] Production runtime error check
- [ ] WebGL failure/fallback behavior
- [ ] Memory/animation performance check
- [ ] Large-input stress test
- [ ] Responsive layout stress test

## Gate 7 — Deployment
- [ ] Vercel project created/configured
- [ ] Preview deployment succeeds
- [ ] Preview smoke test succeeds
- [ ] Production build succeeds
- [ ] Production deployment succeeds
- [ ] Production runtime errors checked
- [ ] Final release tag/checklist

## Release rule
Do not merge or publish production while any unchecked release-gate item is required for the intended claim. Analytical/model outputs must not be represented as experimentally validated results until a traceable, condition-matched reference dataset is loaded and compared.
