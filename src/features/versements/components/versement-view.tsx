'use client'


import { Versement } from "@/model/versement/versement"


interface Props {
  currentRow: Versement,
  showContact?: boolean

}

export function VersementView({ currentRow, showContact = true }: Props) {
  if (!currentRow) {
    return null
  }

  /*const { versements, loading: isLoading, error } = useVersementService({where : {id :{equals:versementId} }});
  //const { setOpen, setCurrentRow } = useVersements()
  const currentRow: Versement | undefined = versements.length > 0 ? versements[0] : undefined;*/


  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

    </div>

  )
}

