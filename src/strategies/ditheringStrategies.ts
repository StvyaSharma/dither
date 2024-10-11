// strategies/ditheringStrategies.ts

import { DitheringStrategy } from "../types/dithering";
import { AdditiveNoiseDitheringStrategy } from "./AdditiveNoiseDithering";
import { AMHalftoningStrategy } from "./AMHalftoning";
import { AtkinsonDitheringStrategy } from "./AtkinsonDithering";
import { BayerMatrixDitheringStrategy } from "./BayerMatrixDithering";
import { BurkesDitheringStrategy } from "./BurkesDithering";
import { CheckerboardDitheringStrategy } from "./CheckerboardDithering";
import { ClusteredDotOrderedDitheringStrategy } from "./ClusteredDotOrderedDithering";
import { DispersedDotOrderedDitheringStrategy } from "./DispersedDotOrderedDithering";
import { DotDiffusionDitheringStrategy } from "./DotDiffusionDithering";
import { ElectrostaticHalftoningStrategy } from "./ElectrostaticHalftoning";
import { FloydSteinbergDitheringStrategy } from "./FloydSteinbergDithering";
import { FMHalftoningStrategy } from "./FMHalftoning";
import { GradientBasedDitheringStrategy } from "./GradientBasedDithering";
import { JJNDitheringStrategy } from "./JJNDithering";
import { LatticeBoltzmannDitheringStrategy } from "./LatticeBoltzmannDithering";
import { ShiauFanDitheringStrategy } from "./ShiauFanDitheringStrategy";
import {
  Sierra2DitheringStrategy,
  Sierra3DitheringStrategy,
  SierraLiteDitheringStrategy,
} from "./SierraDithering";
import { StochasticScreeningDitheringStrategy } from "./StochasticScreeningDithering";
import { StuckiDitheringStrategy } from "./StuckiDitheringStrategy";
import { WhiteNoiseDitheringStrategy } from "./WhiteNoiseDithering";

export const ditheringStrategies: DitheringStrategy[] = [
  AtkinsonDitheringStrategy,
  FloydSteinbergDitheringStrategy,
  AMHalftoningStrategy,
  FMHalftoningStrategy,
  DotDiffusionDitheringStrategy,
  CheckerboardDitheringStrategy,
  AdditiveNoiseDitheringStrategy,
  WhiteNoiseDitheringStrategy,
  JJNDitheringStrategy,
  BayerMatrixDitheringStrategy,
  ClusteredDotOrderedDitheringStrategy,
  ShiauFanDitheringStrategy,
  Sierra3DitheringStrategy,
  Sierra2DitheringStrategy,
  SierraLiteDitheringStrategy,
  BurkesDitheringStrategy,
  LatticeBoltzmannDitheringStrategy,
  ElectrostaticHalftoningStrategy,
  GradientBasedDitheringStrategy,
  StuckiDitheringStrategy,
  DispersedDotOrderedDitheringStrategy,
  StochasticScreeningDitheringStrategy,
];
