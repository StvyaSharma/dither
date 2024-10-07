// strategies/ditheringStrategies.ts

import {  DitheringStrategy } from '../types/dithering';
import { AdditiveNoiseDitheringStrategy } from './AdditiveNoiseDithering';
import { AMHalftoningStrategy } from './AMHalftoning';
import { AtkinsonDitheringStrategy } from './AtkinsonDithering';
import { BayerMatrixDitheringStrategy } from './BayerMatrixDithering';
import { CheckerboardDitheringStrategy } from './CheckerboardDithering';
import { ClusteredDotOrderedDitheringStrategy } from './ClusteredDotOrderedDithering';
import { DotDiffusionDitheringStrategy } from './DotDiffusionDithering';
import { FloydSteinbergDitheringStrategy } from './FloydSteinbergDithering';
import { FMHalftoningStrategy } from './FMHalftoning';
import { JJNDitheringStrategy } from './JJNDithering';
import { WhiteNoiseDitheringStrategy } from './WhiteNoiseDithering';
// import { VoidAndClusterDitheringStrategy } from './VoidAndClusterDithering';



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
ClusteredDotOrderedDitheringStrategy
];