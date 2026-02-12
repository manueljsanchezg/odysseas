import { api } from "./api"

export const findCitiesByName = async (name: string) => {
  try {
    const response = await api.get(`/cities/${name}`)
    return { success: true, data: response.data }
  } catch {
    return { success: false, errorType: 'SERVER' }
  }
}