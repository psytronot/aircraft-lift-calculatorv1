"""CLI for the aircraft lift calculator."""
import argparse

from src.lift_calculator import analyze_lift, calculate_lift


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Calculate aircraft wing lift from SI inputs.")
    parser.add_argument("--explain", action="store_true", help="Show the engineering calculation and interpretation.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    print("Aircraft Lift Calculator")
    print("SI units: density kg/m^3, velocity m/s, wing area m^2")
    rho = float(input("Air density [kg/m^3] (default 1.225): ") or 1.225)
    velocity = float(input("Velocity [m/s]: "))
    area = float(input("Wing area [m^2]: "))
    cl = float(input("Lift coefficient CL: "))

    result = calculate_lift(rho, velocity, area, cl)
    print(f"\nDynamic pressure: {result.dynamic_pressure_pa:,.2f} Pa")
    print(f"Lift:             {result.lift_n:,.2f} N")
    print(f"Lift:             {result.lift_kgf:,.2f} kgf")

    if args.explain:
        analysis = analyze_lift(rho, velocity, area, cl, result)
        print("\nEngineering interpretation")
        print("-------------------------")
        print(f"Model: {analysis.equation}")
        print(f"Step 1: {analysis.dynamic_pressure_step}")
        print(f"Step 2: {analysis.lift_step}")
        print("\nWhat the result means:")
        for item in analysis.interpretation:
            print(f"- {item}")
        print("\nAssumptions:")
        for item in analysis.assumptions:
            print(f"- {item}")


if __name__ == "__main__":
    main()
