import math

import pytest

from src.lift_calculator import analyze_lift, calculate_lift


def test_zero_velocity_gives_zero_lift():
    result = calculate_lift(1.225, 0.0, 16.2, 0.8)
    assert result.lift_n == 0.0


def test_known_case():
    result = calculate_lift(1.225, 50.0, 16.2, 0.8)
    expected = 0.5 * 1.225 * 50.0**2 * 16.2 * 0.8
    assert math.isclose(result.lift_n, expected, rel_tol=1e-12)


def test_negative_density_rejected():
    with pytest.raises(ValueError):
        calculate_lift(-1.0, 50.0, 16.2, 0.8)


def test_negative_velocity_rejected():
    with pytest.raises(ValueError):
        calculate_lift(1.225, -1.0, 16.2, 0.8)


def test_nonpositive_area_rejected():
    with pytest.raises(ValueError):
        calculate_lift(1.225, 50.0, 0.0, 0.8)


def test_explanation_uses_calculated_result():
    result = calculate_lift(1.225, 50.0, 16.2, 0.8)
    analysis = analyze_lift(1.225, 50.0, 16.2, 0.8, result)
    assert analysis.equation == "L = 0.5 * rho * V^2 * S * CL"
    assert "1,531.25 Pa" in analysis.dynamic_pressure_step
    assert "19,845.00 N" in analysis.lift_step


def test_explanation_handles_negative_lift_coefficient():
    analysis = analyze_lift(1.225, 50.0, 16.2, -0.2)
    assert any("negative lift coefficient" in item for item in analysis.interpretation)
