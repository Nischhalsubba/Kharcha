import React from 'react';
import { FigmaReferenceLabel } from './AppPrimitives';

export default function DesignReferenceLabel({name}) {
  return <FigmaReferenceLabel>{name}</FigmaReferenceLabel>;
}

export const FIGMA_REFERENCE_LABELS = [
  'Spending',
  'Transaction Record',
  'Breakdown & budget',
  'Reports',
  'Repeated transaction',
  'Creating a Budget',
];
