import { usePuck } from '@puckeditor/core'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'

const ROOT_ZONE = 'root:default-zone'

/** Botão "Adicionar Novo Bloco": insere uma seção em branco no fim da página com um clique, sem precisar arrastar. */
export function AddBlockButton() {
  const { dispatch, appState } = usePuck()

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      title="Adicionar novo bloco"
      onClick={() =>
        dispatch({
          type: 'insert',
          componentType: 'Container',
          destinationIndex: appState.data.content.length,
          destinationZone: ROOT_ZONE,
        })
      }
    >
      <Plus size={16} />
      <span className="hidden md:inline">Adicionar novo bloco</span>
    </Button>
  )
}
