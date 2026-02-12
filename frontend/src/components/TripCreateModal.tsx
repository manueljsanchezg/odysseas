import { useNavigate } from '@solidjs/router'
import { Component, Show } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import * as v from 'valibot'

import { createTrip } from '../api/trip.service'

export interface CreateTripData {
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
}

export enum TripStatus {
  WISHLIST = 'WISHLIST',
  PLANNED = 'PLANNED',
  ORGANIZED = 'ORGANIZED',
  COMPLETED = 'COMPLETED',
}

const CreateTripSchema = v.pipe(
  v.object({
    title: v.pipe(v.string(), v.nonEmpty('Title required'), v.minLength(4, 'Min 4 chars')),
    description: v.pipe(v.string(), v.nonEmpty('Description required')),
    status: v.enum(TripStatus, 'Invalid status'),
    startDate: v.pipe(v.string(), v.isoDate('Invalid date')),
    endDate: v.pipe(v.string(), v.isoDate('Invalid date')),
  }),
  v.forward(
    v.check((input) => new Date(input.endDate) > new Date(input.startDate), 'End date must be after start'),
    ['endDate']
  )
)

const TripCreateModal: Component<{ onClose: () => void }> = (props) => {
  const navigate = useNavigate()
  const [tripData, setTripData] = createStore<CreateTripData>({
    title: '', description: '', status: TripStatus.WISHLIST, startDate: '', endDate: ''
  })
  const [tripErrors, setTripErrors] = createStore<CreateTripData>({
    title: '', description: '', status: '', startDate: '', endDate: ''
  })

  const handleTripCreate = async (e: Event) => {
    e.preventDefault()
    setTripErrors({ title: '', description: '', status: '', startDate: '', endDate: '' })
    const data = unwrap(tripData)
    const parse = v.safeParse(CreateTripSchema, data)

    if (parse.success) {
      const result = await createTrip(data)
      if (result.success) navigate(`/trips/${result.data.tripId}`)
    } else {
      if (parse.issues.length > 0) {
        parse.issues.map((i) => setTripErrors(i.path?.[0].key as keyof CreateTripData, i.message))
      }
    }
  }

  return (
    <div class="modal modal-open z-50">
      <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-2xl text-center mb-6">New Adventure</h3>

        <form onSubmit={handleTripCreate} class="flex flex-col gap-4">

          <div class="flex flex-col w-full">
            <label class="label"><span class="label-text font-bold">Title</span></label>
            <input
              type="text"
              placeholder="Ej. Summer in Tokyo"
              value={tripData.title}
              onInput={(e) => setTripData('title', e.target.value)}
              class={`input input-bordered w-full ${tripErrors.title ? 'input-error' : ''}`}
            />
            <Show when={tripErrors.title}><span class="text-error text-xs mt-1">{tripErrors.title}</span></Show>
          </div>

          <div class="flex flex-col">
            <label class="label"><span class="label-text font-bold">Description</span></label>
            <textarea
              class={`textarea textarea-bordered w-full h-24 ${tripErrors.description ? 'textarea-error' : ''}`}
              placeholder="Notes..."
              value={tripData.description}
              onInput={(e) => setTripData('description', e.target.value)}
            ></textarea>
            <Show when={tripErrors.description}><span class="text-error text-xs mt-1">{tripErrors.description}</span></Show>
          </div>

          <div class="flex gap-4">
            <div class="form-control w-1/2">
              <label class="label"><span class="label-text font-bold">Start</span></label>
              <input type="date" value={tripData.startDate} onInput={(e) => setTripData('startDate', e.target.value)} class="input input-bordered" />
              <Show when={tripErrors.startDate}><span class="text-error text-xs mt-1">{tripErrors.startDate}</span></Show>
            </div>
            <div class="form-control w-1/2">
              <label class="label"><span class="label-text font-bold">End</span></label>
              <input type="date" value={tripData.endDate} onInput={(e) => setTripData('endDate', e.target.value)} class="input input-bordered" />
              <Show when={tripErrors.endDate}><span class="text-error text-xs mt-1">{tripErrors.endDate}</span></Show>
            </div>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Status</span></label>
            <select
              class="select select-bordered w-full"
              value={tripData.status}
              onInput={(e) => setTripData('status', e.target.value)}
            >
              <option value="WISHLIST">Wishlist</option>
              <option value="PLANNED">Planned</option>
              <option value="ORGANIZED">Organized</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div class="modal-action mt-6">
            <button type="button" onClick={props.onClose} class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Trip</button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop">
        <button type="button" class="w-full h-full cursor-default" onClick={props.onClose}>close</button>
      </div>
    </div>
  )
}

export default TripCreateModal