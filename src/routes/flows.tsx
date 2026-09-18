import { createFileRoute } from '@tanstack/react-router'
import { FlowEditor } from '../flows/FlowEditor'

export const Route = createFileRoute('/flows')({ component: FlowEditor })
