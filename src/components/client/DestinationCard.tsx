import { MapPin, Users } from "lucide-react";
import { useState } from "react";
import { ReservationForm } from "./ReservationForm";

interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  price: number;
  max_people: number;
  image_url: string;
}

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  const [open, setOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(destination.price)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {destination.name}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{destination.location}</span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {destination.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Máx. {destination.max_people} personas
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Reservar Ahora
          </button>
        </div>
      </div>

      {open && (
        <ReservationForm
          destination={destination}
          onClose={() => setOpen(false)}
          onSuccess={() => console.log("Reserva creada con éxito")}
        />
      )}
    </>
  );
}
