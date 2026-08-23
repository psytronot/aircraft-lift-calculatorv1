"""CLI for the aircraft lift calculator."""
from src.lift_calculator import calculate_lift


def main() -> None:
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


if __name__ == "__main__":
    main()
