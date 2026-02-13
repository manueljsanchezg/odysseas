import { AxiosError } from 'axios'

import { CreateTripData } from '../components/TripCreateModal'
import { api } from './api'

export const createTrip = async (tripData: CreateTripData) => {
  try {
    const response = await api.post('/trips', tripData)
    return { success: true, data: response.data }
  } catch {
    return { success: false, errorType: 'SERVER' }
  }
}

export const findTripsByUserId = async () => {
  try {
    const response = await api.get('/trips')
    return { success: true, trips: response.data }
  } catch {
    return { success: false, errorType: 'SERVER' }
  }
}

export const findTripByIdAndUserId = async (tripId: number) => {
  try {
    const response = await api.get(`/trips/${tripId}`)
    return { success: true, trip: response.data }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.status === 404) return { success: false, errorType: 'NOT_FOUND' }
      return { success: false, errorType: 'SERVER' }
    } else {
      return { success: false, errorType: 'SERVER' }
    }
  }
}

export const createTripCities = async (tripId: number, citiesId: number[]) => {
  try {
    const response = await api.post(`/trips/${tripId}/cities`, {citiesId})
    return { success: true, data: response.data }
  } catch {
    return { success: false, errorType: 'SERVER' }
  }
}