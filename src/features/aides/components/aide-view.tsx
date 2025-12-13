'use client'


import { Aide } from '@/model/aide/Aide'


interface Props {
  currentRow: Aide,
  showContact?: boolean

}

export function AideView({ currentRow, showContact = true }: Props) {
  if (!currentRow) {
    return null
  }

  /*const { aides, loading: isLoading, error } = useAideService({where : {id :{equals:aideId} }});
  //const { setOpen, setCurrentRow } = useAides()
  const currentRow: Aide | undefined = aides.length > 0 ? aides[0] : undefined;*/


  return (

    <div className="sm:min-w-full grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 md:grid-cols-1 gap-6 mt-6">

    </div>

  )
}

