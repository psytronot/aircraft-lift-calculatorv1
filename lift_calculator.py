"""Aircraft lift calculations using the standard aerodynamic lift equation."""
from dataclasses import dataclass
import math


@dataclass(frozen=True)
class LiftResult:
    dynamic_pressure_pa: float
    lift_n: float
    lift_kgf: float


def validate_inputs(rho: float, velocity_ms: float, wing_area_m2: float, cl: float) -> None:
    if rho <= 0:
        raise ValueError("Air density must be positive.")
    if velocity_ms < 0:
        raise ValueError("Velocity cannot be negative.")
    if wing_area_m2 <= 0:
        raise ValueError("Wing area must be positive.")
    if not math.isfinite(cl):
        raise ValueError("Lift coefficient must be finite.")


def calculate_lift(rho: float, velocity_ms: float, wing_area_m2: float, cl: float) -> LiftResult:
    """Return dynamic pressure and lift for SI inputs.

    Equation: L = 0.5 * rho * V^2 * S * CL
    """
    validate_inputs(rho, velocity_ms, wing_area_m2, cl)
    q = 0.5 * rho * velocity_ms**2
    lift_n = q * wing_area_m2 * cl
    return LiftResult(
        dynamic_pressure_pa=q,
        lift_n=lift_n,
        lift_kgf=lift_n / 9.80665,
    )
