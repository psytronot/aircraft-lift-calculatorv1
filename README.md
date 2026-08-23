# Aircraft Lift Calculator

A compact Python engineering tool for calculating aircraft wing lift from the standard aerodynamic lift equation.

## Engineering model

The calculator uses:

$$
L = \frac{1}{2}\rho V^2 S C_L
$$

where:

- $L$ = lift force (N)
- $\rho$ = air density (kg/m³)
- $V$ = true airspeed relative to the air (m/s)
- $S$ = reference wing area (m²)
- $C_L$ = lift coefficient (dimensionless)

The dynamic pressure is:

$$
q = \frac{1}{2}\rho V^2
$$

and therefore:

$$
L = qSC_L
$$

NASA describes the same standard lift equation and notes that $C_L$ represents effects such as geometry and inclination and is commonly obtained from analysis or experiment. See the references below.

## Features

- SI-unit calculation
- Dynamic-pressure output
- Lift output in newtons and kgf
- Input validation
- Unit tests with a known analytical case
- Optional lift-vs-velocity plot

## Example

For:

- density = 1.225 kg/m³
- velocity = 50 m/s
- wing area = 16.2 m²
- $C_L$ = 0.8

The predicted lift is **19,845 N** (approximately **2,024 kgf**).

## Run

```bash
python main.py
```

## Run tests

```bash
python -m pytest -q
```

## Generate the plot

```bash
python examples/plot_lift.py
```

The plot is written to `results/lift_vs_velocity.png`.

## Project structure

```text
aircraft-lift-calculatorv1/
├── examples/
│   └── plot_lift.py
├── src/
│   └── lift_calculator.py
├── tests/
│   └── test_lift_calculator.py
├── results/
├── main.py
├── requirements.txt
├── LICENSE
└── README.md
```

## Assumptions and limitations

This is a first-order aerodynamic model. It does not calculate $C_L$ from airfoil geometry, angle of attack, Reynolds number, Mach number, or a CFD/LLT solution. Compressibility, stall behavior, ground effect, induced effects, and unsteady aerodynamics are outside the current scope.

## Open-source reference

This project was developed as an independent implementation of the standard lift-equation concept. A useful open-source reference for aircraft performance modelling is [ADRpy](https://github.com/sobester/ADRpy). ADRpy provides a much broader set of aircraft design and performance analysis tools under GPL-3.0; this project does **not** copy its implementation.

A separate public example, [Airfoil-Lift-Generation-Model](https://github.com/murtazahussain-1/Airfoil-Lift-Generation-Model), also discusses lift modelling using the lift equation and is MIT licensed. It is used here only as a learning/reference resource, not as copied source code.

## References

1. NASA Glenn Research Center — [Lift Equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation-2/)
2. NASA Glenn Research Center — [Lift Coefficient](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-coefficient-2/)
3. Sobester, ADRpy — https://github.com/sobester/ADRpy
4. Murtazahussain-1, Airfoil Lift Generation Model — https://github.com/murtazahussain-1/Airfoil-Lift-Generation-Model

## License

MIT
