"""Aircraft lift calculations and deterministic engineering interpretation."""
from dataclasses import dataclass
import math


@dataclass(frozen=True)
class LiftResult:
    dynamic_pressure_pa: float
    lift_n: float
    lift_kgf: float


@dataclass(frozen=True)
class LiftAnalysis:
    """Human-readable interpretation of a lift calculation."""

    equation: str
    dynamic_pressure_step: str
    lift_step: str
    interpretation: tuple[str, ...]
    assumptions: tuple[str, ...]


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


def analyze_lift(
    rho: float, velocity_ms: float, wing_area_m2: float, cl: float, result: LiftResult | None = None
) -> LiftAnalysis:
    """Explain what the lift model is doing without pretending to be an AI solver.

    The interpretation is deterministic and follows directly from the governing
    equation and the supplied inputs.
    """
    validate_inputs(rho, velocity_ms, wing_area_m2, cl)
    if result is None:
        result = calculate_lift(rho, velocity_ms, wing_area_m2, cl)

    interpretation = (
        "Lift scales with air density (rho), wing area (S), and lift coefficient (CL).",
        "Lift scales with the square of airspeed (V), so speed is the non-linear term.",
        "A 10% increase in airspeed would increase lift by about 21% if the other inputs stayed constant.",
        "A 10% increase in density, wing area, or CL would increase lift by 10% if the other inputs stayed constant.",
    )

    if cl == 0:
        interpretation += ("The supplied lift coefficient is zero, so the model predicts zero lift.",)
    elif cl < 0:
        interpretation += ("The negative lift coefficient makes the calculated lift negative, indicating force opposite to the positive lift direction.",)

    assumptions = (
        "CL is supplied as an input rather than derived from airfoil geometry or CFD.",
        "The standard algebraic lift equation is treated as the governing model for this first-order tool.",
        "The result does not by itself determine whether a real aircraft is in steady level flight.",
    )

    return LiftAnalysis(
        equation="L = 0.5 * rho * V^2 * S * CL",
        dynamic_pressure_step=(
            f"q = 0.5 * {rho:.6g} * {velocity_ms:.6g}^2 = {result.dynamic_pressure_pa:,.2f} Pa"
        ),
        lift_step=(
            f"L = {result.dynamic_pressure_pa:,.2f} * {wing_area_m2:.6g} * {cl:.6g} "
            f"= {result.lift_n:,.2f} N"
        ),
        interpretation=interpretation,
        assumptions=assumptions,
    )
