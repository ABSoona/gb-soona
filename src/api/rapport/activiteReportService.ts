import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import axiosInstance from '@/lib/axtios-instance'

export interface ActivityReportStats {
  moy: number | null
  min: number | null
  max: number | null
}

export interface ActivityReportDepartement {
  departement: string
  recues: number
  acceptees: number
  refusees: number
  backlog: number
}

export interface ActivityReportData {
  debut: string
  fin: string
  demRecues: number
  demAcceptees: number
  demRefusees: number
  demBacklog: number
  visitesProg: number
  aidesCount: number
  aidesMontant: number
  versementsCount: number
  versementsMontant: number
  departements: ActivityReportDepartement[]
  delais: {
    periodeLabel: string
    priseEnCharge: ActivityReportStats
    traitement: ActivityReportStats
  }
}

const toParam = (date: Date) => format(date, 'yyyy-MM-dd')

export function useActivityReportService(from?: Date, to?: Date) {
  const [data, setData] = useState<ActivityReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!from || !to) return
    let cancelled = false
    setLoading(true)
    axiosInstance
      .get('/rapports/activite', { params: { from: toParam(from), to: toParam(to) } })
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.getTime(), to?.getTime()])

  return { data, loading }
}

export async function downloadActivityReportPdf(from: Date, to: Date): Promise<Blob> {
  const response = await axiosInstance.get('/rapports/activite/pdf', {
    params: { from: toParam(from), to: toParam(to) },
    responseType: 'blob',
  })
  return response.data as Blob
}
