"""Generate a lift-vs-velocity plot for a representative wing."""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from src.lift_calculator import calculate_lift

rho = 1.225
wing_area = 16.2
cl = 0.8
velocities = np.linspace(10, 90, 200)
lifts = [calculate_lift(rho, float(v), wing_area, cl).lift_n for v in velocities]

output_dir = Path("results")
output_dir.mkdir(exist_ok=True)
output_file = output_dir / "lift_vs_velocity.png"

plt.figure(figsize=(8, 5))
plt.plot(velocities, lifts)
plt.xlabel("Velocity (m/s)")
plt.ylabel("Lift (N)")
plt.title("Lift vs Velocity")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(output_file, dpi=160)
print(f"Saved {output_file}")
