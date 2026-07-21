# Exemple complet : Service de réservation

Voici un exemple complet pour créer un service de réservation depuis zéro.

## 1. Types (`src/features/booking/types.ts`)

```typescript
export interface Booking {
  id: number;
  place_id: number;
  place_name: string;
  place_photo: string;
  user_id: number;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests?: string;
  created_at: string;
}

export interface CreateBookingData {
  place_id: number;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
}

export interface BookingAvailability {
  date: string;
  available_slots: string[];
}
```

## 2. API Layer (`src/features/booking/booking.api.ts`)

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { Booking, CreateBookingData, BookingAvailability } from './types';

export const bookingApi = {
  // GET /bookings - Liste des réservations de l'utilisateur
  getMyBookings: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiGet<PaginatedResponse<Booking>>(`/bookings${params}`);
  },

  // GET /bookings/:id - Détails d'une réservation
  getBooking: (bookingId: number) =>
    apiGet<{ data: Booking }>(`/bookings/${bookingId}`),

  // POST /bookings - Créer une réservation
  createBooking: (data: CreateBookingData) =>
    apiPost<{ data: Booking }>('/bookings', data),

  // PATCH /bookings/:id - Modifier une réservation
  updateBooking: (bookingId: number, data: Partial<CreateBookingData>) =>
    apiPatch<{ data: Booking }>(`/bookings/${bookingId}`, data),

  // DELETE /bookings/:id - Annuler une réservation
  cancelBooking: (bookingId: number) =>
    apiDelete<void>(`/bookings/${bookingId}`),

  // GET /places/:id/availability - Disponibilités d'un lieu
  getAvailability: (placeId: number, date: string) =>
    apiGet<{ data: BookingAvailability }>(
      `/places/${placeId}/availability?date=${date}`
    ),
};
```

## 3. React Hook (`src/features/booking/useBooking.ts`)

```typescript
import { useState } from 'react';
import { bookingApi } from './booking.api';
import type { Booking, CreateBookingData } from './types';

