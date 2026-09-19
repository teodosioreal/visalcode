import { createFileRoute } from '@tanstack/react-router'
import { PublicFlowRunner } from '../flows/PublicFlowRunner'

export const Route = createFileRoute('/formulario')({ component: PublicFlowRunner })
