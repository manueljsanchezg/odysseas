import { Component, createEffect, createSignal, For, Show } from "solid-js"
import { findCitiesByName } from "../api/cities.service"
import { useNavigate } from "@solidjs/router"
import { createTripCities } from "../api/trip.service"

interface City {
    id: number
    name: string
    countryIso: string
}

interface ModalProps {
    onClose: () => void
    onSuccess: () => void
    tripId: number
}

const AddCitiesModal: Component<ModalProps> = (props) => {
    const navigate = useNavigate()

    const [cityName, setCityName] = createSignal<string>("")
    const [cities, setCities] = createSignal<City[] | null>(null)

    const [selectedCities, setSelectedCities] = createSignal<City[]>([])
    const [isLoading, setIsLoading] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)

    createEffect(async () => {
        const query = cityName()
        if (query.length === 0) {
            setCities(null)
            return
        }
        try {
            const result = await findCitiesByName(query)
            setCities(result.data)
        } catch (error) {
            console.error(error)
            setCities([])
        }
    })

    const handleSelectCity = (city: City) => {
        if (selectedCities().some(selected => selected.id === city.id)) return

        setSelectedCities((prev) => [...prev, city])
        setCityName("")
        setCities(null)
    }

    const removeSelectedCity = (cityId: number) => {
        setSelectedCities((prev) => prev.filter(c => c.id !== cityId))
    }

    const handleSubmit = async () => {
        if (selectedCities().length === 0) return

        setIsLoading(true)

        const citiesToTrip = selectedCities().map(c => c.id)

        const response = await createTripCities(props.tripId, citiesToTrip)

        if (!response.success) {
            setIsLoading(false)
            setError("Error adding cities to this trip")
            return
        }
        props.onSuccess()
        props.onClose()

        setIsLoading(false)

    }

    return (
        <div class="modal modal-open z-50">
            <div class="modal-box w-11/12 max-w-lg overflow-visible">
                <div class="relative">
                    <h3 class="font-bold text-lg mb-4">Add Cities to Trip</h3>

                    <div class="flex flex-col gap-2 relative">
                        <input
                            class="input input-bordered w-full"
                            type="text"
                            placeholder="Type a city name..."
                            value={cityName()}
                            onInput={(e) => setCityName(e.currentTarget.value)}
                        />

                        <Show when={cities() && cities()!.length > 0}>
                            <ul class="absolute top-12 left-0 w-full bg-base-100 shadow-xl rounded-box z-50 max-h-60 overflow-y-auto border border-base-200">
                                <For each={cities()}>
                                    {(c) => (
                                        <li
                                            class="p-3 hover:bg-base-200 cursor-pointer border-b border-base-100 last:border-none flex justify-between items-center"
                                            onClick={() => handleSelectCity(c)}
                                        >
                                            <span class="font-semibold">{c.name}</span>
                                            <span class="badge badge-ghost badge-sm">{c.countryIso}</span>
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </Show>
                    </div>
                </div>

                <div class="mt-6">
                    <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Selected to add:</h4>
                    <div class="flex flex-wrap gap-2 min-h-12">
                        <For each={selectedCities()}>
                            {(c) => (
                                <div class="badge badge-primary gap-2 p-3 text-white">
                                    {c.name}
                                    <button onClick={() => removeSelectedCity(c.id)} class="btn btn-xs btn-circle btn-ghost text-white">✕</button>
                                </div>
                            )}
                        </For>
                        <Show when={selectedCities().length === 0}>
                            <p class="text-gray-400 text-sm italic py-2">No cities selected yet.</p>
                        </Show>
                    </div>

                    <Show when={error()}>
                        <p class="text-red-400 py-2">{error()}</p>
                    </Show>

                    <button
                        onClick={handleSubmit}
                        disabled={selectedCities().length === 0 || isLoading()}
                        class="btn btn-primary w-full mt-6"
                    >
                        {isLoading() ? <span class="loading loading-spinner"></span> : "Confirm & Add Cities"}
                    </button>
                </div>
            </div>
            <div class="modal-backdrop">
                <button type="button" class="cursor-default" onClick={props.onClose}>close</button>
            </div>
        </div>
    )
}

export default AddCitiesModal