export function useBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les réservations
  async function loadBookings(status?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getMyBookings(status);
      setBookings(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }

  // Créer une réservation
  async function createBooking(data: CreateBookingData) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.createBooking(data);
      setBookings(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la création';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Annuler une réservation
  async function cancelBooking(bookingId: number) {
    setIsLoading(true);
    setError(null);
    try {
      await bookingApi.cancelBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'annulation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    bookings,
    isLoading,
    error,
    loadBookings,
    createBooking,
    cancelBooking,
  };
}
```

## 4. Hook pour les disponibilités (`src/features/booking/useAvailability.ts`)

```typescript
import { useState, useEffect } from 'react';
import { bookingApi } from './booking.api';
import type { BookingAvailability } from './types';

export function useAvailability(placeId: number, date: string) {
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId || !date) return;

    async function loadAvailability() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await bookingApi.getAvailability(placeId, date);
        setAvailability(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    }

    loadAvailability();
  }, [placeId, date]);

  return { availability, isLoading, error };
}
```

## 5. Composant de réservation (`src/components/booking/BookingForm.tsx`)

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useBooking } from '@/features/booking/useBooking';
import { useAvailability } from '@/features/booking/useAvailability';
import type { CreateBookingData } from '@/features/booking/types';

interface BookingFormProps {
  placeId: number;
  placeName: string;
  onSuccess?: () => void;
}

export function BookingForm({ placeId, placeName, onSuccess }: BookingFormProps) {
  const { createBooking, isLoading } = useBooking();
  const [selectedDate, setSelectedDate] = useState('2024-03-20');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');

  const { availability } = useAvailability(placeId, selectedDate);

  async function handleSubmit() {
    if (!selectedTime) {
      Alert.alert('Erreur', 'Veuillez sélectionner un horaire');
      return;
    }

    try {
      const bookingData: CreateBookingData = {
        place_id: placeId,
        date: selectedDate,
        time: selectedTime,
        guests: parseInt(guests, 10),
        special_requests: specialRequests || undefined,
      };

      await createBooking(bookingData);
      Alert.alert('Succès', 'Réservation créée avec succès');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la réservation');
    }
  }

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4">Réserver - {placeName}</Text>

      {/* Date selector */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Date</Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          className="border rounded-lg p-3"
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* Time slots */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Horaire</Text>
        <View className="flex-row flex-wrap gap-2">
          {availability?.available_slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              onPress={() => setSelectedTime(slot)}
              className={`px-4 py-2 rounded-lg ${
                selectedTime === slot 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`}
            >
              <Text className={selectedTime === slot ? 'text-white' : 'text-black'}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Number of guests */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Nombre de personnes</Text>
        <TextInput
          value={guests}
          onChangeText={setGuests}
          keyboardType="number-pad"
          className="border rounded-lg p-3"
        />
      </View>

      {/* Special requests */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Demandes spéciales (optionnel)</Text>
        <TextInput
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
          className="border rounded-lg p-3"
          placeholder="Allergies, préférences, etc."
        />
      </View>

      {/* Submit button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`p-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
      >
        <Text className="text-white text-center font-bold">
          {isLoading ? 'Chargement...' : 'Confirmer la réservation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 6. Écran liste des réservations (`src/app/(bookings)/index.tsx`)

```typescript
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useBooking } from '@/features/booking/useBooking';
import type { Booking } from '@/features/booking/types';

export default function BookingsScreen() {
  const { bookings, isLoading, error, loadBookings, cancelBooking } = useBooking();

  useEffect(() => {
    loadBookings();
  }, []);

  function handleCancel(bookingId: number) {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui', 
          onPress: () => cancelBooking(bookingId),
          style: 'destructive'
        },
      ]
    );
  }

  function renderBooking({ item }: { item: Booking }) {
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow">
        <Text className="text-lg font-bold">{item.place_name}</Text>
        <Text className="text-gray-600 mt-1">
          {item.date} à {item.time}
        </Text>
        <Text className="text-gray-600">
          {item.guests} personne{item.guests > 1 ? 's' : ''}
        </Text>
        
        <View className="flex-row justify-between items-center mt-3">
          <View className={`px-3 py-1 rounded-full ${
            item.status === 'confirmed' ? 'bg-green-100' :
            item.status === 'pending' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <Text className={`text-sm font-semibold ${
              item.status === 'confirmed' ? 'text-green-700' :
              item.status === 'pending' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {item.status === 'confirmed' ? 'Confirmé' :
               item.status === 'pending' ? 'En attente' :
               'Annulé'}
            </Text>
          </View>

          {item.status === 'confirmed' && (
            <TouchableOpacity
              onPress={() => handleCancel(item.id)}
              className="px-4 py-2 bg-red-500 rounded-lg"
            >
              <Text className="text-white font-semibold">Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (isLoading && bookings.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={() => loadBookings()} 
          className="mt-4 px-6 py-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-white">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-center">
              Aucune réservation pour le moment
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

## 7. Test du service

```typescript
// __tests__/booking.api.test.ts
import { bookingApi } from '@/features/booking/booking.api';

describe('Booking API', () => {
  it('devrait créer une réservation', async () => {
    const bookingData = {
      place_id: 1,
      date: '2024-03-20',
      time: '19:00',
      guests: 2,
    };

    const response = await bookingApi.createBooking(bookingData);
    expect(response.data).toHaveProperty('id');
    expect(response.data.status).toBe('pending');
  });

  it('devrait récupérer les disponibilités', async () => {
    const response = await bookingApi.getAvailability(1, '2024-03-20');
    expect(response.data).toHaveProperty('available_slots');
    expect(Array.isArray(response.data.available_slots)).toBe(true);
  });
});
```

## Points clés

1. **Séparation des responsabilités** : Types → API → Hook → Component
2. **Gestion d'état** : Loading, error, data dans les hooks
3. **Typage strict** : Tous les types définis pour la sécurité
4. **Gestion d'erreurs** : Try/catch avec messages utilisateur
5. **UX** : États de chargement, messages d'erreur, confirmations
6. **Réutilisabilité** : Hooks réutilisables dans différents composants

Ce pattern peut être appliqué pour n'importe quel service de l'API backend !
