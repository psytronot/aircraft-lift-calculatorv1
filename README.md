# Aircraft Lift Calculator

A compact Python engineering tool for calculating aircraft wing lift from the standard aerodynamic lift equation and explaining the calculation with deterministic engineering reasoning.

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
- Automated tests with analytical and boundary cases
- Lift-vs-velocity visualization
- `--explain` mode that shows the calculation chain and interprets variable relationships

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

## Explain the calculation

```bash
python main.py --explain
```

The explain mode is deterministic: it derives its statements from the governing equation and supplied inputs. It does not use an AI model to invent physical conclusions.

Example interpretation:

```text
Engineering interpretation
-------------------------
Model: L = 0.5 * rho * V^2 * S * CL
Step 1: q = 0.5 * 1.225 * 50^2 = 1,531.25 Pa
Step 2: L = 1,531.25 * 16.2 * 0.8 = 19,845.00 N

What the result means:
- Lift scales with air density (rho), wing area (S), and lift coefficient (CL).
- Lift scales with the square of airspeed (V), so speed is the non-linear term.
- A 10% increase in airspeed would increase lift by about 21% if the other inputs stayed constant.
- A 10% increase in density, wing area, or CL would increase lift by 10% if the other inputs stayed constant.
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
│   ├── __init__.py
│   └── lift_calculator.py
├── tests/
│   └── test_lift_calculator.py
├── results/
├── main.py
├── requirements.txt
├── LICENSE
└── README.md
```

## Validation philosophy

The project treats the physics model as the source of truth and uses software tests to verify implementation behavior.

For example, if velocity doubles while $\rho$, $S$, and $C_L$ remain constant:

$$
\frac{L_2}{L_1} = \left(\frac{V_2}{V_1}\right)^2 = 4
$$

The automated suite also checks zero velocity, a known analytical case, and invalid inputs. Manual CLI tests can be used to verify proportional relationships with one variable changed at a time.

## Assumptions and limitations

This is a first-order aerodynamic model. It does not calculate $C_L$ from airfoil geometry, angle of attack, Reynolds number, Mach number, or a CFD/LLT solution. Compressibility, stall behavior, ground effect, induced effects, and unsteady aerodynamics are outside the current scope.

The explain mode is intentionally deterministic. It provides model-based interpretation rather than pretending to perform full aircraft performance analysis or autonomous engineering judgement.

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
