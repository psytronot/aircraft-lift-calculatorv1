"""Generate a lift-vs-velocity plot for a representative wing."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import numpy as np
import matplotlib.pyplot as plt

from src.lift_calculator import calculate_lift

rho = 1.225
wing_area = 16.2
cl = 0.8
velocities = np.linspace(10, 90, 200)
lifts = [calculate_lift(rho, float(v), wing_area, cl).lift_n for v in velocities]

Path("results").mkdir(exist_ok=True)
plt.figure(figsize=(8, 5))
plt.plot(velocities, lifts)
plt.xlabel("Velocity (m/s)")
plt.ylabel("Lift (N)")
plt.title("Lift vs Velocity")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("results/lift_vs_velocity.png", dpi=160)
print("Saved results/lift_vs_velocity.png")
