import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"

import { useCustomFetch } from "./useCustomFetch"

export interface PaginatedTransactionsResult {
  data: PaginatedResponse<Transaction[]> | null
  loading: boolean
  fetchAll: (append?: boolean) => Promise<void>
  invalidateData: () => void
  hasLoadedAllPages: boolean
}

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async (append = true) => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }
      //Modified reponse to append the data together
      const newTransactions = response.data
      const oldTransactions = previousResponse.data

      const updatedTransactions = append ? [...oldTransactions,...newTransactions] : newTransactions

      return { data: updatedTransactions, nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  const hasLoadedAllPages = paginatedTransactions !== null && paginatedTransactions.nextPage === null


  return { data: paginatedTransactions, loading, fetchAll, invalidateData, hasLoadedAllPages } }

