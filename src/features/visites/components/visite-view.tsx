'use client'

import { Visite } from "@/model/visite/Visite"





interface Props {
  currentRow: Visite,
  showContact?: boolean

}

export function VisiteView({ currentRow, showContact = true }: Props) {
  if (!currentRow) {
    return null
  }

  /*const { visites, loading: isLoading, error } = useVisiteService({where : {id :{equals:visiteId} }});
  //const { setOpen, setCurrentRow } = useVisites()
  const currentRow: Visite | undefined = visites.length > 0 ? visites[0] : undefined;*/


  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

    </div>

  )
}

